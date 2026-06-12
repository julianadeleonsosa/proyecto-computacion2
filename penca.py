# ============================================================
#  penca.py — Lógica de negocio del sistema
# ============================================================
import hashlib
from typing import Optional, List, Tuple
from datetime import datetime

import db_connection as db
from models import (
    Participante, Partido, Pronostico, Puntaje, EntradaRanking,
    participantes_cache, partidos_cache, matriz_pronosticos, ranking_cache
)


# ═══════════════════════════════════════════════════════════
#  PARTICIPANTES
# ═══════════════════════════════════════════════════════════

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


def registrar_participante(nombre: str, email: str, password: str) -> Tuple[bool, str]:
    """
    Registra un nuevo participante.
    Retorna (True, mensaje_ok) o (False, mensaje_error).
    """
    if not nombre.strip() or not email.strip() or not password.strip():
        return False, "Todos los campos son obligatorios."
    if len(password) < 6:
        return False, "La contraseña debe tener al menos 6 caracteres."
    pwd_hash = hash_password(password)
    try:
        cur = db.get_cursor()
        cur.execute(
            "INSERT INTO participantes (nombre, email, password_hash) VALUES (%s, %s, %s)",
            (nombre.strip(), email.strip().lower(), pwd_hash)
        )
        nuevo_id = cur.lastrowid
        p = Participante(nombre=nombre.strip(), email=email.strip().lower(),
                         password_hash=pwd_hash, id=nuevo_id)
        participantes_cache.append(p)
        return True, f"Participante '{nombre}' registrado con ID {nuevo_id}."
    except Exception as e:
        if 'Duplicate entry' in str(e):
            return False, f"El email '{email}' ya está registrado."
        return False, f"Error al registrar: {e}"


def autenticar(email: str, password: str) -> Optional[dict]:
    """Autentica un participante. Retorna dict con datos o None."""
    cur = db.get_cursor()
    cur.execute(
        "SELECT * FROM participantes WHERE email=%s AND activo=TRUE",
        (email.strip().lower(),)
    )
    row = cur.fetchone()
    if row and row['password_hash'] == hash_password(password):
        return row
    return None


def listar_participantes() -> List[dict]:
    cur = db.get_cursor()
    cur.execute("SELECT id_participante, nombre, email, fecha_registro FROM participantes WHERE activo=TRUE AND es_admin=FALSE ORDER BY nombre")
    return cur.fetchall()


# ═══════════════════════════════════════════════════════════
#  PARTIDOS
# ═══════════════════════════════════════════════════════════

def listar_partidos(fase: str = None, grupo: str = None) -> List[dict]:
    """Lista todos los partidos con nombres de equipos y resultados."""
    query = "SELECT * FROM v_partidos_completos WHERE 1=1"
    params = []
    if fase:
        query += " AND fase = %s"
        params.append(fase)
    if grupo:
        query += " AND grupo = %s"
        params.append(grupo.upper())
    query += " ORDER BY fecha_hora"
    cur = db.get_cursor()
    cur.execute(query, params)
    return cur.fetchall()


def obtener_partido(id_partido: int) -> Optional[dict]:
    cur = db.get_cursor()
    cur.execute("SELECT * FROM v_partidos_completos WHERE id_partido = %s", (id_partido,))
    return cur.fetchone()


def partidos_sin_pronostico(id_participante: int) -> List[dict]:
    """Devuelve partidos donde el participante aún no ingresó pronóstico."""
    cur = db.get_cursor()
    cur.execute("""
        SELECT v.*
          FROM v_partidos_completos v
         WHERE v.estado = 'programado'
           AND v.id_partido NOT IN (
               SELECT id_partido FROM pronosticos
                WHERE id_participante = %s
           )
         ORDER BY v.fecha_hora
    """, (id_participante,))
    return cur.fetchall()


# ═══════════════════════════════════════════════════════════
#  PRONÓSTICOS
# ═══════════════════════════════════════════════════════════

def ingresar_pronostico(id_participante: int, id_partido: int,
                        goles_local: int, goles_visitante: int) -> Tuple[bool, str]:
    """
    Ingresa o actualiza el pronóstico de un participante para un partido.
    Solo se permite si el partido aún no ha comenzado.
    """
    # Verificar que el partido no haya comenzado
    cur = db.get_cursor()
    cur.execute("SELECT estado FROM resultados WHERE id_partido = %s", (id_partido,))
    row = cur.fetchone()
    if row and row['estado'] != 'programado':
        return False, "El partido ya comenzó o finalizó. No se puede modificar el pronóstico."

    if goles_local < 0 or goles_visitante < 0:
        return False, "Los goles no pueden ser negativos."

    try:
        cur.execute("""
            INSERT INTO pronosticos (id_participante, id_partido, goles_local, goles_visitante)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                goles_local     = VALUES(goles_local),
                goles_visitante = VALUES(goles_visitante),
                fecha_ingreso   = CURRENT_TIMESTAMP
        """, (id_participante, id_partido, goles_local, goles_visitante))

        # Actualizar matriz en memoria
        if id_participante not in matriz_pronosticos:
            matriz_pronosticos[id_participante] = {}
        matriz_pronosticos[id_participante][id_partido] = Pronostico(
            id_participante=id_participante, id_partido=id_partido,
            goles_local=goles_local, goles_visitante=goles_visitante
        )
        return True, f"Pronóstico guardado: {goles_local} - {goles_visitante}"
    except Exception as e:
        return False, f"Error al guardar pronóstico: {e}"


def pronosticos_participante(id_participante: int) -> List[dict]:
    """Devuelve todos los pronósticos de un participante con info del partido."""
    cur = db.get_cursor()
    cur.execute("""
        SELECT pr.*,
               v.equipo_local, v.equipo_visitante,
               v.fecha_hora, v.grupo, v.estado,
               v.goles_local AS resultado_local,
               v.goles_visitante AS resultado_visitante,
               pt.puntos, pt.tipo_acierto
          FROM pronosticos pr
          JOIN v_partidos_completos v  ON pr.id_partido = v.id_partido
     LEFT JOIN puntajes pt             ON pr.id_partido = pt.id_partido
                                     AND pr.id_participante = pt.id_participante
         WHERE pr.id_participante = %s
         ORDER BY v.fecha_hora
    """, (id_participante,))
    return cur.fetchall()


# ═══════════════════════════════════════════════════════════
#  RESULTADOS Y PUNTAJES
# ═══════════════════════════════════════════════════════════

def calcular_puntaje(gl_pron: int, gv_pron: int, gl_real: int, gv_real: int) -> Tuple[int, str]:
    """
    Calcula puntos según las reglas de la penca:
      3 pts → resultado exacto
      2 pts → diferencia de goles correcta (y no es empate)
      1 pt  → ganador o empate correcto
      0 pts → incorrecto
    """
    if gl_pron == gl_real and gv_pron == gv_real:
        return 3, 'exacto'
    diff_pron = gl_pron - gv_pron
    diff_real = gl_real - gv_real
    if diff_pron == diff_real and diff_pron != 0:
        return 2, 'diferencia'
    signo_pron = (1 if gl_pron > gv_pron else (-1 if gl_pron < gv_pron else 0))
    signo_real = (1 if gl_real > gv_real else (-1 if gl_real < gv_real else 0))
    if signo_pron == signo_real:
        return 1, 'ganador'
    return 0, 'incorrecto'


def ingresar_resultado(id_partido: int, goles_local: int, goles_visitante: int,
                       id_admin: int) -> Tuple[bool, str]:
    """Ingresa el resultado real de un partido y calcula puntajes automáticamente."""
    if goles_local < 0 or goles_visitante < 0:
        return False, "Los goles no pueden ser negativos."
    try:
        cur = db.get_cursor()
        cur.execute("""
            UPDATE resultados
               SET goles_local = %s, goles_visitante = %s,
                   estado = 'finalizado', ingresado_por = %s
             WHERE id_partido = %s
        """, (goles_local, goles_visitante, id_admin, id_partido))

        # Calcular puntajes llamando al stored procedure
        cur.execute("CALL calcular_puntajes_partido(%s)", (id_partido,))

        # Sincronizar ranking en memoria
        cur.execute("""
            SELECT id_participante, SUM(puntos) AS total
              FROM puntajes
             GROUP BY id_participante
        """)
        for row in cur.fetchall():
            ranking_cache[row['id_participante']] = row['total']

        return True, f"Resultado guardado. Puntajes calculados para partido {id_partido}."
    except Exception as e:
        return False, f"Error al ingresar resultado: {e}"


# ═══════════════════════════════════════════════════════════
#  RANKING Y ESTADÍSTICAS
# ═══════════════════════════════════════════════════════════

def obtener_ranking() -> List[dict]:
    cur = db.get_cursor()
    cur.execute("SELECT * FROM v_ranking ORDER BY posicion")
    return cur.fetchall()


def estadisticas_generales() -> dict:
    """Devuelve un resumen estadístico de la penca."""
    cur = db.get_cursor()
    cur.execute("SELECT COUNT(*) AS total FROM participantes WHERE activo=TRUE AND es_admin=FALSE")
    total_participantes = cur.fetchone()['total']

    cur.execute("SELECT COUNT(*) AS total FROM pronosticos")
    total_pronosticos = cur.fetchone()['total']

    cur.execute("SELECT COUNT(*) AS total FROM resultados WHERE estado='finalizado'")
    partidos_jugados = cur.fetchone()['total']

    cur.execute("SELECT SUM(puntos) AS total FROM puntajes")
    row = cur.fetchone()
    total_puntos_repartidos = row['total'] or 0

    cur.execute("""
        SELECT p.nombre, SUM(pt.puntos) AS pts
          FROM participantes p JOIN puntajes pt ON p.id_participante = pt.id_participante
         GROUP BY p.id_participante ORDER BY pts DESC LIMIT 1
    """)
    lider = cur.fetchone()

    return {
        'total_participantes':    total_participantes,
        'total_pronosticos':      total_pronosticos,
        'partidos_jugados':       partidos_jugados,
        'total_puntos_repartidos': total_puntos_repartidos,
        'lider':                  lider,
    }

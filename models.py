# ============================================================
#  models.py — Estructuras de datos del sistema
#  Uso: dataclasses (Python 3.7+), listas, diccionarios, matrices
# ============================================================
from dataclasses import dataclass, field
from typing import Optional, List, Dict
from datetime import datetime


# ──────────────────────────────────────────
# Entidades principales (dataclasses)
# ──────────────────────────────────────────

@dataclass
class Participante:
    nombre:        str
    email:         str
    password_hash: str
    es_admin:      bool = False
    id:            Optional[int] = None
    activo:        bool = True
    fecha_registro: Optional[datetime] = None


@dataclass
class Equipo:
    nombre:       str
    nombre_corto: str
    codigo_fifa:  str
    confederacion: str
    grupo:        str
    id:           Optional[int] = None
    bandera_url:  Optional[str] = None


@dataclass
class Partido:
    id_local:     int
    id_visitante: int
    fecha_hora:   datetime
    grupo:        Optional[str]
    estadio:      str
    ciudad:       str
    pais_sede:    str
    fase:         str = 'grupos'
    numero_partido: Optional[int] = None
    id:           Optional[int] = None
    # Para vistas enriquecidas
    equipo_local:     str = ''
    equipo_visitante: str = ''
    codigo_local:     str = ''
    codigo_visitante: str = ''
    goles_local:      Optional[int] = None
    goles_visitante:  Optional[int] = None
    estado:           str = 'programado'


@dataclass
class Pronostico:
    id_participante: int
    id_partido:      int
    goles_local:     int
    goles_visitante: int
    id:              Optional[int] = None
    fecha_ingreso:   Optional[datetime] = None


@dataclass
class Puntaje:
    id_participante: int
    id_partido:      int
    puntos:          int
    tipo_acierto:    str   # exacto | diferencia | ganador | incorrecto
    id:              Optional[int] = None


@dataclass
class EntradaRanking:
    posicion:         int
    nombre:           str
    email:            str
    total_puntos:     int
    exactos:          int
    diferencias:      int
    ganadores:        int
    incorrectos:      int
    partidos_jugados: int
    pct_acierto:      float
    id_participante:  Optional[int] = None


# ──────────────────────────────────────────
# Estructuras de datos en memoria
# ──────────────────────────────────────────

# Lista de participantes cargados en sesión
participantes_cache: List[Participante] = []

# Diccionario de equipos: {id_equipo: Equipo}
equipos_cache: Dict[int, Equipo] = {}

# Lista de partidos
partidos_cache: List[Partido] = []

# Matriz de pronósticos en memoria:
# matriz[id_participante][id_partido] = Pronostico
matriz_pronosticos: Dict[int, Dict[int, Pronostico]] = {}

# Ranking en memoria: {id_participante: total_puntos}
ranking_cache: Dict[int, int] = {}

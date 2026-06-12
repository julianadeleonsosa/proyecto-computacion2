# ============================================================
#  app.py — Servidor web Flask (API + páginas)
#  Ejecutar: python app.py
# ============================================================
from flask import Flask, request, jsonify, session, redirect, url_for, send_from_directory
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
import penca
import db_connection as db

app = Flask(__name__, static_folder='../web', static_url_path='')
app.secret_key = os.getenv('SECRET_KEY', 'penca-mundial-2026-secret-key-cambiar-en-produccion')


# ─────────────────────────────────────────
#  Páginas HTML estáticas
# ─────────────────────────────────────────

@app.route('/')
def index():
    return send_from_directory('../web', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('../web', filename)


# ─────────────────────────────────────────
#  API: Autenticación
# ─────────────────────────────────────────

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    user = penca.autenticar(data.get('email', ''), data.get('password', ''))
    if user:
        session['user_id']   = user['id_participante']
        session['user_name'] = user['nombre']
        session['is_admin']  = user['es_admin']
        return jsonify({'ok': True, 'nombre': user['nombre'],
                        'id': user['id_participante'],
                        'es_admin': bool(user['es_admin'])})
    return jsonify({'ok': False, 'error': 'Email o contraseña incorrectos.'}), 401


@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({'ok': True})


@app.route('/api/session')
def api_session():
    if 'user_id' in session:
        return jsonify({'logged': True,
                        'id': session['user_id'],
                        'nombre': session['user_name'],
                        'es_admin': session.get('is_admin', False)})
    return jsonify({'logged': False})


# ─────────────────────────────────────────
#  API: Participantes
# ─────────────────────────────────────────

@app.route('/api/registro', methods=['POST'])
def api_registro():
    data = request.get_json()
    ok, msg = penca.registrar_participante(
        data.get('nombre', ''),
        data.get('email', ''),
        data.get('password', '')
    )
    if ok:
        return jsonify({'ok': True, 'mensaje': msg})
    return jsonify({'ok': False, 'error': msg}), 400


@app.route('/api/participantes')
def api_participantes():
    return jsonify(penca.listar_participantes())


# ─────────────────────────────────────────
#  API: Partidos
# ─────────────────────────────────────────

@app.route('/api/partidos')
def api_partidos():
    fase  = request.args.get('fase')
    grupo = request.args.get('grupo')
    rows  = penca.listar_partidos(fase=fase, grupo=grupo)
    # Serializar datetime
    for r in rows:
        if r.get('fecha_hora'):
            r['fecha_hora'] = r['fecha_hora'].strftime('%Y-%m-%d %H:%M')
    return jsonify(rows)


@app.route('/api/partidos/pendientes')
def api_partidos_pendientes():
    if 'user_id' not in session:
        return jsonify({'error': 'No autenticado'}), 401
    rows = penca.partidos_sin_pronostico(session['user_id'])
    for r in rows:
        if r.get('fecha_hora'):
            r['fecha_hora'] = r['fecha_hora'].strftime('%Y-%m-%d %H:%M')
    return jsonify(rows)


# ─────────────────────────────────────────
#  API: Pronósticos
# ─────────────────────────────────────────

@app.route('/api/pronostico', methods=['POST'])
def api_pronostico():
    if 'user_id' not in session:
        return jsonify({'error': 'Debes iniciar sesión.'}), 401
    data = request.get_json()
    ok, msg = penca.ingresar_pronostico(
        session['user_id'],
        int(data.get('id_partido', 0)),
        int(data.get('goles_local', 0)),
        int(data.get('goles_visitante', 0))
    )
    if ok:
        return jsonify({'ok': True, 'mensaje': msg})
    return jsonify({'ok': False, 'error': msg}), 400


@app.route('/api/mis-pronosticos')
def api_mis_pronosticos():
    if 'user_id' not in session:
        return jsonify({'error': 'No autenticado'}), 401
    rows = penca.pronosticos_participante(session['user_id'])
    for r in rows:
        if r.get('fecha_hora'):
            r['fecha_hora'] = r['fecha_hora'].strftime('%Y-%m-%d %H:%M')
    return jsonify(rows)


# ─────────────────────────────────────────
#  API: Resultados (solo admin)
# ─────────────────────────────────────────

@app.route('/api/resultado', methods=['POST'])
def api_resultado():
    if not session.get('is_admin'):
        return jsonify({'error': 'Acceso restringido.'}), 403
    data = request.get_json()
    ok, msg = penca.ingresar_resultado(
        int(data.get('id_partido', 0)),
        int(data.get('goles_local', 0)),
        int(data.get('goles_visitante', 0)),
        session['user_id']
    )
    if ok:
        return jsonify({'ok': True, 'mensaje': msg})
    return jsonify({'ok': False, 'error': msg}), 400


# ─────────────────────────────────────────
#  API: Ranking y Estadísticas
# ─────────────────────────────────────────

@app.route('/api/ranking')
def api_ranking():
    return jsonify(penca.obtener_ranking())


@app.route('/api/estadisticas')
def api_estadisticas():
    stats = penca.estadisticas_generales()
    if stats.get('lider') and stats['lider'].get('pts') is not None:
        stats['lider']['pts'] = int(stats['lider']['pts'])
    return jsonify(stats)


# ─────────────────────────────────────────
#  Inicio
# ─────────────────────────────────────────

if __name__ == '__main__':
    print("=" * 50)
    print("  PENCA MUNDIAL 2026 — Servidor Flask")
    print("  http://localhost:5000")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)

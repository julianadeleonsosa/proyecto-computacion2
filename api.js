// ============================================================
//  api.js — Funciones de comunicación con el servidor Flask
// ============================================================

const API = {
  async get(url) {
    const r = await fetch(url);
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || r.statusText); }
    return r.json();
  },
  async post(url, data) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(json.error || r.statusText);
    return json;
  },

  login:           (email, password) => API.post('/api/login', { email, password }),
  logout:          ()                => API.post('/api/logout', {}),
  registro:        (d)               => API.post('/api/registro', d),
  sesion:          ()                => API.get('/api/session'),
  partidos:        (params = '')     => API.get('/api/partidos' + (params ? '?' + params : '')),
  partidosPendientes: ()             => API.get('/api/partidos/pendientes'),
  pronostico:      (d)               => API.post('/api/pronostico', d),
  misPronosticos:  ()                => API.get('/api/mis-pronosticos'),
  resultado:       (d)               => API.post('/api/resultado', d),
  ranking:         ()                => API.get('/api/ranking'),
  estadisticas:    ()                => API.get('/api/estadisticas'),
  participantes:   ()                => API.get('/api/participantes'),
};

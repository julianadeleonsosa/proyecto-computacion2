// ============================================================
//  app.js — Lógica compartida: auth, sesión, modales, navbar
// ============================================================

let SESSION = null;

// ─── Inicialización ───
document.addEventListener('DOMContentLoaded', async () => {
  await verificarSesion();
});

async function verificarSesion() {
  try {
    SESSION = await API.sesion();
    actualizarNavbar(SESSION);
  } catch {
    actualizarNavbar({ logged: false });
  }
}

function actualizarNavbar(s) {
  const authEl  = document.getElementById('nav-auth');
  const userEl  = document.getElementById('nav-user');
  const nameEl  = document.getElementById('nav-nombre');
  if (!authEl || !userEl) return;
  if (s && s.logged) {
    authEl.classList.add('hidden');
    userEl.classList.remove('hidden');
    if (nameEl) nameEl.textContent = s.nombre;
  } else {
    authEl.classList.remove('hidden');
    userEl.classList.add('hidden');
  }
}

// ─── Autenticación ───
async function login() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');
  clearAlert(errEl);
  if (!email || !password) { showAlert(errEl, 'Completá todos los campos.'); return; }
  try {
    SESSION = await API.login(email, password);
    SESSION.logged = true;
    actualizarNavbar(SESSION);
    closeModal('modal-login');
    location.reload();
  } catch (e) {
    showAlert(errEl, e.message || 'Error al iniciar sesión.');
  }
}

async function logout() {
  await API.logout().catch(() => {});
  SESSION = null;
  location.href = 'index.html';
}

async function registro() {
  const nombre   = document.getElementById('reg-nombre').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const errEl    = document.getElementById('reg-error');
  const okEl     = document.getElementById('reg-ok');
  clearAlert(errEl); clearAlert(okEl);
  if (!nombre || !email || !password) { showAlert(errEl, 'Completá todos los campos.'); return; }
  try {
    await API.registro({ nombre, email, password });
    showAlert(okEl, '¡Cuenta creada! Ahora podés iniciar sesión.');
    document.getElementById('reg-nombre').value = '';
    document.getElementById('reg-email').value  = '';
    document.getElementById('reg-password').value = '';
  } catch (e) {
    showAlert(errEl, e.message || 'Error al registrarse.');
  }
}

// ─── Modales ───
function openModal(id) {
  document.getElementById(id)?.classList.remove('hidden');
}
function closeModal(id) {
  document.getElementById(id)?.classList.add('hidden');
}
function switchModal(from, to) {
  closeModal(from);
  openModal(to);
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.add('hidden');
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
  }
});

// ─── Alertas ───
function showAlert(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
}
function clearAlert(el) {
  if (!el) return;
  el.textContent = '';
  el.classList.add('hidden');
}

// ─── Helpers ───
function flagEmoji(codigo) {
  const flags = {
    USA:'🇺🇸', CAN:'🇨🇦', URU:'🇺🇾', MEX:'🇲🇽', ECU:'🇪🇨', JAM:'🇯🇲',
    ARG:'🇦🇷', CHI:'🇨🇱', ALB:'🇦🇱', BRA:'🇧🇷', COL:'🇨🇴', PAN:'🇵🇦',
    ESP:'🇪🇸', MAR:'🇲🇦', POR:'🇵🇹', FRA:'🇫🇷', BEL:'🇧🇪', ITA:'🇮🇹',
    GER:'🇩🇪', NED:'🇳🇱', HUN:'🇭🇺', ENG:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', SVK:'🇸🇰', SRB:'🇷🇸',
    CRO:'🇭🇷', CZE:'🇨🇿', TUR:'🇹🇷', POL:'🇵🇱', AUT:'🇦🇹', ROU:'🇷🇴',
    JPN:'🇯🇵', AUS:'🇦🇺', KSA:'🇸🇦', KOR:'🇰🇷', IRN:'🇮🇷', UZB:'🇺🇿',
    SEN:'🇸🇳', NGA:'🇳🇬', RSA:'🇿🇦', EGY:'🇪🇬', CIV:'🇨🇮', ALG:'🇩🇿',
    SUI:'🇨🇭', DEN:'🇩🇰', SCO:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', VEN:'🇻🇪', PER:'🇵🇪', BOL:'🇧🇴',
  };
  return flags[codigo] || '🏳';
}

function badgePuntaje(tipo, puntos) {
  if (!tipo) return '';
  const labels = { exacto:'⭐ Exacto +3', diferencia:'✓ Diferencia +2', ganador:'✓ Ganador +1', incorrecto:'✗ Incorrecto' };
  return `<span class="puntaje-badge ${tipo}">${labels[tipo] || tipo}</span>`;
}

function formatFecha(fechaStr) {
  if (!fechaStr) return '';
  const [date, time] = fechaStr.split(' ');
  const [y, m, d] = date.split('-');
  return `${d}/${m}/${y} ${time ? time.substring(0,5) : ''}`;
}

// ─── Index: cargar estadísticas ───
async function cargarEstadisticas() {
  try {
    const s = await API.estadisticas();
    setId('stat-participantes', s.total_participantes ?? '—');
    setId('stat-pronosticos',   s.total_pronosticos ?? '—');
    setId('stat-partidos',      s.partidos_jugados ?? '—');
    setId('stat-lider',         s.lider ? s.lider.nombre : 'Sin datos');
  } catch { /* silencioso */ }
}

// ─── Index: próximos partidos ───
async function cargarProximosPartidos() {
  const cont = document.getElementById('proximos-partidos');
  if (!cont) return;
  try {
    const partidos = await API.partidos();
    const proximos = partidos.filter(p => p.estado === 'programado').slice(0, 6);
    if (!proximos.length) { cont.innerHTML = '<p class="loading">No hay partidos próximos programados.</p>'; return; }
    cont.innerHTML = proximos.map(p => tarjetaPartidoSimple(p)).join('');
  } catch (e) {
    cont.innerHTML = `<p class="loading">Error al cargar partidos.</p>`;
  }
}

function tarjetaPartidoSimple(p) {
  return `
    <div class="partido-card">
      <div class="partido-meta">
        <span class="grupo-badge">Grupo ${p.grupo}</span>
        <span>${formatFecha(p.fecha_hora)}</span>
      </div>
      <div class="partido-equipos">
        <div class="equipo-info">
          <span class="flag">${flagEmoji(p.codigo_local)}</span>
          <span class="nombre">${p.equipo_local}</span>
          <span class="codigo">${p.codigo_local}</span>
        </div>
        <div class="vs-badge">VS</div>
        <div class="equipo-info">
          <span class="flag">${flagEmoji(p.codigo_visitante)}</span>
          <span class="nombre">${p.equipo_visitante}</span>
          <span class="codigo">${p.codigo_visitante}</span>
        </div>
      </div>
      <small style="font-size:11px; color:var(--text-3)">📍 ${p.estadio}, ${p.ciudad}</small>
    </div>`;
}

// ─── Index: Top 5 ───
async function cargarTop5() {
  const cont = document.getElementById('top5-ranking');
  if (!cont) return;
  try {
    const ranking = await API.ranking();
    if (!ranking.length) { cont.innerHTML = '<p class="loading">Sin datos de ranking aún.</p>'; return; }
    const top5 = ranking.slice(0, 5);
    cont.innerHTML = `
      <table class="tabla-ranking">
        <thead><tr>
          <th class="col-pos">Pos</th>
          <th>Participante</th>
          <th class="col-pts">Pts</th>
          <th class="col-stat">Exactos</th>
          <th class="col-pct">% Acierto</th>
        </tr></thead>
        <tbody>
          ${top5.map(r => `<tr>
            <td class="col-pos">${r.posicion <= 3 ? ['🥇','🥈','🥉'][r.posicion-1] : r.posicion}</td>
            <td>${r.nombre}</td>
            <td class="col-pts">${r.total_puntos}</td>
            <td class="col-stat">${r.exactos}</td>
            <td class="col-pct">${r.pct_acierto}%</td>
          </tr>`).join('')}
        </tbody>
      </table>`;
  } catch { cont.innerHTML = '<p class="loading">Sin datos de ranking.</p>'; }
}

function setId(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

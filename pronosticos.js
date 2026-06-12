// ============================================================
//  pronosticos.js — Lógica de la página de pronósticos
// ============================================================

let tabActual = 'pendientes';
let todosPartidos = [];
let misPronosticos = [];

document.addEventListener('DOMContentLoaded', async () => {
  await verificarSesion();
  if (SESSION && SESSION.logged) {
    document.getElementById('login-required')?.classList.add('hidden');
    await cargarDatos();
  } else {
    document.getElementById('login-required')?.classList.remove('hidden');
    document.getElementById('filtros-section')?.classList.add('hidden');
    document.getElementById('partidos-container').innerHTML = '';
  }
});

async function cargarDatos() {
  try {
    [todosPartidos, misPronosticos] = await Promise.all([
      API.partidos(),
      API.misPronosticos(),
    ]);
    renderTab();
  } catch (e) {
    document.getElementById('partidos-container').innerHTML =
      `<div class="loading">Error al cargar: ${e.message}</div>`;
  }
}

function setTab(tab, btn) {
  tabActual = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderTab();
}

function filtrarPartidos() {
  renderTab();
}

function renderTab() {
  const grupo = document.getElementById('filtro-grupo')?.value || '';
  let partidos = [];

  if (tabActual === 'pendientes') {
    const conPron = new Set(misPronosticos.map(p => p.id_partido));
    partidos = todosPartidos.filter(p =>
      p.estado === 'programado' && !conPron.has(p.id_partido)
    );
  } else if (tabActual === 'todos') {
    partidos = todosPartidos;
  } else if (tabActual === 'mis') {
    partidos = misPronosticos.map(mp => {
      const partido = todosPartidos.find(p => p.id_partido === mp.id_partido) || {};
      return { ...partido, ...mp };
    });
  }

  if (grupo) partidos = partidos.filter(p => p.grupo === grupo);

  const container = document.getElementById('partidos-container');

  if (!partidos.length) {
    container.innerHTML = `
      <div class="empty-state">
        <p>${tabActual === 'pendientes' ? '¡Ya pronosticaste todos los partidos disponibles!' : 'No hay partidos para mostrar.'}</p>
        <small>${tabActual === 'pendientes' ? 'Revisá "Mis pronósticos" para ver tus predicciones.' : ''}</small>
      </div>`;
    return;
  }

  // Agrupar por grupo
  const porGrupo = {};
  partidos.forEach(p => {
    const g = p.grupo || 'Sin grupo';
    if (!porGrupo[g]) porGrupo[g] = [];
    porGrupo[g].push(p);
  });

  container.innerHTML = Object.entries(porGrupo)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([grp, pts]) => `
      <div style="margin-bottom:2rem">
        <h3 style="font-size:16px; font-weight:700; margin-bottom:1rem; color:var(--verde)">
          Grupo ${grp}
        </h3>
        <div class="partidos-grid">
          ${pts.map(p => tarjetaPronostico(p)).join('')}
        </div>
      </div>`).join('');
}

function tarjetaPronostico(p) {
  const miPron = misPronosticos.find(mp => mp.id_partido === p.id_partido);
  const finalizado = p.estado === 'finalizado';
  const enJuego   = p.estado === 'en_juego';
  const glPron = miPron ? miPron.goles_local     : 0;
  const gvPron = miPron ? miPron.goles_visitante : 0;

  const resultadoReal = finalizado
    ? `<div class="resultado-badge">⚽ ${p.goles_local} - ${p.goles_visitante}</div>`
    : enJuego
    ? `<div class="resultado-badge" style="background:#FFF3CD">🔴 En juego</div>`
    : '';

  const puntajeHtml = miPron && miPron.tipo_acierto
    ? `<div style="margin-top:8px">${badgePuntaje(miPron.tipo_acierto, miPron.puntos)}</div>`
    : '';

  const formulario = !finalizado && !enJuego
    ? `<div class="pronostico-form" style="margin-top:10px">
        <div class="score-inputs">
          <input type="number" class="score-input" id="gl-${p.id_partido}"
                 min="0" max="20" value="${glPron}" onchange="previewPron(${p.id_partido})">
          <span class="score-sep">:</span>
          <input type="number" class="score-input" id="gv-${p.id_partido}"
                 min="0" max="20" value="${gvPron}" onchange="previewPron(${p.id_partido})">
          <button class="btn-gold" onclick="guardarPronostico(${p.id_partido})">
            ${miPron ? 'Actualizar' : 'Confirmar'}
          </button>
        </div>
        <div id="msg-${p.id_partido}" style="font-size:12px; margin-top:4px"></div>
      </div>`
    : miPron
    ? `<div class="pronostico-form" style="margin-top:10px">
        <span style="font-size:13px; color:var(--text-2)">Tu pronóstico:</span>
        <strong style="font-family:var(--mono); font-size:15px">${glPron} - ${gvPron}</strong>
        ${puntajeHtml}
      </div>`
    : `<div style="margin-top:10px; font-size:12px; color:var(--text-3)">Sin pronóstico registrado</div>`;

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
        ${resultadoReal || '<div class="vs-badge">VS</div>'}
        <div class="equipo-info">
          <span class="flag">${flagEmoji(p.codigo_visitante)}</span>
          <span class="nombre">${p.equipo_visitante}</span>
          <span class="codigo">${p.codigo_visitante}</span>
        </div>
      </div>
      <small style="font-size:11px; color:var(--text-3)">📍 ${p.estadio || ''}, ${p.ciudad || ''}</small>
      ${formulario}
    </div>`;
}

async function guardarPronostico(idPartido) {
  const gl  = parseInt(document.getElementById(`gl-${idPartido}`).value) || 0;
  const gv  = parseInt(document.getElementById(`gv-${idPartido}`).value) || 0;
  const msg = document.getElementById(`msg-${idPartido}`);
  try {
    await API.pronostico({ id_partido: idPartido, goles_local: gl, goles_visitante: gv });
    msg.style.color = 'var(--verde)';
    msg.textContent = `✓ Pronóstico guardado: ${gl} - ${gv}`;
    // Actualizar cache local
    const idx = misPronosticos.findIndex(p => p.id_partido === idPartido);
    if (idx >= 0) {
      misPronosticos[idx].goles_local = gl;
      misPronosticos[idx].goles_visitante = gv;
    } else {
      misPronosticos.push({ id_partido: idPartido, goles_local: gl, goles_visitante: gv });
    }
  } catch (e) {
    msg.style.color = 'var(--rojo)';
    msg.textContent = `✗ ${e.message}`;
  }
}

function previewPron(idPartido) {
  const gl = document.getElementById(`gl-${idPartido}`)?.value;
  const gv = document.getElementById(`gv-${idPartido}`)?.value;
  const msg = document.getElementById(`msg-${idPartido}`);
  if (msg) msg.textContent = '';
}

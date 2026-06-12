// ============================================================
//  admin.js — Panel de administración
// ============================================================

let partidosAdmin = [];

document.addEventListener('DOMContentLoaded', async () => {
  await verificarSesion();
  if (!SESSION?.logged || !SESSION?.es_admin) {
    document.getElementById('admin-blocked')?.classList.remove('hidden');
    return;
  }
  document.getElementById('admin-content')?.classList.remove('hidden');
  await cargarPartidosAdmin();
});

async function cargarPartidosAdmin() {
  try {
    partidosAdmin = await API.partidos();
    renderSelectPartidos();
    renderListaAdmin();
  } catch (e) {
    console.error(e);
  }
}

function renderSelectPartidos() {
  const sel = document.getElementById('admin-partido');
  if (!sel) return;
  const activos = partidosAdmin.filter(p => p.estado !== 'finalizado');
  sel.innerHTML = activos.length
    ? `<option value="">— Seleccionar partido —</option>` +
      activos.map(p => `<option value="${p.id_partido}|${p.equipo_local}|${p.equipo_visitante}">
        [${p.grupo ? 'Grp '+p.grupo : p.fase}] ${p.equipo_local} vs ${p.equipo_visitante} (${formatFecha(p.fecha_hora)})
      </option>`).join('')
    : `<option>No hay partidos pendientes</option>`;

  sel.onchange = () => {
    const [, local, visitante] = (sel.value || '||').split('|');
    const lblL = document.getElementById('lbl-local');
    const lblV = document.getElementById('lbl-visitante');
    if (lblL) lblL.textContent = local || 'Local';
    if (lblV) lblV.textContent = visitante || 'Visitante';
  };
}

function renderListaAdmin() {
  const cont = document.getElementById('admin-partidos-lista');
  if (!cont) return;
  cont.innerHTML = `
    <div style="overflow-x:auto">
      <table style="width:100%;font-size:13px;border-collapse:collapse">
        <thead>
          <tr style="background:var(--bg)">
            <th style="padding:8px;text-align:left;border-bottom:1px solid var(--border)">Partido</th>
            <th style="padding:8px;text-align:center;border-bottom:1px solid var(--border)">Resultado</th>
            <th style="padding:8px;text-align:center;border-bottom:1px solid var(--border)">Estado</th>
          </tr>
        </thead>
        <tbody>
          ${partidosAdmin.map(p => `
            <tr>
              <td style="padding:7px 8px;border-bottom:1px solid var(--border);font-size:12px">
                ${flagEmoji(p.codigo_local)} ${p.equipo_local} vs ${p.equipo_visitante} ${flagEmoji(p.codigo_visitante)}
              </td>
              <td style="padding:7px 8px;border-bottom:1px solid var(--border);text-align:center;font-family:var(--mono);font-weight:700">
                ${p.estado === 'finalizado' ? `${p.goles_local} - ${p.goles_visitante}` : '—'}
              </td>
              <td style="padding:7px 8px;border-bottom:1px solid var(--border);text-align:center">
                <span class="estado-badge estado-${p.estado}">${p.estado}</span>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

async function guardarResultado() {
  const sel   = document.getElementById('admin-partido');
  const gl    = parseInt(document.getElementById('admin-gl').value) || 0;
  const gv    = parseInt(document.getElementById('admin-gv').value) || 0;
  const msgEl = document.getElementById('admin-result-msg');

  if (!sel.value) { showMsg(msgEl, 'Seleccioná un partido.', false); return; }
  const idPartido = parseInt(sel.value.split('|')[0]);

  try {
    const res = await API.resultado({ id_partido: idPartido, goles_local: gl, goles_visitante: gv });
    showMsg(msgEl, `✓ ${res.mensaje}`, true);
    await cargarPartidosAdmin();
  } catch (e) {
    showMsg(msgEl, `✗ ${e.message}`, false);
  }
}

function showMsg(el, text, ok) {
  if (!el) return;
  el.textContent = text;
  el.className = ok ? 'alert-ok' : 'alert-error';
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 5000);
}

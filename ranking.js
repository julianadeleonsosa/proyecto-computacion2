// ============================================================
//  ranking.js — Clasificación completa
// ============================================================

let rankingData = [];

document.addEventListener('DOMContentLoaded', async () => {
  await verificarSesion();
  await cargarRanking();
  setInterval(cargarRanking, 30000);
});

async function cargarRanking() {
  try {
    rankingData = await API.ranking();
    renderPodio(rankingData);
    renderTabla(rankingData);
    const el = document.getElementById('ultimo-update');
    if (el) el.textContent = 'Actualizado: ' + new Date().toLocaleTimeString('es-UY');
    const info = document.getElementById('tabla-info');
    if (info) info.textContent = rankingData.length + ' participantes';
  } catch (e) {
    document.getElementById('ranking-body').innerHTML =
      `<tr><td colspan="8" class="loading">Error al cargar: ${e.message}</td></tr>`;
  }
}

function renderPodio(ranking) {
  const cont = document.getElementById('podio');
  if (!cont || ranking.length < 1) return;
  const top3 = ranking.slice(0, 3);
  const orden = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : [top3[0]];
  const trofeos = ['🥈', '🥇', '🥉'];
  const clases  = ['podio-2', 'podio-1', 'podio-3'];
  const nums    = ['2°', '1°', '3°'];

  cont.innerHTML = orden.map((p, i) => {
    if (!p) return '';
    const realIdx = top3.indexOf(p);
    return `
      <div class="podio-item ${clases[i]}">
        <div class="podio-trophy">${trofeos[i]}</div>
        <div class="podio-nombre">${p.nombre}</div>
        <div class="podio-pts">${p.total_puntos} pts</div>
        <div class="podio-pos">${nums[i]}</div>
      </div>`;
  }).join('');
}

function renderTabla(ranking) {
  const tbody = document.getElementById('ranking-body');
  if (!tbody) return;
  const busqueda = (document.getElementById('buscar-participante')?.value || '').toLowerCase();
  const filtrado = busqueda
    ? ranking.filter(r => r.nombre.toLowerCase().includes(busqueda))
    : ranking;

  if (!filtrado.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="loading">Sin resultados.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtrado.map(r => {
    const esYo  = SESSION?.logged && SESSION.id === r.id_participante;
    const medal = r.posicion === 1 ? '🥇' : r.posicion === 2 ? '🥈' : r.posicion === 3 ? '🥉' : '';
    return `
      <tr class="${r.posicion === 1 ? 'fila-lider' : ''} ${esYo ? 'fila-yo' : ''}">
        <td class="col-pos">${medal || `<span class="pos-num">${r.posicion}</span>`}</td>
        <td>${r.nombre}${esYo ? ' <small style="color:var(--verde);font-weight:600">(vos)</small>' : ''}</td>
        <td class="col-pts">${r.total_puntos}</td>
        <td class="col-stat">${r.exactos}</td>
        <td class="col-stat">${r.diferencias}</td>
        <td class="col-stat">${r.ganadores}</td>
        <td class="col-stat">${r.partidos_jugados}</td>
        <td class="col-pct">
          <div class="barra-acierto">
            <div class="barra-bg"><div class="barra-fill" style="width:${r.pct_acierto}%"></div></div>
            <span class="barra-pct">${r.pct_acierto}%</span>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function filtrarRanking() {
  renderTabla(rankingData);
}

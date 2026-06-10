/* ════════════════════════════════════════════
   NutriIA — charts.js
   Gráficas SVG sin dependencias
   ════════════════════════════════════════════ */
'use strict';

const Graficas = {

  /** Anillo de progreso de calorías */
  anillo(consumidas, objetivo, ejercicio = 0) {
    const total = Math.max(1, objetivo + ejercicio);
    const pct = Math.min(1, consumidas / total);
    const excedido = consumidas > total;
    const R = 56, C = 2 * Math.PI * R;
    const color = excedido ? 'var(--rojo)' : (pct > 0.85 ? 'var(--naranja)' : 'var(--acento)');
    const restantes = Math.round(total - consumidas);
    return `
    <svg class="anillo-svg" width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r="${R}" fill="none" stroke="var(--tarjeta-2)" stroke-width="11"/>
      <circle cx="70" cy="70" r="${R}" fill="none" stroke="${color}" stroke-width="11"
        stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}"
        transform="rotate(-90 70 70)" style="transition: stroke-dashoffset .6s ease"/>
      <text x="70" y="66" text-anchor="middle" class="anillo-centro-num">${restantes >= 0 ? restantes : 0}</text>
      <text x="70" y="84" text-anchor="middle" class="anillo-centro-lbl">${restantes >= 0 ? 'kcal restantes' : 'kcal'}</text>
    </svg>`;
  },

  /** Gráfica de línea: evolución del peso + línea de meta */
  peso(registros, meta) {
    if (!registros || registros.length === 0)
      return '<div class="vacio">Registra tu peso para ver tu evolución</div>';

    const W = 520, H = 230, M = { t: 18, r: 16, b: 30, l: 40 };
    const datos = registros.slice(-60);
    const valores = datos.map(d => d.peso);
    let min = Math.min(...valores, meta) - 1;
    let max = Math.max(...valores, meta) + 1;
    if (max - min < 4) { min -= 2; max += 2; }

    const x = i => M.l + (datos.length === 1 ? (W - M.l - M.r) / 2 : i * (W - M.l - M.r) / (datos.length - 1));
    const y = v => M.t + (max - v) * (H - M.t - M.b) / (max - min);

    const puntos = datos.map((d, i) => `${x(i)},${y(d.peso)}`).join(' ');
    const area = `${M.l},${H - M.b} ${puntos} ${x(datos.length - 1)},${H - M.b}`;

    // etiquetas eje Y (3 marcas)
    const marcasY = [min + 0.5, (min + max) / 2, max - 0.5].map(v =>
      `<text x="${M.l - 6}" y="${y(v) + 4}" text-anchor="end" font-size="10" fill="var(--texto-suave)">${v.toFixed(1)}</text>
       <line x1="${M.l}" y1="${y(v)}" x2="${W - M.r}" y2="${y(v)}" stroke="var(--borde)" stroke-width="1" stroke-dasharray="2 4"/>`
    ).join('');

    // etiquetas eje X: primera y última fecha
    const fechaCorta = iso => {
      const d = new Date(iso + 'T00:00:00');
      return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    };
    const ejesX = `
      <text x="${x(0)}" y="${H - 8}" font-size="10" fill="var(--texto-suave)" text-anchor="start">${fechaCorta(datos[0].fecha)}</text>
      ${datos.length > 1 ? `<text x="${x(datos.length - 1)}" y="${H - 8}" font-size="10" fill="var(--texto-suave)" text-anchor="end">${fechaCorta(datos[datos.length - 1].fecha)}</text>` : ''}`;

    const dots = datos.map((d, i) =>
      `<circle cx="${x(i)}" cy="${y(d.peso)}" r="3.5" fill="var(--acento)" stroke="var(--tarjeta)" stroke-width="1.5"/>`
    ).join('');

    return `
    <svg class="grafica-svg" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="gradPeso" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--acento)" stop-opacity=".25"/>
          <stop offset="100%" stop-color="var(--acento)" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${marcasY}
      <polygon points="${area}" fill="url(#gradPeso)"/>
      <polyline points="${puntos}" fill="none" stroke="var(--acento)" stroke-width="2.5" stroke-linejoin="round"/>
      <line x1="${M.l}" y1="${y(meta)}" x2="${W - M.r}" y2="${y(meta)}" stroke="var(--azul)" stroke-width="1.8" stroke-dasharray="6 5"/>
      <text x="${W - M.r}" y="${y(meta) - 6}" text-anchor="end" font-size="11" font-weight="700" fill="var(--azul)">Meta ${meta} kg</text>
      ${dots}
      ${ejesX}
    </svg>`;
  },

  /** Barras: calorías de los últimos N días vs objetivo */
  calorias(dias, objetivo) {
    if (!dias.some(d => d.kcal > 0))
      return '<div class="vacio">Registra comidas para ver tu historial</div>';

    const W = 520, H = 200, M = { t: 16, r: 10, b: 26, l: 38 };
    const maxV = Math.max(objetivo * 1.25, ...dias.map(d => d.kcal)) * 1.05;
    const bw = (W - M.l - M.r) / dias.length;
    const y = v => M.t + (maxV - v) * (H - M.t - M.b) / maxV;

    const barras = dias.map((d, i) => {
      const altura = Math.max(0, H - M.b - y(d.kcal));
      const color = d.kcal === 0 ? 'var(--tarjeta-2)' : (d.kcal <= objetivo ? 'var(--acento)' : 'var(--rojo)');
      const etiqueta = new Date(d.fecha + 'T00:00:00').getDate();
      return `
        <rect x="${M.l + i * bw + bw * 0.18}" y="${y(d.kcal)}" width="${bw * 0.64}" height="${altura || 1}"
          rx="3" fill="${color}" opacity="${d.kcal === 0 ? .5 : .92}"/>
        <text x="${M.l + i * bw + bw / 2}" y="${H - 8}" text-anchor="middle" font-size="9.5" fill="var(--texto-suave)">${etiqueta}</text>`;
    }).join('');

    return `
    <svg class="grafica-svg" viewBox="0 0 ${W} ${H}">
      <text x="${M.l - 6}" y="${y(objetivo) + 4}" text-anchor="end" font-size="10" fill="var(--texto-suave)">${objetivo}</text>
      ${barras}
      <line x1="${M.l}" y1="${y(objetivo)}" x2="${W - M.r}" y2="${y(objetivo)}" stroke="var(--azul)" stroke-width="1.6" stroke-dasharray="6 5"/>
    </svg>`;
  },
};

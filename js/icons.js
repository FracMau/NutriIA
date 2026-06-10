/* ════════════════════════════════════════════
   NutriIA — icons.js
   Iconografía SVG de trazo (sin emojis)
   ════════════════════════════════════════════ */
'use strict';

const ICONOS = {
  inicio:    '<path d="M3 10.8 12 3l9 7.8"/><path d="M5.5 9.6V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.6"/>',
  grafica:   '<path d="M5 20v-8M12 20V5M19 20v-5"/>',
  escaner:   '<path d="M4 7.5V6a2 2 0 0 1 2-2h1.5M16.5 4H18a2 2 0 0 1 2 2v1.5M20 16.5V18a2 2 0 0 1-2 2h-1.5M7.5 20H6a2 2 0 0 1-2-2v-1.5"/><path d="M7.5 12h9"/>',
  usuario:   '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5c.8-3.6 3.9-5.5 7.5-5.5s6.7 1.9 7.5 5.5"/>',
  mas:       '<path d="M12 5.5v13M5.5 12h13"/>',
  camara:    '<path d="M3.5 8.6c0-.9.7-1.6 1.6-1.6h2l1.8-2.5h6.2L17 7h2a1.6 1.6 0 0 1 1.6 1.6v9.3a1.6 1.6 0 0 1-1.6 1.6H5a1.6 1.6 0 0 1-1.6-1.6z"/><circle cx="12" cy="13" r="3.4"/>',
  etiqueta:  '<path d="M3.5 10.6V4.5a1 1 0 0 1 1-1h6.1a1 1 0 0 1 .7.3l8.7 8.7a1 1 0 0 1 0 1.4l-6.1 6.1a1 1 0 0 1-1.4 0l-8.7-8.7a1 1 0 0 1-.3-.7z"/><circle cx="8" cy="8" r="1.4"/>',
  chat:      '<path d="M20.5 13.7a1.8 1.8 0 0 1-1.8 1.8H8.2l-4.7 3.8V5.3a1.8 1.8 0 0 1 1.8-1.8h13.4a1.8 1.8 0 0 1 1.8 1.8z"/>',
  busqueda:  '<circle cx="11" cy="11" r="6.5"/><path d="m20.5 20.5-4.8-4.8"/>',
  cerrar:    '<path d="m6 6 12 12M18 6 6 18"/>',
  gota:      '<path d="M12 3.2s5.8 6.2 5.8 10.2a5.8 5.8 0 0 1-11.6 0C6.2 9.4 12 3.2 12 3.2z"/>',
  llama:     '<path d="M12 3.5c.8 2.8-.8 4.3-1.9 5.8-1.2 1.6-2.1 3-2.1 4.9a6 6 0 0 0 12 0c0-2.4-1.3-4.5-2.8-6.4-.5 1.2-1.1 1.9-2.2 2.5.4-2.6-.5-5-3-6.8z"/>',
  estrella:  '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.9z"/>',
  pesa:      '<path d="M6.8 7v10M17.2 7v10M3.5 9.5v5M20.5 9.5v5M6.8 12h10.4"/>',
  objetivo:  '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/>',
  bascula:   '<path d="M5.2 19a8.5 8.5 0 1 1 13.6 0"/><path d="m12 13.5 3.4-3.4"/><circle cx="12" cy="13.5" r="1.1"/>',
  ajustes:   '<path d="M4 8h9M19.5 8h.5M4 16h.5M11 16h9"/><circle cx="15.7" cy="8" r="2.3"/><circle cx="7.7" cy="16" r="2.3"/>',
  descargar: '<path d="M12 4.5v10M7.5 10.5 12 15l4.5-4.5M4.5 19.5h15"/>',
  subir:     '<path d="M12 19.5v-10M7.5 13.5 12 9l4.5 4.5M4.5 4.5h15"/>',
  basura:    '<path d="M4.5 7h15M9.5 7V5.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7M6.8 7l.9 12.5h8.6L17.2 7"/>',
  ojo:       '<path d="M2.8 12S6.2 5.8 12 5.8 21.2 12 21.2 12 17.8 18.2 12 18.2 2.8 12 2.8 12z"/><circle cx="12" cy="12" r="2.8"/>',
  visto:     '<path d="m5 13 4.5 4.5L19 7"/>',
  izq:       '<path d="m14.5 5.5-6.5 6.5 6.5 6.5"/>',
  der:       '<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',
  calendario:'<rect x="4" y="5.5" width="16" height="15" rx="2"/><path d="M8 3.5v3.5M16 3.5v3.5M4 10.5h16"/>',
  ia:        '<path d="M12 4.2 13.6 9l4.8 1.6-4.8 1.6L12 17l-1.6-4.8L5.6 10.6 10.4 9z"/><path d="m18.7 15.6.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z"/>',
  alerta:    '<path d="M12 4.3 2.9 20h18.2L12 4.3z"/><path d="M12 10v4.4"/><circle cx="12" cy="17.1" r=".3" fill="currentColor"/>',
  cafe:      '<path d="M4.5 9.5h11.5v5.5a4 4 0 0 1-4 4h-3.5a4 4 0 0 1-4-4z"/><path d="M16 10.5h2a2.2 2.2 0 0 1 0 4.4h-2M7.5 4.5v2.3M10.3 4.5v2.3M13.1 4.5v2.3"/>',
  cubiertos: '<path d="M6 3.5v6a2.3 2.3 0 0 0 4.6 0v-6M8.3 12v8.5"/><path d="M17.5 3.5c-1.8 1.8-2.4 4.6-2.4 7.2h2.4v9.8"/>',
  luna:      '<path d="M20 13.6A8 8 0 1 1 10.4 4a6.4 6.4 0 0 0 9.6 9.6z"/>',
  manzana:   '<path d="M12 7.4c-1-2-3-2.6-4.6-1.9C4.7 6.7 4.1 9.8 5.3 12.7c1.1 2.8 2.9 5.3 4.7 5.3.9 0 1.3-.5 2-.5s1.1.5 2 .5c1.8 0 3.6-2.5 4.7-5.3 1.2-2.9.6-6-2.1-7.2C15 4.8 13 5.4 12 7.4z"/><path d="M12 7.4c0-2 1-3.1 2.4-3.6"/>',
  reloj:     '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  tendencia: '<path d="m3.5 16.5 5.5-5.5 3.5 3.5 7-7"/><path d="M19.5 12V7.5H15"/>',
  balanza:   '<path d="M12 4v16M5.5 20h13"/><path d="M12 6 6 9l-2.5 5a3 3 0 0 0 5 0L6 9M12 6l6 3 2.5 5a3 3 0 0 1-5 0L18 9"/>',
  info:      '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><circle cx="12" cy="8" r=".3" fill="currentColor"/>',
};

/** Devuelve un SVG de icono listo para insertar en HTML */
function ico(nombre, clase = '', tam = 20) {
  return `<svg class="ico ${clase}" width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[nombre] || ''}</svg>`;
}

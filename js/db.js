/* ════════════════════════════════════════════
   NutriIA — db.js
   Base de alimentos comunes (valores aproximados POR UNIDAD)
   n: nombre · u: unidad · g: gramos por unidad
   kcal · p: proteína g · c: carbohidratos g · f: grasa g
   ════════════════════════════════════════════ */
'use strict';

const DB_ALIMENTOS = [
  // ── Básicos mexicanos ──
  { id: 'tortilla-maiz',    n: 'Tortilla de maíz',        u: 'pieza',     g: 30,  kcal: 64,  p: 1.4, c: 13.5, f: 0.7 },
  { id: 'tortilla-harina',  n: 'Tortilla de harina',      u: 'pieza',     g: 45,  kcal: 140, p: 3.5, c: 23,   f: 3.5 },
  { id: 'frijoles',         n: 'Frijoles de la olla',     u: 'taza',      g: 170, kcal: 220, p: 14,  c: 38,   f: 1 },
  { id: 'frijoles-refritos',n: 'Frijoles refritos',       u: 'taza',      g: 170, kcal: 310, p: 12,  c: 36,   f: 13 },
  { id: 'arroz-rojo',       n: 'Arroz rojo',              u: 'taza',      g: 160, kcal: 240, p: 4.5, c: 42,   f: 6 },
  { id: 'nopales',          n: 'Nopales cocidos',         u: 'taza',      g: 150, kcal: 22,  p: 2,   c: 5,    f: 0.1 },
  { id: 'salsa-verde',      n: 'Salsa verde',             u: 'cucharada', g: 15,  kcal: 5,   p: 0.2, c: 1,    f: 0 },
  { id: 'guacamole',        n: 'Guacamole',               u: 'cucharada', g: 25,  kcal: 40,  p: 0.5, c: 2,    f: 3.7 },
  { id: 'aguacate',         n: 'Aguacate',                u: 'pieza',     g: 140, kcal: 227, p: 2.7, c: 12,   f: 21 },
  // ── Antojitos ──
  { id: 'taco-pastor',      n: 'Taco al pastor',          u: 'pieza',     g: 90,  kcal: 170, p: 8,   c: 16,   f: 8 },
  { id: 'taco-bistec',      n: 'Taco de bistec',          u: 'pieza',     g: 95,  kcal: 180, p: 11,  c: 15,   f: 8 },
  { id: 'taco-carnitas',    n: 'Taco de carnitas',        u: 'pieza',     g: 95,  kcal: 220, p: 11,  c: 15,   f: 12 },
  { id: 'quesadilla',       n: 'Quesadilla con queso',    u: 'pieza',     g: 110, kcal: 290, p: 12,  c: 28,   f: 14 },
  { id: 'tamal',            n: 'Tamal',                   u: 'pieza',     g: 180, kcal: 425, p: 9,   c: 45,   f: 22 },
  { id: 'tostada',          n: 'Tostada de tinga',        u: 'pieza',     g: 110, kcal: 250, p: 13,  c: 22,   f: 12 },
  { id: 'sope',             n: 'Sope con frijoles',       u: 'pieza',     g: 105, kcal: 240, p: 8,   c: 30,   f: 10 },
  { id: 'enchilada',        n: 'Enchilada verde',         u: 'pieza',     g: 120, kcal: 235, p: 10,  c: 20,   f: 13 },
  { id: 'pozole',           n: 'Pozole con carne',        u: 'plato',     g: 450, kcal: 420, p: 28,  c: 38,   f: 17 },
  { id: 'torta',            n: 'Torta de jamón',          u: 'pieza',     g: 280, kcal: 560, p: 22,  c: 62,   f: 25 },
  { id: 'chilaquiles',      n: 'Chilaquiles verdes c/pollo', u: 'plato',  g: 350, kcal: 550, p: 26,  c: 50,   f: 27 },
  // ── Proteínas ──
  { id: 'huevo',            n: 'Huevo',                   u: 'pieza',     g: 50,  kcal: 72,  p: 6.3, c: 0.4,  f: 4.8 },
  { id: 'huevo-revuelto',   n: 'Huevos revueltos (2) c/aceite', u: 'porción', g: 120, kcal: 200, p: 13, c: 1, f: 15 },
  { id: 'pechuga',          n: 'Pechuga de pollo asada',  u: 'porción',   g: 120, kcal: 198, p: 37,  c: 0,    f: 4.3 },
  { id: 'muslo-pollo',      n: 'Muslo de pollo c/piel',   u: 'pieza',     g: 95,  kcal: 230, p: 23,  c: 0,    f: 15 },
  { id: 'bistec',           n: 'Bistec de res asado',     u: 'porción',   g: 120, kcal: 250, p: 32,  c: 0,    f: 13 },
  { id: 'carne-molida',     n: 'Carne molida de res',     u: 'taza',      g: 140, kcal: 340, p: 30,  c: 0,    f: 24 },
  { id: 'atun-agua',        n: 'Atún en agua (lata)',     u: 'pieza',     g: 95,  kcal: 100, p: 22,  c: 0,    f: 1 },
  { id: 'pescado',          n: 'Filete de pescado',       u: 'porción',   g: 140, kcal: 170, p: 30,  c: 0,    f: 4.5 },
  { id: 'camarones',        n: 'Camarones cocidos',       u: 'taza',      g: 145, kcal: 145, p: 28,  c: 1.5,  f: 2 },
  { id: 'jamon',            n: 'Jamón de pavo',           u: 'rebanada',  g: 28,  kcal: 30,  p: 4.5, c: 1,    f: 0.8 },
  { id: 'salchicha',        n: 'Salchicha de pavo',       u: 'pieza',     g: 45,  kcal: 100, p: 6,   c: 2,    f: 7.5 },
  { id: 'chorizo',          n: 'Chorizo frito',           u: 'porción',   g: 60,  kcal: 273, p: 14,  c: 1,    f: 23 },
  // ── Lácteos ──
  { id: 'leche-entera',     n: 'Leche entera',            u: 'vaso',      g: 240, kcal: 150, p: 8,   c: 12,   f: 8 },
  { id: 'leche-light',      n: 'Leche descremada',        u: 'vaso',      g: 240, kcal: 85,  p: 8.5, c: 12,   f: 0.5 },
  { id: 'yogur-natural',    n: 'Yogur natural',           u: 'vaso',      g: 200, kcal: 122, p: 7,   c: 9.5,  f: 6.5 },
  { id: 'yogur-griego',     n: 'Yogur griego natural',    u: 'vaso',      g: 170, kcal: 100, p: 17,  c: 6,    f: 0.7 },
  { id: 'queso-panela',     n: 'Queso panela',            u: 'rebanada',  g: 40,  kcal: 115, p: 9,   c: 1.5,  f: 8 },
  { id: 'queso-oaxaca',     n: 'Queso Oaxaca',            u: 'porción',   g: 40,  kcal: 140, p: 9,   c: 1,    f: 11 },
  { id: 'queso-manchego',   n: 'Queso manchego',          u: 'rebanada',  g: 30,  kcal: 110, p: 7,   c: 0.5,  f: 9 },
  // ── Frutas ──
  { id: 'platano',          n: 'Plátano',                 u: 'pieza',     g: 118, kcal: 105, p: 1.3, c: 27,   f: 0.4 },
  { id: 'manzana',          n: 'Manzana',                 u: 'pieza',     g: 180, kcal: 95,  p: 0.5, c: 25,   f: 0.3 },
  { id: 'naranja',          n: 'Naranja',                 u: 'pieza',     g: 130, kcal: 62,  p: 1.2, c: 15,   f: 0.2 },
  { id: 'papaya',           n: 'Papaya picada',           u: 'taza',      g: 145, kcal: 62,  p: 0.7, c: 16,   f: 0.4 },
  { id: 'sandia',           n: 'Sandía picada',           u: 'taza',      g: 150, kcal: 46,  p: 0.9, c: 11.5, f: 0.2 },
  { id: 'mango',            n: 'Mango',                   u: 'pieza',     g: 200, kcal: 135, p: 1.1, c: 35,   f: 0.6 },
  { id: 'fresas',           n: 'Fresas',                  u: 'taza',      g: 150, kcal: 49,  p: 1,   c: 12,   f: 0.5 },
  { id: 'uvas',             n: 'Uvas',                    u: 'taza',      g: 150, kcal: 104, p: 1,   c: 27,   f: 0.2 },
  // ── Cereales y panes ──
  { id: 'pan-blanco',       n: 'Pan de caja blanco',      u: 'rebanada',  g: 28,  kcal: 75,  p: 2.5, c: 14,   f: 1 },
  { id: 'pan-integral',     n: 'Pan de caja integral',    u: 'rebanada',  g: 28,  kcal: 70,  p: 3.5, c: 12,   f: 1.1 },
  { id: 'bolillo',          n: 'Bolillo',                 u: 'pieza',     g: 70,  kcal: 195, p: 6,   c: 39,   f: 1.5 },
  { id: 'concha',           n: 'Concha (pan dulce)',      u: 'pieza',     g: 80,  kcal: 330, p: 5,   c: 48,   f: 13 },
  { id: 'avena',            n: 'Avena cocida',            u: 'taza',      g: 234, kcal: 160, p: 6,   c: 27,   f: 3.5 },
  { id: 'cereal',           n: 'Cereal de caja c/azúcar', u: 'taza',      g: 35,  kcal: 135, p: 2,   c: 30,   f: 1 },
  { id: 'galletas-maria',   n: 'Galletas María',          u: 'pieza',     g: 6,   kcal: 26,  p: 0.5, c: 4.5,  f: 0.7 },
  { id: 'hotcake',          n: 'Hot cake con miel',       u: 'pieza',     g: 80,  kcal: 180, p: 4,   c: 32,   f: 4.5 },
  { id: 'pasta',            n: 'Pasta / espagueti cocido',u: 'taza',      g: 140, kcal: 220, p: 8,   c: 43,   f: 1.3 },
  { id: 'papa',             n: 'Papa cocida',             u: 'pieza',     g: 150, kcal: 130, p: 3,   c: 30,   f: 0.2 },
  // ── Bebidas ──
  { id: 'refresco',         n: 'Refresco de cola',        u: 'vaso',      g: 355, kcal: 150, p: 0,   c: 39,   f: 0 },
  { id: 'jugo-naranja',     n: 'Jugo de naranja natural', u: 'vaso',      g: 240, kcal: 110, p: 1.7, c: 26,   f: 0.5 },
  { id: 'agua-fruta',       n: 'Agua de fruta c/azúcar',  u: 'vaso',      g: 350, kcal: 120, p: 0.3, c: 30,   f: 0 },
  { id: 'cafe-negro',       n: 'Café negro',              u: 'taza',      g: 240, kcal: 2,   p: 0.3, c: 0,    f: 0 },
  { id: 'cafe-leche',       n: 'Café con leche y azúcar', u: 'taza',      g: 240, kcal: 110, p: 4,   c: 16,   f: 3.5 },
  { id: 'cerveza',          n: 'Cerveza',                 u: 'pieza',     g: 355, kcal: 150, p: 1.6, c: 13,   f: 0 },
  { id: 'licuado-platano',  n: 'Licuado de plátano',      u: 'vaso',      g: 350, kcal: 270, p: 9,   c: 47,   f: 6 },
  // ── Snacks / otros ──
  { id: 'papitas',          n: 'Papas fritas (bolsa chica)', u: 'pieza',  g: 45,  kcal: 245, p: 3,   c: 23,   f: 16 },
  { id: 'cacahuates',       n: 'Cacahuates',              u: 'porción',   g: 30,  kcal: 170, p: 7,   c: 6,    f: 14 },
  { id: 'almendras',        n: 'Almendras',               u: 'porción',   g: 28,  kcal: 164, p: 6,   c: 6,    f: 14 },
  { id: 'chocolate',        n: 'Chocolate (barra chica)', u: 'pieza',     g: 40,  kcal: 215, p: 3,   c: 24,   f: 12 },
  { id: 'palomitas',        n: 'Palomitas naturales',     u: 'taza',      g: 8,   kcal: 31,  p: 1,   c: 6,    f: 0.4 },
  { id: 'gelatina',         n: 'Gelatina',                u: 'taza',      g: 135, kcal: 84,  p: 1.6, c: 19,   f: 0 },
  { id: 'mayonesa',         n: 'Mayonesa',                u: 'cucharada', g: 14,  kcal: 94,  p: 0.1, c: 0.1,  f: 10 },
  { id: 'aceite',           n: 'Aceite vegetal',          u: 'cucharada', g: 14,  kcal: 120, p: 0,   c: 0,    f: 14 },
  { id: 'azucar',           n: 'Azúcar',                  u: 'cucharada', g: 12,  kcal: 48,  p: 0,   c: 12,   f: 0 },
  { id: 'crema',            n: 'Crema',                   u: 'cucharada', g: 15,  kcal: 30,  p: 0.4, c: 0.6,  f: 3 },
  { id: 'ensalada',         n: 'Ensalada verde c/aderezo',u: 'plato',     g: 200, kcal: 150, p: 3,   c: 10,   f: 11 },
  { id: 'sopa-verduras',    n: 'Sopa de verduras',        u: 'plato',     g: 300, kcal: 120, p: 4,   c: 18,   f: 3.5 },
  { id: 'caldo-pollo',      n: 'Caldo de pollo c/verduras', u: 'plato',   g: 400, kcal: 210, p: 22,  c: 14,   f: 7 },
];

/** Busca alimentos por texto (sin acentos, sin mayúsculas) en la base + personalizados. */
function buscarAlimentos(texto, personalizados) {
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const q = norm(texto || '');
  const todos = [...(personalizados || []), ...DB_ALIMENTOS];
  if (!q) return todos;
  return todos.filter(a => norm(a.n).includes(q));
}

/* ════════════════════════════════════════════
   Ejercicios — valores MET (Metabolic Equivalent of Task)
   kcal = MET × 3.5 × peso(kg) / 200 × minutos
   ════════════════════════════════════════════ */
const DB_EJERCICIOS = [
  { n: 'Caminar · ligero',        met: 3.0 },
  { n: 'Caminar · rápido',        met: 4.3 },
  { n: 'Trotar',                  met: 7.0 },
  { n: 'Correr',                  met: 10.0 },
  { n: 'Bicicleta · moderada',    met: 7.5 },
  { n: 'Bicicleta · intensa',     met: 10.0 },
  { n: 'Natación',                met: 8.0 },
  { n: 'Pesas / gimnasio',        met: 5.0 },
  { n: 'Funcional / HIIT',        met: 8.0 },
  { n: 'Spinning',                met: 8.5 },
  { n: 'Elíptica',                met: 5.0 },
  { n: 'Saltar la cuerda',        met: 11.0 },
  { n: 'Fútbol',                  met: 7.0 },
  { n: 'Básquetbol',              met: 6.5 },
  { n: 'Tenis',                   met: 7.0 },
  { n: 'Vóleibol',                met: 4.0 },
  { n: 'Box',                     met: 9.0 },
  { n: 'Baile / Zumba',           met: 5.5 },
  { n: 'Yoga',                    met: 2.5 },
  { n: 'Pilates',                 met: 3.0 },
  { n: 'Senderismo',              met: 6.0 },
  { n: 'Patines / patineta',      met: 5.0 },
  { n: 'Subir escaleras',         met: 8.0 },
  { n: 'Limpieza del hogar',      met: 3.3 },
  { n: 'Jardinería',              met: 3.8 },
];

/** Calorías quemadas según MET, peso y minutos */
function caloriasEjercicio(met, pesoKg, minutos) {
  return Math.round(met * 3.5 * pesoKg / 200 * minutos);
}

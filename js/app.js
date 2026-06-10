/* ════════════════════════════════════════════
   NutriIA — app.js
   Lógica de la interfaz
   ════════════════════════════════════════════ */
'use strict';

const App = {
  fecha: fechaISO(),
  comidaDestino: 'comida',
  alimentoSel: null,
  entradaSel: null,
  iaResultado: null,
  productoSel: null,
};

const $ = id => document.getElementById(id);
const COMIDAS_META = {
  desayuno: { ico: 'cafe',      nombre: 'Desayuno' },
  comida:   { ico: 'cubiertos', nombre: 'Comida' },
  cena:     { ico: 'luna',      nombre: 'Cena' },
  snack:    { ico: 'manzana',   nombre: 'Snacks' },
};

/* ════════════ ARRANQUE ════════════ */
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.dataset.theme = Store.getTema();
  hidratarIconos(document);
  conectarEventos();
  const perfil = Store.getPerfil();
  if (!perfil) iniciarOnboarding();
  else renderTodo();
});

/** Reemplaza <i data-ico="x" data-tam="n"> por el SVG correspondiente */
function hidratarIconos(raiz) {
  raiz.querySelectorAll('i[data-ico]').forEach(el => {
    const tam = +el.dataset.tam || 20;
    const tmp = document.createElement('div');
    tmp.innerHTML = ico(el.dataset.ico, el.className, tam);
    el.replaceWith(tmp.firstChild);
  });
}

function renderTodo() {
  renderCabecera();
  renderHoy();
  renderProgreso();
  renderPerfil();
}

function planActual() {
  const perfil = Store.getPerfil();
  return Nutricion.plan(perfil, Store.ultimoPeso() || perfil.pesoKg);
}

/* ════════════ ONBOARDING ════════════ */
function iniciarOnboarding() {
  $('onboarding').classList.remove('oculto');
  const f = new Date(); f.setDate(f.getDate() + 90);
  $('ob-fecha').value = fechaISO(f);
}

function pasoOnboarding(n) {
  document.querySelectorAll('.ob-paso').forEach(p => p.classList.toggle('activo', p.dataset.paso == n));
  document.querySelectorAll('.ob-progreso span').forEach((s, i) => s.classList.toggle('activo', i < n));
}

function leerSeg(id) { return $(id).querySelector('.activo')?.dataset.v; }

function perfilDesdeOnboarding() {
  return {
    nombre: $('ob-nombre').value.trim() || 'Atleta',
    sexo: leerSeg('ob-sexo') || 'm',
    edad: +$('ob-edad').value,
    alturaCm: +$('ob-altura').value,
    pesoKg: +$('ob-peso').value,
    trabajo: leerSeg('ob-trabajo') || 'sentado',
    diasEjercicio: +(leerSeg('ob-dias') || 0),
    intensidad: leerSeg('ob-intensidad') || 'moderada',
    pesoMeta: +$('ob-meta').value,
    fechaMeta: $('ob-fecha').value,
  };
}

function actualizarResumenOnboarding() {
  const p = perfilDesdeOnboarding();
  const caja = $('ob-resumen');
  if (!p.pesoMeta || !p.fechaMeta || !p.pesoKg || !p.edad || !p.alturaCm) { caja.classList.add('oculto'); return; }
  const plan = Nutricion.plan(p, p.pesoKg);
  const verbo = plan.direccion === 'bajar' ? 'perder' : plan.direccion === 'subir' ? 'ganar' : 'mantener';
  const dif = Math.abs(p.pesoKg - p.pesoMeta).toFixed(1);
  caja.innerHTML = `
    Tu cuerpo gasta cerca de <b>${plan.getd.toLocaleString('es-MX')} kcal</b> al día (factor de actividad ${plan.factor}).<br>
    Para ${verbo}${verbo !== 'mantener' ? ` ${dif} kg` : 'tu peso'}, tu objetivo será de
    <b>${plan.objetivo.toLocaleString('es-MX')} kcal/día</b>${plan.direccion !== 'mantener' ? ` (ritmo ${plan.ritmoSemanal > 0 ? '−' : '+'}${Math.abs(plan.ritmoSemanal)} kg/semana)` : ''}.
    ${plan.fechaEstimada && plan.direccion !== 'mantener' ? `<br>Llegarías el <b>${fechaLarga(plan.fechaEstimada)}</b>.` : ''}
    ${plan.advertencia ? `<div class="alerta">${ico('alerta', '', 17)}<span>${plan.advertencia}</span></div>` : ''}`;
  caja.classList.remove('oculto');
}

/* ════════════ CABECERA Y NAVEGACIÓN ════════════ */
function renderCabecera() {
  const perfil = Store.getPerfil();
  const h = new Date().getHours();
  const saludo = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
  $('saludo').textContent = `${saludo}, ${perfil.nombre}`;
  const racha = Nutricion.racha(Store.getRegistroCompleto());
  $('racha-mini').innerHTML = racha > 0
    ? `${ico('llama', '', 14)} ${racha} día${racha > 1 ? 's' : ''} de constancia`
    : `${ico('llama', '', 14)} Comienza tu racha hoy`;
  $('fecha-txt').textContent = fechaBonita(App.fecha);
}

function cambiarTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('activa', t.id === 'tab-' + tab));
  document.querySelectorAll('.nav-btn[data-tab]').forEach(b => b.classList.toggle('activo', b.dataset.tab === tab));
  if (tab === 'progreso') renderProgreso();
  if (tab === 'perfil') renderPerfil();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function moverFecha(dias) {
  const d = new Date(App.fecha + 'T00:00:00');
  d.setDate(d.getDate() + dias);
  if (fechaISO(d) > fechaISO()) return;
  App.fecha = fechaISO(d);
  renderCabecera();
  renderHoy();
}

/* ════════════ PESTAÑA HOY ════════════ */
function renderHoy() {
  const perfil = Store.getPerfil();
  if (!perfil) return;
  const plan = planActual();
  const dia = Store.getDia(App.fecha);
  const t = Nutricion.totalesDia(dia);
  const distKcal = Nutricion.distribucionKcal(plan.objetivo, Store.getDistribucion());

  // Anillo + estadísticas
  const presupuesto = plan.objetivo + t.ejercicio;
  const restante = presupuesto - t.kcal;
  $('anillo-contenedor').innerHTML = `
    ${Graficas.anillo(t.kcal, plan.objetivo, t.ejercicio)}
    <div class="anillo-datos">
      <div class="stat"><span class="micro">Objetivo</span><b>${plan.objetivo.toLocaleString('es-MX')}</b></div>
      <div class="stat"><span class="micro">Consumidas</span><b>${t.kcal.toLocaleString('es-MX')}</b></div>
      <div class="stat"><span class="micro">Ejercicio</span><b>+${t.ejercicio}</b></div>
      <div class="stat"><span class="micro">${restante >= 0 ? 'Restantes' : 'Excedido'}</span><b class="${restante >= 0 ? 'ok' : 'mal'}">${restante >= 0 ? restante.toLocaleString('es-MX') : '+' + Math.abs(restante).toLocaleString('es-MX')}</b></div>
    </div>`;

  // Balance del día (simulador de desviación diario)
  const desvio = t.kcal - presupuesto;
  const gramos = Nutricion.impactoGramos(desvio);
  const hayConsumo = t.kcal > 0;
  $('balance-contenedor').innerHTML = `
    <div class="tarjeta-titulo">${ico('balanza')}Balance de hoy</div>
    <div class="balance-fila">
      <div class="balance-celda">
        <span class="micro">Desvío calórico</span>
        <b class="num" style="color:${desvio > 0 ? 'var(--rojo)' : 'var(--acento)'}">${desvio > 0 ? '+' : ''}${desvio.toLocaleString('es-MX')}</b>
      </div>
      <div class="balance-celda">
        <span class="micro">Impacto en peso</span>
        <b class="num" style="color:${gramos > 0 ? 'var(--rojo)' : 'var(--acento)'}">${gramos > 0 ? '+' : ''}${gramos} g</b>
      </div>
    </div>
    <div class="balance-nota">${
      !hayConsumo ? 'Registra tus comidas para ver tu balance del día.'
      : desvio > 0 ? `Hoy vas con superávit: equivale a ganar ${Math.abs(gramos)} g de peso si lo repites a diario.`
      : desvio < 0 ? `Vas en déficit: equivale a perder ${Math.abs(gramos)} g de peso si lo mantienes.`
      : 'Estás justo en tu objetivo. Equilibrio perfecto.'
    }</div>`;

  // Macros
  const m = plan.macros;
  const barra = (clase, etiqueta, valor, meta) => `
    <div class="macro">
      <div class="macro-cab"><b>${etiqueta}</b><span class="num">${valor} / ${meta} g</span></div>
      <div class="barra ${clase}"><div style="width:${Math.min(100, meta ? valor / meta * 100 : 0)}%"></div></div>
    </div>`;
  $('macros-contenedor').innerHTML = `
    <div class="tarjeta-titulo">${ico('grafica')}Macronutrientes</div>
    ${barra('barra-p', 'Proteína', t.p, m.p)}
    ${barra('barra-c', 'Carbohidratos', t.c, m.c)}
    ${barra('barra-f', 'Grasas', t.f, m.f)}`;

  // Hidratación
  const pesoActual = Store.ultimoPeso() || perfil.pesoKg;
  const metaVasos = Nutricion.vasosAguaMeta(pesoActual);
  let vasos = '';
  for (let i = 0; i < metaVasos; i++) {
    vasos += `<button class="vaso ${i < dia.agua ? 'lleno' : ''}" data-vaso="${i}">${ico('gota', '', 18)}</button>`;
  }
  $('agua-contenedor').innerHTML = `
    <div class="agua-info"><div class="tarjeta-titulo" style="margin:0">${ico('gota')}Hidratación</div><span class="num">${(dia.agua * 0.25).toFixed(2)} / ${(metaVasos * 0.25).toFixed(2)} L</span></div>
    <div class="agua-fila">${vasos}</div>`;
  $('agua-contenedor').querySelectorAll('.vaso').forEach(v => {
    v.onclick = () => {
      const i = +v.dataset.vaso;
      Store.setAgua(App.fecha, (i + 1 === dia.agua) ? i : i + 1);
      renderHoy();
    };
  });

  // Comidas con presupuesto por comida
  let html = '';
  for (const [clave, meta] of Object.entries(COMIDAS_META)) {
    const entradas = dia.comidas[clave];
    const kcalComida = t.porComida[clave] || 0;
    const objComida = distKcal[clave] || 0;
    const pct = objComida ? Math.min(100, kcalComida / objComida * 100) : 0;
    const sobre = objComida && kcalComida > objComida;
    html += `
    <div class="comida-seccion">
      <div class="comida-cab">
        <div class="info">
          <span class="icono-tile">${ico(meta.ico, '', 19)}</span>
          <div><div class="nombre">${meta.nombre}</div><div class="kcal num">${kcalComida} ${objComida ? `de ${objComida}` : ''} kcal ${sobre ? '<span class="sobre">· excedido</span>' : ''}</div></div>
        </div>
        <button class="btn-mas" data-comida="${clave}" aria-label="Agregar">${ico('mas', '', 20)}</button>
      </div>
      <div class="barra-comida"><div class="${sobre ? 'exceso' : ''}" style="width:${pct}%"></div></div>
      ${entradas.map(e => `
        <div class="entrada" data-comida="${clave}" data-id="${e.id}">
          <div class="izq">
            <div class="nom">${escaparHTML(e.nombre)}</div>
            <div class="det num">${formatoCantidad(e.cantidad)} ${escaparHTML(e.unidad)} · P ${Math.round(e.p)} · C ${Math.round(e.c)} · G ${Math.round(e.f)}</div>
          </div>
          <div class="kc num">${Math.round(e.kcal)}</div>
        </div>`).join('')}
    </div>`;
  }
  $('comidas-contenedor').innerHTML = html;
  $('comidas-contenedor').querySelectorAll('.btn-mas').forEach(b => {
    b.onclick = () => { App.comidaDestino = b.dataset.comida; abrirModal('sheet-agregar'); };
  });
  $('comidas-contenedor').querySelectorAll('.entrada').forEach(el => {
    el.onclick = () => abrirEditarEntrada(el.dataset.comida, el.dataset.id);
  });

  // Ejercicio
  $('ejercicio-contenedor').innerHTML = `
    <div class="tarjeta-titulo">${ico('pesa')}Ejercicio de hoy</div>
    ${dia.ejercicio.length === 0 ? '<div class="vacio">Sin ejercicio registrado</div>' : dia.ejercicio.map(e => `
      <div class="ej-fila"><span>${escaparHTML(e.nombre)}</span>
      <span><b class="num">+${e.kcal} kcal</b> <button class="ej-borrar" data-id="${e.id}" aria-label="Eliminar">${ico('cerrar', '', 15)}</button></span></div>`).join('')}
    <button class="btn-secundario" id="btn-ejercicio">${ico('mas', '', 17)}Agregar ejercicio</button>`;
  $('btn-ejercicio').onclick = abrirEjercicio;
  $('ejercicio-contenedor').querySelectorAll('.ej-borrar').forEach(b => {
    b.onclick = () => { Store.eliminarEjercicio(App.fecha, b.dataset.id); renderHoy(); };
  });

  renderCabecera();
}

/* ════════════ BUSCAR Y AGREGAR ════════════ */
function abrirBuscador() {
  cerrarModal('sheet-agregar');
  $('buscador').value = '';
  renderListaAlimentos('');
  renderRecientes();
  abrirModal('modal-buscar');
  setTimeout(() => $('buscador').focus(), 150);
}

function renderRecientes() {
  const rec = Store.getRecientes();
  $('chips-recientes').innerHTML = rec.map(r => `<button class="chip">${escaparHTML(r)}</button>`).join('');
  $('chips-recientes').querySelectorAll('.chip').forEach(c => {
    c.onclick = () => { $('buscador').value = c.textContent; renderListaAlimentos(c.textContent); };
  });
}

function renderListaAlimentos(texto) {
  const favs = Store.getFavoritos();
  let lista = buscarAlimentos(texto, Store.getPersonalizados());
  lista = [...lista].sort((a, b) => (favs.includes(b.id) ? 1 : 0) - (favs.includes(a.id) ? 1 : 0));
  $('lista-alimentos').innerHTML = lista.slice(0, 60).map(a => `
    <button class="alimento-item" data-id="${a.id}">
      <div><div class="nom">${favs.includes(a.id) ? ico('estrella', 'fav', 14) : ''}${escaparHTML(a.n)}</div>
      <div class="det num">1 ${a.u} · ${a.g} g · P ${a.p} · C ${a.c} · G ${a.f}</div></div>
      <span class="kc num">${a.kcal} kcal</span>
    </button>`).join('') || '<div class="vacio">Sin resultados. Puedes crearlo abajo.</div>';
  $('lista-alimentos').querySelectorAll('.alimento-item').forEach(el => {
    el.onclick = () => abrirCantidad(el.dataset.id);
  });
}

function abrirCantidad(id) {
  const al = [...Store.getPersonalizados(), ...DB_ALIMENTOS].find(a => a.id === id);
  if (!al) return;
  App.alimentoSel = al;
  $('cant-nombre').textContent = al.n;
  $('cant-unidad-lbl').textContent = `Cantidad · ${al.u}`;
  $('cant-cantidad').value = 1;
  $('cant-comida').value = App.comidaDestino;
  actualizarFavBtn();
  previewCantidad();
  cerrarModal('modal-buscar');
  abrirModal('modal-cantidad');
}

function actualizarFavBtn() {
  const es = Store.esFavorito(App.alimentoSel.id);
  $('cant-fav').classList.toggle('fav-on', es);
}

function previewCantidad() {
  const al = App.alimentoSel;
  const cant = +$('cant-cantidad').value || 0;
  $('cant-preview').innerHTML = cajaNutri(al.kcal * cant, al.p * cant, al.c * cant, al.f * cant);
}

function cajaNutri(kcal, p, c, f) {
  return `
    <div><b class="num">${Math.round(kcal)}</b><span>kcal</span></div>
    <div><b class="num">${Math.round(p)}</b><span>Prot</span></div>
    <div><b class="num">${Math.round(c)}</b><span>Carb</span></div>
    <div><b class="num">${Math.round(f)}</b><span>Grasa</span></div>`;
}

function agregarDesdeCantidad() {
  const al = App.alimentoSel;
  const cant = +$('cant-cantidad').value;
  if (!cant || cant <= 0) return toast('Indica una cantidad válida', 'aviso');
  const comida = $('cant-comida').value;
  Store.agregarEntrada(App.fecha, comida, {
    nombre: al.n, cantidad: cant, unidad: al.u,
    kcal: al.kcal * cant, p: al.p * cant, c: al.c * cant, f: al.f * cant,
    porUnidad: { kcal: al.kcal, p: al.p, c: al.c, f: al.f },
  });
  cerrarModal('modal-cantidad');
  toast(`${al.n} agregado a ${COMIDAS_META[comida].nombre}`);
  renderHoy();
}

function guardarAlimentoCreado() {
  const nombre = $('cr-nombre').value.trim();
  const kcal = +$('cr-kcal').value;
  if (!nombre || !kcal) return toast('Indica al menos nombre y calorías', 'aviso');
  Store.agregarPersonalizado({
    n: nombre, u: $('cr-unidad').value, g: 100,
    kcal, p: +$('cr-p').value || 0, c: +$('cr-c').value || 0, f: +$('cr-f').value || 0,
  });
  cerrarModal('modal-crear');
  toast('Alimento guardado');
  abrirBuscador();
}

/* ════════════ EDITAR ENTRADA ════════════ */
function abrirEditarEntrada(comida, id) {
  const dia = Store.getDia(App.fecha);
  const e = dia.comidas[comida].find(x => x.id === id);
  if (!e) return;
  App.entradaSel = { comida, id, entrada: e };
  $('ent-nombre').textContent = e.nombre;
  $('ent-lbl').textContent = `Cantidad · ${e.unidad}`;
  $('ent-cantidad').value = e.cantidad;
  previewEntrada();
  abrirModal('modal-entrada');
}

function porUnidadDe(e) {
  if (e.porUnidad) return e.porUnidad;
  const c = e.cantidad || 1;
  return { kcal: e.kcal / c, p: e.p / c, c: e.c / c, f: e.f / c };
}

function previewEntrada() {
  const { entrada } = App.entradaSel;
  const pu = porUnidadDe(entrada);
  const cant = +$('ent-cantidad').value || 0;
  $('ent-preview').innerHTML = cajaNutri(pu.kcal * cant, pu.p * cant, pu.c * cant, pu.f * cant);
}

function guardarEntradaEditada() {
  const { comida, id, entrada } = App.entradaSel;
  const cant = +$('ent-cantidad').value;
  if (!cant || cant <= 0) return toast('Cantidad no válida', 'aviso');
  const pu = porUnidadDe(entrada);
  Store.actualizarEntrada(App.fecha, comida, id, {
    cantidad: cant, kcal: pu.kcal * cant, p: pu.p * cant, c: pu.c * cant, f: pu.f * cant, porUnidad: pu,
  });
  cerrarModal('modal-entrada');
  renderHoy();
}

/* ════════════ IA ════════════ */
async function analizarFoto(archivo, modo) {
  if (!IA.hayClave()) { avisarSinClave(); return; }
  mostrarCargando(modo === 'etiqueta' ? 'Leyendo la etiqueta nutricional…' : 'La IA está identificando tu comida…');
  try {
    const { base64, mediaType } = await prepararImagen(archivo);
    const resultado = await IA.analizarImagen(base64, mediaType, modo);
    ocultarCargando();
    mostrarResultadosIA(resultado);
  } catch (e) { ocultarCargando(); toast(e.message, 'error'); }
}

async function analizarDescripcion() {
  const texto = $('desc-texto').value.trim();
  if (!texto) return toast('Describe qué comiste', 'aviso');
  if (!IA.hayClave()) { cerrarModal('modal-describir'); avisarSinClave(); return; }
  cerrarModal('modal-describir');
  mostrarCargando('Calculando calorías de tu descripción…');
  try {
    const resultado = await IA.analizarTexto(texto);
    ocultarCargando();
    mostrarResultadosIA(resultado);
  } catch (e) { ocultarCargando(); toast(e.message, 'error'); }
}

function avisarSinClave() {
  toast('Configura tu clave de API en Perfil → Inteligencia artificial', 'aviso');
  cambiarTab('perfil');
}

function mostrarResultadosIA(resultado) {
  App.iaResultado = resultado.alimentos.map(a => ({
    ...a, incluir: true,
    porUnidad: {
      kcal: a.kcal / (a.cantidad || 1), p: a.proteina / (a.cantidad || 1),
      c: a.carbohidratos / (a.cantidad || 1), f: a.grasa / (a.cantidad || 1),
    },
  }));
  $('ia-comentario').innerHTML = `${ico('ia', '', 18)}<span>${escaparHTML(resultado.comentario || 'Esto fue lo que detecté:')}</span>`;
  $('ia-comida').value = App.comidaDestino;
  renderListaIA();
  abrirModal('modal-ia');
}

function renderListaIA() {
  $('ia-lista').innerHTML = App.iaResultado.map((a, i) => `
    <div class="ia-item">
      <input type="checkbox" data-i="${i}" ${a.incluir ? 'checked' : ''}>
      <div class="cuerpo">
        <div class="nom">${escaparHTML(a.nombre)} <span class="conf conf-${a.confianza}">${a.confianza}</span></div>
        <div class="det num">${escaparHTML(a.unidad)} · ~${Math.round(a.gramos)} g · P ${Math.round(a.proteina)} C ${Math.round(a.carbohidratos)} G ${Math.round(a.grasa)}</div>
      </div>
      <input type="number" class="cant-mini num" data-i="${i}" value="${formatoCantidad(a.cantidad)}" min="0.1" step="0.5">
      <div class="kc num" data-kc="${i}">${Math.round(a.kcal)}</div>
    </div>`).join('');
  actualizarTotalIA();
  $('ia-lista').querySelectorAll('input[type="checkbox"]').forEach(ch => {
    ch.onchange = () => { App.iaResultado[+ch.dataset.i].incluir = ch.checked; actualizarTotalIA(); };
  });
  $('ia-lista').querySelectorAll('.cant-mini').forEach(inp => {
    inp.oninput = () => {
      const i = +inp.dataset.i, a = App.iaResultado[i], cant = +inp.value || 0;
      a.cantidad = cant;
      a.kcal = a.porUnidad.kcal * cant; a.proteina = a.porUnidad.p * cant;
      a.carbohidratos = a.porUnidad.c * cant; a.grasa = a.porUnidad.f * cant;
      document.querySelector(`[data-kc="${i}"]`).textContent = Math.round(a.kcal);
      actualizarTotalIA();
    };
  });
}

function actualizarTotalIA() {
  const total = App.iaResultado.filter(a => a.incluir).reduce((s, a) => s + a.kcal, 0);
  $('ia-total').textContent = `Total seleccionado: ${Math.round(total).toLocaleString('es-MX')} kcal`;
}

function agregarResultadosIA() {
  const comida = $('ia-comida').value;
  const sel = App.iaResultado.filter(a => a.incluir && a.cantidad > 0);
  if (sel.length === 0) return toast('Selecciona al menos un alimento', 'aviso');
  sel.forEach(a => Store.agregarEntrada(App.fecha, comida, {
    nombre: a.nombre, cantidad: a.cantidad, unidad: a.unidad,
    kcal: a.kcal, p: a.proteina, c: a.carbohidratos, f: a.grasa,
    porUnidad: a.porUnidad, origenIA: true,
  }));
  cerrarModal('modal-ia');
  toast(`${sel.length} alimento${sel.length > 1 ? 's' : ''} agregado${sel.length > 1 ? 's' : ''} a ${COMIDAS_META[comida].nombre}`);
  renderHoy();
}

/* ════════════ ESCÁNER ════════════ */
function abrirEscaner() {
  cerrarModal('sheet-agregar');
  $('esc-manual').value = '';
  $('escaner-estado').textContent = 'Activa la cámara o sube una foto del código';
  abrirModal('modal-escaner');
}

async function iniciarCamaraEscaner() {
  $('escaner-estado').textContent = 'Abriendo cámara…';
  try {
    await Escaner.iniciarCamara($('escaner-video'), codigoEncontrado, msg => { $('escaner-estado').textContent = msg; });
    $('escaner-estado').textContent = 'Apunta la cámara al código de barras';
  } catch (e) { $('escaner-estado').textContent = e.message; }
}

async function codigoEncontrado(codigo) {
  $('escaner-estado').textContent = `Código ${codigo} — buscando…`;
  mostrarCargando('Buscando el producto…');
  try {
    const prod = await Escaner.buscarProducto(codigo);
    ocultarCargando();
    cerrarModal('modal-escaner');
    mostrarProducto(prod);
  } catch (e) {
    ocultarCargando();
    if (e.noEncontrado || e.sinDatos) toast(e.message + ' Prueba con "Etiqueta nutricional · IA".', 'aviso');
    else toast(e.message, 'error');
  }
}

function mostrarProducto(prod) {
  App.productoSel = prod;
  $('prod-info').innerHTML = `
    <div class="prod-cabecera">
      ${prod.imagen ? `<img src="${prod.imagen}" alt="">` : `<div class="sin-img">${ico('etiqueta', '', 26)}</div>`}
      <div>
        <div class="nom">${escaparHTML(prod.nombre)}</div>
        <div class="marca">${escaparHTML(prod.marca)}</div>
        <div class="marca num">${prod.por100g.kcal} kcal por 100 g</div>
      </div>
    </div>`;
  const sel = $('prod-modo');
  sel.querySelector('[value="porcion"]').disabled = !prod.porcionG;
  sel.querySelector('[value="paquete"]').disabled = !prod.paqueteG;
  sel.value = 'gramos';
  $('prod-cantidad').value = prod.porcionG || 100;
  $('prod-comida').value = App.comidaDestino;
  actualizarModoProducto();
  abrirModal('modal-producto');
}

function actualizarModoProducto() {
  const modo = $('prod-modo').value;
  $('prod-cant-lbl').textContent = { gramos: 'Gramos / ml', porcion: 'Porciones', paquete: 'Paquetes' }[modo];
  $('prod-cantidad').value = modo === 'gramos' ? (App.productoSel.porcionG || 100) : 1;
  previewProducto();
}

function gramosProducto() {
  const prod = App.productoSel, modo = $('prod-modo').value, cant = +$('prod-cantidad').value || 0;
  if (modo === 'gramos') return cant;
  if (modo === 'porcion') return cant * (prod.porcionG || 0);
  return cant * (prod.paqueteG || 0);
}

function previewProducto() {
  const prod = App.productoSel, fx = gramosProducto() / 100;
  $('prod-preview').innerHTML = cajaNutri(prod.por100g.kcal * fx, prod.por100g.p * fx, prod.por100g.c * fx, prod.por100g.f * fx);
}

function agregarProducto() {
  const prod = App.productoSel, g = gramosProducto();
  if (!g || g <= 0) return toast('Cantidad no válida', 'aviso');
  const fx = g / 100, comida = $('prod-comida').value;
  Store.agregarEntrada(App.fecha, comida, {
    nombre: prod.nombre + (prod.marca ? ` · ${prod.marca.split(',')[0]}` : ''),
    cantidad: g, unidad: 'g',
    kcal: prod.por100g.kcal * fx, p: prod.por100g.p * fx, c: prod.por100g.c * fx, f: prod.por100g.f * fx,
    porUnidad: { kcal: prod.por100g.kcal / 100, p: prod.por100g.p / 100, c: prod.por100g.c / 100, f: prod.por100g.f / 100 },
    codigo: prod.codigo,
  });
  cerrarModal('modal-producto');
  toast('Producto agregado');
  renderHoy();
}

/* ════════════ PROGRESO ════════════ */
function renderProgreso() {
  const perfil = Store.getPerfil();
  if (!perfil) return;
  const pesos = Store.getPesos();
  const pesoActual = Store.ultimoPeso() || perfil.pesoKg;
  const plan = planActual();
  const imc = Nutricion.imc(perfil, pesoActual);
  const porCambiar = pesoActual - perfil.pesoMeta;
  const enMeta = Math.abs(porCambiar) <= 0.2;

  $('peso-resumen').innerHTML = `
    <div class="peso-grande">
      <div>
        <div class="numero num">${pesoActual.toFixed(1)}<small> kg</small></div>
        <div class="meta-txt">Meta <b class="num">${perfil.pesoMeta} kg</b> ${enMeta ? '· objetivo alcanzado' : `· ${porCambiar > 0 ? 'faltan ' : 'faltan +'}${Math.abs(porCambiar).toFixed(1)} kg`}</div>
        ${plan.fechaEstimada && !enMeta ? `<div class="meta-txt">Proyección: <b>${fechaLarga(plan.fechaEstimada)}</b></div>` : ''}
      </div>
      <button class="btn-primario" style="width:auto;margin:0;padding:12px 16px" id="btn-peso">${ico('bascula', '', 18)}Registrar</button>
    </div>`;
  $('btn-peso').onclick = () => { $('peso-valor').value = pesoActual; abrirModal('modal-peso'); };

  $('grafica-peso').innerHTML = Graficas.peso(pesos, perfil.pesoMeta);

  const registro = Store.getRegistroCompleto();
  const dias = [];
  for (let i = 13; i >= 0; i--) {
    const f = fechaISO(new Date(Date.now() - i * 86400000));
    const t = registro[f] ? Nutricion.totalesDia(Store.getDia(f)) : { kcal: 0 };
    dias.push({ fecha: f, kcal: t.kcal });
  }
  $('grafica-kcal').innerHTML = Graficas.calorias(dias, plan.objetivo);

  // Simulador de desviación acumulada
  const dv = Nutricion.resumenDesviacion(registro, plan.objetivo);
  $('desviacion-contenedor').innerHTML = `
    <div class="tarjeta-titulo">${ico('balanza')}Simulador de desviación</div>
    ${dv.conDatos === 0 ? '<div class="vacio">Registra varios días para ver el impacto acumulado.</div>' : `
    <div class="balance-fila">
      <div class="balance-celda"><span class="micro">Desvío acumulado</span><b class="num" style="color:${dv.desvioAcumulado > 0 ? 'var(--rojo)' : 'var(--acento)'}">${dv.desvioAcumulado > 0 ? '+' : ''}${dv.desvioAcumulado.toLocaleString('es-MX')} kcal</b></div>
      <div class="balance-celda"><span class="micro">Impacto en peso</span><b class="num" style="color:${dv.gramosAcumulados > 0 ? 'var(--rojo)' : 'var(--acento)'}">${dv.gramosAcumulados > 0 ? '+' : ''}${(dv.gramosAcumulados / 1000).toFixed(2)} kg</b></div>
    </div>
    <div class="balance-nota">En los últimos ${dv.conDatos} días registrados${dv.promedioDiario === 0 ? ' has seguido tu plan al pie de la letra.' : dv.promedioDiario > 0 ? ` consumiste en promedio +${dv.promedioDiario} kcal/día sobre tu objetivo.` : ` quedaste en promedio ${dv.promedioDiario} kcal/día bajo tu objetivo.`}</div>`}`;

  const inicial = pesos.length ? pesos[0].peso : perfil.pesoKg;
  const cambio = pesoActual - inicial;
  const conDatos = dias.filter(d => d.kcal > 0);
  const promedio = conDatos.length ? Math.round(conDatos.reduce((s, d) => s + d.kcal, 0) / conDatos.length) : 0;
  $('estadisticas').innerHTML = `
    <div class="tarjeta-titulo">${ico('info')}Estadísticas</div>
    <div class="est-grid">
      <div class="est-celda"><b class="num">${cambio <= 0 ? '' : '+'}${cambio.toFixed(1)} kg</b><span>Cambio total</span></div>
      <div class="est-celda"><b class="num">${imc.valor}</b><span>IMC · ${imc.categoria}</span></div>
      <div class="est-celda"><b class="num">${promedio || '—'}</b><span>kcal promedio 14d</span></div>
      <div class="est-celda"><b class="num">${Nutricion.racha(registro)}</b><span>Días de racha</span></div>
    </div>`;
}

function guardarPeso() {
  const v = +$('peso-valor').value;
  if (!v || v < 30 || v > 300) return toast('Peso no válido', 'aviso');
  Store.agregarPeso(fechaISO(), v);
  const perfil = Store.getPerfil();
  perfil.pesoKg = v;
  Store.setPerfil(perfil);
  cerrarModal('modal-peso');
  toast(`Peso registrado · nuevo objetivo ${planActual().objetivo.toLocaleString('es-MX')} kcal/día`);
  renderTodo();
}

/* ════════════ EJERCICIO ════════════ */
function abrirEjercicio() {
  const sel = $('ej-tipo');
  sel.innerHTML = DB_EJERCICIOS.map((e, i) => `<option value="${i}">${e.n}</option>`).join('')
    + '<option value="otra">Otra actividad…</option>';
  sel.value = '0';
  $('ej-min').value = 30;
  $('ej-nombre').value = '';
  $('ej-campo-nombre').classList.add('oculto');
  calcEjercicio();
  abrirModal('modal-ejercicio');
}

function calcEjercicio() {
  const sel = $('ej-tipo').value;
  const min = +$('ej-min').value || 0;
  const nota = $('ej-nota');
  if (sel === 'otra') {
    $('ej-campo-nombre').classList.remove('oculto');
    nota.textContent = 'Escribe las calorías que quemaste de forma manual.';
    return;
  }
  $('ej-campo-nombre').classList.add('oculto');
  const perfil = Store.getPerfil();
  const peso = Store.ultimoPeso() || perfil.pesoKg;
  const ej = DB_EJERCICIOS[+sel];
  const kcal = caloriasEjercicio(ej.met, peso, min);
  $('ej-kcal').value = kcal;
  nota.textContent = `Estimado con tu peso (${peso} kg) y la intensidad de "${ej.n}". Puedes ajustar las calorías si quieres.`;
}

function guardarEjercicio() {
  const sel = $('ej-tipo').value;
  const min = +$('ej-min').value || 0;
  const kcal = +$('ej-kcal').value;
  let nombre;
  if (sel === 'otra') {
    nombre = $('ej-nombre').value.trim() || 'Ejercicio';
  } else {
    nombre = DB_EJERCICIOS[+sel].n + (min ? ` · ${min} min` : '');
  }
  if (!kcal || kcal <= 0) return toast('Indica los minutos o las calorías', 'aviso');
  Store.agregarEjercicio(App.fecha, { nombre, kcal: Math.round(kcal) });
  cerrarModal('modal-ejercicio');
  renderHoy();
}

/* ════════════ PERFIL ════════════ */
function renderPerfil() {
  const perfil = Store.getPerfil();
  if (!perfil) return;
  const plan = planActual();

  $('plan-resumen').innerHTML = `
    <div class="tarjeta-titulo">${ico('objetivo')}Tu plan calculado</div>
    <div class="plan-dato"><span>Metabolismo basal · TMB</span><b class="num">${plan.tmb.toLocaleString('es-MX')} kcal</b></div>
    <div class="plan-dato"><span>Gasto total diario · GETD</span><b class="num">${plan.getd.toLocaleString('es-MX')} kcal</b></div>
    <div class="plan-dato"><span>Factor de actividad</span><b class="num">${plan.factor}</b></div>
    <div class="plan-dato"><span>Objetivo diario</span><b class="num destacado">${plan.objetivo.toLocaleString('es-MX')} kcal</b></div>
    <div class="plan-dato"><span>${plan.deficitDiario >= 0 ? 'Déficit' : 'Superávit'} diario</span><b class="num">${Math.abs(plan.deficitDiario).toLocaleString('es-MX')} kcal</b></div>
    <div class="plan-dato"><span>Ritmo estimado</span><b class="num">${plan.direccion === 'mantener' ? 'mantenimiento' : `${plan.ritmoSemanal > 0 ? '−' : '+'}${Math.abs(plan.ritmoSemanal)} kg/sem`}</b></div>
    ${plan.fechaEstimada && plan.direccion !== 'mantener' ? `<div class="plan-dato"><span>Meta proyectada</span><b class="num">${fechaLarga(plan.fechaEstimada)}</b></div>` : ''}
    <div class="plan-dato"><span>Macros · P / C / G</span><b class="num">${plan.macros.p} / ${plan.macros.c} / ${plan.macros.f} g</b></div>
    ${plan.advertencia ? `<div class="nota-alerta">${ico('alerta', '', 18)}<span>${plan.advertencia}</span></div>` : ''}`;

  renderDistribucion(plan);

  $('pf-nombre').value = perfil.nombre;
  $('pf-edad').value = perfil.edad;
  $('pf-altura').value = perfil.alturaCm;
  $('pf-meta').value = perfil.pesoMeta;
  $('pf-fecha').value = perfil.fechaMeta;
  marcarSeg('pf-sexo', perfil.sexo);
  marcarSeg('pf-trabajo', perfil.trabajo || 'sentado');
  marcarSeg('pf-dias', String(perfil.diasEjercicio ?? 0));
  marcarSeg('pf-intensidad', perfil.intensidad || 'moderada');

  renderProveedorIA();
  $('aj-tema').checked = Store.getTema() === 'claro';
}

function renderProveedorIA() {
  const prov = Store.getProveedor();
  const info = IA.info(prov);
  marcarSeg('pf-proveedor', prov);
  const inp = $('pf-apikey');
  inp.placeholder = info.placeholder;
  inp.type = 'password';
  inp.value = Store.getApiKey(prov);
  $('pf-ayuda-ia').innerHTML = `${escaparHTML(info.ayuda)} <a href="${info.url}" target="_blank" rel="noopener" style="color:var(--acento);font-weight:700">Abrir</a>`;
  $('estado-clave').textContent = Store.getApiKey(prov)
    ? `Clave de ${info.nombre} configurada · la IA está activa.`
    : `Sin clave de ${info.nombre}: las funciones de IA están desactivadas.`;
}

function marcarSeg(id, valor) {
  $(id).querySelectorAll('button').forEach(b => b.classList.toggle('activo', b.dataset.v === valor));
}

function renderDistribucion(plan) {
  const d = Store.getDistribucion();
  ['desayuno', 'comida', 'cena', 'snack'].forEach(k => { $('dist-' + k).value = d[k]; });
  refrescarDistKcal(plan);
}

function refrescarDistKcal(plan) {
  plan = plan || planActual();
  const d = {
    desayuno: +$('dist-desayuno').value || 0, comida: +$('dist-comida').value || 0,
    cena: +$('dist-cena').value || 0, snack: +$('dist-snack').value || 0,
  };
  const total = d.desayuno + d.comida + d.cena + d.snack;
  const kcal = Nutricion.distribucionKcal(plan.objetivo, d);
  ['desayuno', 'comida', 'cena', 'snack'].forEach(k => { $('dist-kcal-' + k).textContent = `${kcal[k]} kcal`; });
  const tot = $('dist-total');
  tot.textContent = `Total: ${total}%${total !== 100 ? ' · debe sumar 100%' : ''}`;
  tot.classList.toggle('error', total !== 100);
  return total;
}

function guardarDistribucion() {
  const total = refrescarDistKcal();
  if (total !== 100) return toast('Los porcentajes deben sumar 100%', 'aviso');
  Store.setDistribucion({
    desayuno: +$('dist-desayuno').value || 0, comida: +$('dist-comida').value || 0,
    cena: +$('dist-cena').value || 0, snack: +$('dist-snack').value || 0,
  });
  toast('Distribución guardada');
  renderHoy();
}

function guardarPerfil() {
  const perfil = Store.getPerfil();
  perfil.nombre = $('pf-nombre').value.trim() || perfil.nombre;
  perfil.edad = +$('pf-edad').value || perfil.edad;
  perfil.alturaCm = +$('pf-altura').value || perfil.alturaCm;
  perfil.pesoMeta = +$('pf-meta').value || perfil.pesoMeta;
  perfil.fechaMeta = $('pf-fecha').value || perfil.fechaMeta;
  perfil.sexo = leerSeg('pf-sexo') || perfil.sexo;
  perfil.trabajo = leerSeg('pf-trabajo') || perfil.trabajo;
  perfil.diasEjercicio = +(leerSeg('pf-dias') ?? perfil.diasEjercicio);
  perfil.intensidad = leerSeg('pf-intensidad') || perfil.intensidad;
  delete perfil.actividad; // migra del esquema viejo
  Store.setPerfil(perfil);
  toast('Perfil actualizado · plan recalculado');
  renderTodo();
}

/* ════════════ EVENTOS ════════════ */
function conectarEventos() {
  // Onboarding
  $('ob-sig-1').onclick = () => {
    if (!$('ob-edad').value || !$('ob-altura').value) return toast('Completa tu edad y estatura', 'aviso');
    pasoOnboarding(2);
  };
  $('ob-sig-2').onclick = () => {
    if (!$('ob-peso').value) return toast('Indica tu peso actual', 'aviso');
    pasoOnboarding(3);
    actualizarResumenOnboarding();
  };
  $('ob-atras-2').onclick = () => pasoOnboarding(1);
  $('ob-atras-3').onclick = () => pasoOnboarding(2);
  ['ob-meta', 'ob-fecha'].forEach(id => { $(id).oninput = actualizarResumenOnboarding; });
  $('ob-fin').onclick = () => {
    const p = perfilDesdeOnboarding();
    if (!p.pesoMeta || !p.fechaMeta) return toast('Completa tu meta y fecha', 'aviso');
    Store.setPerfil(p);
    Store.agregarPeso(fechaISO(), p.pesoKg);
    $('onboarding').classList.add('oculto');
    toast(`Listo, ${p.nombre}. Tu plan está calculado.`);
    renderTodo();
  };

  // Segmentos
  document.querySelectorAll('.seg').forEach(seg => {
    seg.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      seg.querySelectorAll('button').forEach(x => x.classList.remove('activo'));
      b.classList.add('activo');
      if (seg.closest('.ob-paso')) actualizarResumenOnboarding();
    }));
  });

  // Navegación
  document.querySelectorAll('.nav-btn[data-tab]').forEach(b => b.onclick = () => cambiarTab(b.dataset.tab));
  $('nav-escaner').onclick = abrirEscaner;
  $('fab-agregar').onclick = () => abrirModal('sheet-agregar');
  $('fecha-ant').onclick = () => moverFecha(-1);
  $('fecha-sig').onclick = () => moverFecha(1);
  $('fecha-txt').onclick = () => { App.fecha = fechaISO(); renderCabecera(); renderHoy(); };

  // Hoja de acciones
  document.querySelectorAll('#sheet-agregar .accion').forEach(b => {
    b.onclick = () => {
      const a = b.dataset.accion;
      cerrarModal('sheet-agregar');
      if (a === 'buscar') abrirBuscador();
      else if (a === 'foto') $('input-foto-plato').click();
      else if (a === 'etiqueta') $('input-foto-etiqueta').click();
      else if (a === 'describir') { $('desc-texto').value = ''; abrirModal('modal-describir'); }
      else if (a === 'codigo') abrirEscaner();
    };
  });

  // Fotos
  $('input-foto-plato').onchange = e => { if (e.target.files[0]) analizarFoto(e.target.files[0], 'plato'); e.target.value = ''; };
  $('input-foto-etiqueta').onchange = e => { if (e.target.files[0]) analizarFoto(e.target.files[0], 'etiqueta'); e.target.value = ''; };
  $('input-foto-codigo').onchange = async e => {
    const archivo = e.target.files[0]; e.target.value = '';
    if (!archivo) return;
    mostrarCargando('Buscando el código en la foto…');
    try {
      const codigo = await Escaner.detectarEnFoto(archivo);
      ocultarCargando();
      codigoEncontrado(codigo);
    } catch (err) { ocultarCargando(); toast(err.message, 'error'); }
  };

  // Buscador
  $('buscador').oninput = e => renderListaAlimentos(e.target.value);
  $('btn-crear-alimento').onclick = () => {
    cerrarModal('modal-buscar');
    ['cr-nombre', 'cr-kcal', 'cr-p', 'cr-c', 'cr-f'].forEach(id => $(id).value = '');
    abrirModal('modal-crear');
  };
  $('cr-guardar').onclick = guardarAlimentoCreado;

  // Cantidad
  $('cant-cantidad').oninput = previewCantidad;
  $('cant-agregar').onclick = agregarDesdeCantidad;
  $('cant-fav').onclick = () => { Store.toggleFavorito(App.alimentoSel.id); actualizarFavBtn(); };

  // Editar entrada
  $('ent-cantidad').oninput = previewEntrada;
  $('ent-guardar').onclick = guardarEntradaEditada;
  $('ent-eliminar').onclick = () => {
    const { comida, id } = App.entradaSel;
    Store.eliminarEntrada(App.fecha, comida, id);
    cerrarModal('modal-entrada');
    toast('Entrada eliminada');
    renderHoy();
  };

  // IA
  $('desc-analizar').onclick = analizarDescripcion;
  $('ia-agregar').onclick = agregarResultadosIA;

  // Escáner
  $('esc-camara').onclick = iniciarCamaraEscaner;
  $('esc-foto').onclick = () => $('input-foto-codigo').click();
  $('esc-buscar').onclick = () => { const c = $('esc-manual').value.trim(); if (c) codigoEncontrado(c); };
  $('esc-manual').onkeydown = e => { if (e.key === 'Enter') $('esc-buscar').click(); };

  // Producto
  $('prod-modo').onchange = actualizarModoProducto;
  $('prod-cantidad').oninput = previewProducto;
  $('prod-agregar').onclick = agregarProducto;

  // Peso y ejercicio
  $('peso-guardar').onclick = guardarPeso;
  $('ej-tipo').onchange = calcEjercicio;
  $('ej-min').oninput = calcEjercicio;
  $('ej-guardar').onclick = guardarEjercicio;

  // Distribución
  ['dist-desayuno', 'dist-comida', 'dist-cena', 'dist-snack'].forEach(id => {
    $(id).oninput = () => refrescarDistKcal();
  });
  $('dist-guardar').onclick = guardarDistribucion;

  // Perfil
  $('pf-guardar').onclick = guardarPerfil;
  $('pf-proveedor').querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => { Store.setProveedor(b.dataset.v); renderProveedorIA(); });
  });
  $('pf-guardar-clave').onclick = () => {
    const prov = Store.getProveedor();
    Store.setApiKey(prov, $('pf-apikey').value);
    renderProveedorIA();
    toast(Store.getApiKey(prov) ? 'Clave guardada en tu dispositivo' : 'Clave eliminada');
  };
  $('pf-ver-clave').onclick = () => {
    const inp = $('pf-apikey');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  };

  // Ajustes
  $('aj-tema').onchange = e => {
    const t = e.target.checked ? 'claro' : 'oscuro';
    Store.setTema(t);
    document.documentElement.dataset.theme = t;
  };
  $('aj-exportar').onclick = () => {
    const blob = new Blob([Store.exportar()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `nutriia-respaldo-${fechaISO()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Respaldo descargado');
  };
  $('aj-importar').onclick = () => $('input-importar').click();
  $('input-importar').onchange = async e => {
    const archivo = e.target.files[0]; e.target.value = '';
    if (!archivo) return;
    try {
      Store.importar(await archivo.text());
      toast('Datos importados');
      setTimeout(() => location.reload(), 700);
    } catch { toast('Archivo de respaldo no válido', 'error'); }
  };
  $('aj-reset').onclick = () => {
    if (confirm('¿Borrar TODOS tus datos? Esta acción no se puede deshacer.\n\nSugerencia: exporta un respaldo primero.')) {
      Store.borrarTodo();
      location.reload();
    }
  };

  // Cerrar modales
  document.querySelectorAll('[data-cerrar]').forEach(b => b.onclick = () => cerrarModal(b.dataset.cerrar));
  document.querySelectorAll('.modal-fondo').forEach(fondo => {
    fondo.addEventListener('click', e => {
      if (e.target === fondo && fondo.id !== 'modal-cargando') cerrarModal(fondo.id);
    });
  });
}

/* ════════════ UTILIDADES ════════════ */
function abrirModal(id) { $(id).classList.remove('oculto'); }
function cerrarModal(id) {
  $(id).classList.add('oculto');
  if (id === 'modal-escaner') Escaner.detener();
}
function mostrarCargando(txt) { $('cargando-txt').textContent = txt; abrirModal('modal-cargando'); }
function ocultarCargando() { cerrarModal('modal-cargando'); }

function toast(msg, tipo = 'ok') {
  const t = document.createElement('div');
  t.className = 'toast' + (tipo === 'error' ? ' error' : tipo === 'aviso' ? ' aviso' : '');
  const icono = tipo === 'error' ? 'alerta' : tipo === 'aviso' ? 'info' : 'visto';
  t.innerHTML = `${ico(icono, '', 18)}<span>${escaparHTML(msg)}</span>`;
  $('toasts').appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 3200);
  setTimeout(() => t.remove(), 3600);
}

function escaparHTML(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function formatoCantidad(n) {
  return (+n).toFixed(2).replace(/\.?0+$/, '');
}

function fechaLarga(d) {
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

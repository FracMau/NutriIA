/* ════════════════════════════════════════════
   NutriIA — storage.js
   Guardado local (localStorage) de todo el estado
   ════════════════════════════════════════════ */
'use strict';

const Store = {
  PREFIJO: 'nutriia.',

  get(clave, defecto = null) {
    try {
      const v = localStorage.getItem(this.PREFIJO + clave);
      return v === null ? defecto : JSON.parse(v);
    } catch { return defecto; }
  },
  set(clave, valor) {
    localStorage.setItem(this.PREFIJO + clave, JSON.stringify(valor));
  },
  del(clave) { localStorage.removeItem(this.PREFIJO + clave); },

  // ── Perfil ──
  getPerfil()        { return this.get('perfil'); },
  setPerfil(p)       { this.set('perfil', p); },

  // ── Distribución de comidas (porcentajes) ──
  getDistribucion()  { return this.get('distribucion', { desayuno: 30, comida: 40, cena: 20, snack: 10 }); },
  setDistribucion(d) { this.set('distribucion', d); },

  // ── IA: proveedor y claves (una por proveedor) ──
  getProveedor()     { return this.get('proveedor', 'gemini'); },
  setProveedor(p)    { this.set('proveedor', p); },
  getApiKey(prov)    {
    const claves = this.get('apikeys', {});
    // migración del esquema viejo (una sola clave global de Claude)
    if (!claves.claude && this.get('apikey')) claves.claude = this.get('apikey');
    return (claves[prov || this.getProveedor()] || '').trim();
  },
  setApiKey(prov, k) {
    const claves = this.get('apikeys', {});
    claves[prov] = (k || '').trim();
    this.set('apikeys', claves);
  },

  // ── Registro diario ──
  // estructura: { comidas: {desayuno:[], comida:[], cena:[], snack:[]}, agua: 0, ejercicio: [] }
  diaVacio() {
    return { comidas: { desayuno: [], comida: [], cena: [], snack: [] }, agua: 0, ejercicio: [] };
  },
  getDia(fecha) {
    const log = this.get('registro', {});
    const d = log[fecha];
    if (!d) return this.diaVacio();
    // garantiza estructura completa para días viejos
    return Object.assign(this.diaVacio(), d, {
      comidas: Object.assign(this.diaVacio().comidas, d.comidas || {}),
    });
  },
  setDia(fecha, dia) {
    const log = this.get('registro', {});
    log[fecha] = dia;
    this.set('registro', log);
  },
  getRegistroCompleto() { return this.get('registro', {}); },

  agregarEntrada(fecha, comida, entrada) {
    const dia = this.getDia(fecha);
    entrada.id = 'e' + Date.now() + Math.random().toString(36).slice(2, 6);
    dia.comidas[comida].push(entrada);
    this.setDia(fecha, dia);
    this.agregarReciente(entrada.nombre);
    return entrada.id;
  },
  eliminarEntrada(fecha, comida, id) {
    const dia = this.getDia(fecha);
    dia.comidas[comida] = dia.comidas[comida].filter(e => e.id !== id);
    this.setDia(fecha, dia);
  },
  actualizarEntrada(fecha, comida, id, cambios) {
    const dia = this.getDia(fecha);
    const e = dia.comidas[comida].find(x => x.id === id);
    if (e) Object.assign(e, cambios);
    this.setDia(fecha, dia);
  },

  setAgua(fecha, vasos) {
    const dia = this.getDia(fecha);
    dia.agua = vasos;
    this.setDia(fecha, dia);
  },

  agregarEjercicio(fecha, ej) {
    const dia = this.getDia(fecha);
    ej.id = 'x' + Date.now();
    dia.ejercicio.push(ej);
    this.setDia(fecha, dia);
  },
  eliminarEjercicio(fecha, id) {
    const dia = this.getDia(fecha);
    dia.ejercicio = dia.ejercicio.filter(e => e.id !== id);
    this.setDia(fecha, dia);
  },

  // ── Pesos ──
  getPesos() { return this.get('pesos', []); },
  agregarPeso(fecha, peso) {
    let pesos = this.getPesos().filter(p => p.fecha !== fecha);
    pesos.push({ fecha, peso });
    pesos.sort((a, b) => a.fecha.localeCompare(b.fecha));
    this.set('pesos', pesos);
  },
  ultimoPeso() {
    const pesos = this.getPesos();
    return pesos.length ? pesos[pesos.length - 1].peso : null;
  },

  // ── Alimentos personalizados / favoritos / recientes ──
  getPersonalizados() { return this.get('personalizados', []); },
  agregarPersonalizado(al) {
    const lista = this.getPersonalizados();
    al.id = 'custom-' + Date.now();
    al.personalizado = true;
    lista.unshift(al);
    this.set('personalizados', lista);
  },

  getFavoritos() { return this.get('favoritos', []); },
  toggleFavorito(id) {
    let favs = this.getFavoritos();
    if (favs.includes(id)) favs = favs.filter(f => f !== id);
    else favs.push(id);
    this.set('favoritos', favs);
    return favs.includes(id);
  },
  esFavorito(id) { return this.getFavoritos().includes(id); },

  getRecientes() { return this.get('recientes', []); },
  agregarReciente(nombre) {
    let rec = this.getRecientes().filter(r => r !== nombre);
    rec.unshift(nombre);
    this.set('recientes', rec.slice(0, 8));
  },

  // ── Tema ──
  getTema() { return this.get('tema', 'oscuro'); },
  setTema(t) { this.set('tema', t); },

  // ── Exportar / importar / borrar ──
  exportar() {
    const datos = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(this.PREFIJO)) datos[k] = localStorage.getItem(k);
    }
    return JSON.stringify({ app: 'NutriIA', version: 1, fecha: new Date().toISOString(), datos }, null, 2);
  },
  importar(json) {
    const obj = JSON.parse(json);
    if (!obj || obj.app !== 'NutriIA' || !obj.datos) throw new Error('Archivo no válido');
    Object.entries(obj.datos).forEach(([k, v]) => {
      if (k.startsWith(this.PREFIJO)) localStorage.setItem(k, v);
    });
  },
  borrarTodo() {
    const claves = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(this.PREFIJO)) claves.push(k);
    }
    claves.forEach(k => localStorage.removeItem(k));
  },
};

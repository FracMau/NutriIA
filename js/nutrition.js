/* ════════════════════════════════════════════
   NutriIA — nutrition.js
   Motor de cálculo profesional:
   · Mifflin-St Jeor (TMB) + factor de actividad real (cuestionario)
   · Déficit/superávit por tiempo con límites biológicos
   · Distribución de comidas configurable
   · Simulador de desviación (impacto en gramos)
   ════════════════════════════════════════════ */
'use strict';

const KCAL_POR_KG = 7700;        // ≈ kcal equivalentes a 1 kg de grasa corporal

const Nutricion = {

  /* ── Factor de actividad derivado del cuestionario ──
     Combina el gasto del día base (trabajo) con el ejercicio semanal real.
     Evita la sobreestimación de las listas desplegables tradicionales. */
  factorActividad(perfil) {
    // Compatibilidad: perfiles viejos guardaban un factor numérico directo
    if (perfil.actividad && !perfil.trabajo) return +perfil.actividad;

    const baseTrabajo = { sentado: 1.2, depie: 1.35, fisico: 1.5 };
    const base = baseTrabajo[perfil.trabajo] ?? 1.2;

    // Incremento por ejercicio real: cada sesión semanal añade gasto,
    // promediado sobre los 7 días de la semana.
    const dias = +perfil.diasEjercicio || 0;
    const incPorSesion = { ligera: 0.10, moderada: 0.16, alta: 0.24 };
    const inc = incPorSesion[perfil.intensidad] ?? 0.16;
    const factor = base + (dias * inc) / 7 * 3.5;

    return +Math.min(1.95, factor).toFixed(3);
  },

  /** Tasa metabólica basal — Mifflin-St Jeor */
  tmb(perfil, peso) {
    const base = 10 * peso + 6.25 * perfil.alturaCm - 5 * perfil.edad;
    return perfil.sexo === 'm' ? base + 5 : base - 161;
  },

  /** Gasto energético total diario */
  getd(perfil, peso) {
    return this.tmb(perfil, peso) * this.factorActividad(perfil);
  },

  /**
   * Plan completo: objetivo calórico para alcanzar el peso meta en la fecha
   * objetivo, con límites de seguridad biológicos.
   */
  plan(perfil, pesoActual) {
    const peso = pesoActual || perfil.pesoKg;
    const getd = Math.round(this.getd(perfil, peso));
    const tmb = Math.round(this.tmb(perfil, peso));

    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const fin = new Date(perfil.fechaMeta + 'T00:00:00');
    const dias = Math.max(1, Math.round((fin - hoy) / 86400000));

    const kgPorCambiar = peso - perfil.pesoMeta;          // + bajar · − subir
    const direccion = Math.abs(kgPorCambiar) <= 0.15 ? 'mantener' : (kgPorCambiar > 0 ? 'bajar' : 'subir');
    const ajusteNecesario = (kgPorCambiar * KCAL_POR_KG) / dias;  // kcal/día (+ déficit)

    let objetivo = Math.round(getd - ajusteNecesario);
    let advertencia = null;
    let metaNoSaludable = false;

    // Límites de seguridad
    const minimoSalud = perfil.sexo === 'm' ? 1500 : 1200;
    const minimo = Math.max(minimoSalud, Math.round(tmb * 0.85));
    const MAX_DEFICIT = 1000;
    const MAX_SUPERAVIT = 500;

    if (direccion === 'bajar' && ajusteNecesario > MAX_DEFICIT) {
      objetivo = getd - MAX_DEFICIT;
      metaNoSaludable = true;
      advertencia = 'Meta no saludable para esa fecha: requeriría un déficit superior a 1000 kcal/día. Ajustamos a un déficit máximo seguro — amplía el plazo para alcanzarla a tiempo.';
    } else if (direccion === 'subir' && -ajusteNecesario > MAX_SUPERAVIT) {
      objetivo = getd + MAX_SUPERAVIT;
      metaNoSaludable = true;
      advertencia = 'Para ganar peso de forma sana limitamos el superávit a 500 kcal/día. Amplía el plazo para llegar a tu meta sin exceso de grasa.';
    }
    if (objetivo < minimo) {
      objetivo = minimo;
      metaNoSaludable = true;
      advertencia = `Por seguridad, tu objetivo no baja de ${minimo} kcal/día (basado en tu metabolismo). El plan tomará un poco más de tiempo.`;
    }
    objetivo = Math.round(objetivo);

    // Proyección real con el objetivo ya ajustado
    const deficitReal = getd - objetivo;
    let fechaEstimada = null;
    if (direccion === 'mantener') {
      fechaEstimada = hoy;
    } else if (Math.abs(deficitReal) > 40 && Math.sign(deficitReal) === Math.sign(kgPorCambiar)) {
      const diasReales = Math.ceil(Math.abs(kgPorCambiar) * KCAL_POR_KG / Math.abs(deficitReal));
      const f = new Date(hoy); f.setDate(f.getDate() + diasReales);
      fechaEstimada = f;
    }

    const ritmoSemanal = +(deficitReal * 7 / KCAL_POR_KG).toFixed(2); // kg/semana (+ pierde)

    // Macros: proteína 1.8 g/kg, grasa 27% de kcal, resto carbohidratos
    const protG = Math.round(peso * 1.8);
    const grasaG = Math.round(objetivo * 0.27 / 9);
    const carbG = Math.max(0, Math.round((objetivo - protG * 4 - grasaG * 9) / 4));

    return {
      tmb, getd, objetivo, advertencia, metaNoSaludable, fechaEstimada,
      ritmoSemanal, direccion,
      deficitDiario: Math.round(deficitReal),
      diasRestantes: dias,
      factor: this.factorActividad(perfil),
      macros: { p: protG, c: carbG, f: grasaG },
    };
  },

  /* ── Distribución de comidas ──
     Reparte el objetivo entre comidas según porcentajes.
     Si una comida está en 0%, su parte se reparte entre las demás. */
  DIST_DEFECTO: { desayuno: 30, comida: 40, cena: 20, snack: 10 },

  distribucionKcal(objetivo, dist) {
    const d = dist || this.DIST_DEFECTO;
    const total = Object.values(d).reduce((s, v) => s + (+v || 0), 0) || 100;
    const res = {};
    for (const [k, v] of Object.entries(d)) {
      res[k] = Math.round(objetivo * (+v || 0) / total);
    }
    return res;
  },

  /* ── Simulador de desviación ──
     Convierte un desvío calórico (consumido − objetivo) en gramos de peso.
     Positivo = exceso (subes) · Negativo = déficit (bajas). */
  impactoGramos(desvioKcal) {
    return Math.round((desvioKcal / KCAL_POR_KG) * 1000);
  },

  /** Resumen de desviación de los últimos N días con datos */
  resumenDesviacion(registro, objetivo, nDias = 14) {
    const filas = [];
    let acumKcal = 0, conDatos = 0;
    for (let i = nDias - 1; i >= 0; i--) {
      const f = fechaISO(new Date(Date.now() - i * 86400000));
      if (!registro[f]) continue;
      const t = this.totalesDia(Store.getDia(f));
      if (t.kcal === 0) continue;
      const presupuesto = objetivo + t.ejercicio;
      const desvio = t.kcal - presupuesto;
      acumKcal += desvio;
      conDatos++;
      filas.push({ fecha: f, desvio });
    }
    return {
      conDatos,
      desvioAcumulado: Math.round(acumKcal),
      gramosAcumulados: this.impactoGramos(acumKcal),
      promedioDiario: conDatos ? Math.round(acumKcal / conDatos) : 0,
    };
  },

  /** IMC y categoría */
  imc(perfil, peso) {
    const m = perfil.alturaCm / 100;
    const v = peso / (m * m);
    let cat = 'Saludable';
    if (v < 18.5) cat = 'Bajo peso';
    else if (v >= 30) cat = 'Obesidad';
    else if (v >= 25) cat = 'Sobrepeso';
    return { valor: +v.toFixed(1), categoria: cat };
  },

  /** Vasos de agua (250 ml): ~35 ml por kg */
  vasosAguaMeta(peso) {
    return Math.min(12, Math.max(6, Math.round(peso * 35 / 250)));
  },

  /** Totales de un día */
  totalesDia(dia) {
    const t = { kcal: 0, p: 0, c: 0, f: 0, porComida: {} };
    for (const [nombre, entradas] of Object.entries(dia.comidas)) {
      let sub = 0;
      for (const e of entradas) {
        t.kcal += e.kcal; t.p += e.p || 0; t.c += e.c || 0; t.f += e.f || 0;
        sub += e.kcal;
      }
      t.porComida[nombre] = Math.round(sub);
    }
    t.ejercicio = (dia.ejercicio || []).reduce((s, e) => s + e.kcal, 0);
    t.kcal = Math.round(t.kcal);
    t.p = Math.round(t.p); t.c = Math.round(t.c); t.f = Math.round(t.f);
    return t;
  },

  /** Racha de días consecutivos con registro */
  racha(registro) {
    let dias = 0;
    const d = new Date();
    const tieneAlgo = f => {
      const dia = registro[f];
      return dia && Object.values(dia.comidas || {}).some(c => c.length > 0);
    };
    if (!tieneAlgo(fechaISO(d))) d.setDate(d.getDate() - 1);
    while (tieneAlgo(fechaISO(d))) { dias++; d.setDate(d.getDate() - 1); }
    return dias;
  },
};

/** Fecha local YYYY-MM-DD */
function fechaISO(d = new Date()) {
  const z = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

/** Formato corto legible */
function fechaBonita(iso) {
  const d = new Date(iso + 'T00:00:00');
  const hoy = fechaISO();
  const ayer = fechaISO(new Date(Date.now() - 86400000));
  if (iso === hoy) return 'Hoy';
  if (iso === ayer) return 'Ayer';
  return d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
}

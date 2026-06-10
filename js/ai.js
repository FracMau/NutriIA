/* ════════════════════════════════════════════
   NutriIA — ai.js
   Análisis de comida con IA · multi-proveedor
   · Gemini (Google) — nivel gratuito generoso, recomendado
   · Claude (Anthropic) — premium, de pago
   La clave la pone el usuario y se guarda solo en su dispositivo.
   ════════════════════════════════════════════ */
'use strict';

const IA = {
  /* Datos de cada proveedor para la interfaz */
  PROVEEDORES: {
    gemini: {
      nombre: 'Google Gemini',
      etiqueta: 'Gratis',
      modelo: 'gemini-2.0-flash',
      placeholder: 'AIza...',
      ayuda: 'Crea una clave gratuita en aistudio.google.com/apikey. Incluye ~1,500 análisis al día sin costo.',
      url: 'https://aistudio.google.com/apikey',
    },
    claude: {
      nombre: 'Claude · Anthropic',
      etiqueta: 'Premium',
      modelo: 'claude-opus-4-8',
      placeholder: 'sk-ant-...',
      ayuda: 'Crea una clave en platform.claude.com. Máxima precisión, pero tiene costo por uso.',
      url: 'https://platform.claude.com',
    },
  },

  proveedor() { return Store.getProveedor(); },
  info(prov) { return this.PROVEEDORES[prov || this.proveedor()]; },
  hayClave(prov) { return !!Store.getApiKey(prov || this.proveedor()); },

  SISTEMA: `Eres un nutriólogo experto en análisis visual de alimentos, con especialidad en comida mexicana y latinoamericana.

Tu trabajo: identificar CADA alimento, CONTAR las piezas exactas visibles (tortillas, tacos, huevos, rebanadas, galletas, etc.) y estimar porciones en gramos usando referencias visuales (tamaño del plato ≈ 26 cm, cubiertos, manos, latas).

Reglas:
- Si hay piezas contables, "cantidad" = número de piezas y "unidad" = "pieza". Cuenta con cuidado: si ves 3 tortillas, reporta 3.
- Si no es contable (arroz, frijoles, guisados), usa "unidad" = "porción" con cantidad 1 y estima los gramos del plato.
- "kcal", "proteina", "carbohidratos" y "grasa" son del TOTAL de esa línea (cantidad completa), no por unidad.
- Incluye TODO: salsas, aderezos, aceite visible, bebidas, guarniciones, pan, tortillas al lado.
- "confianza": alta = lo ves claramente; media = porción difícil de estimar; baja = el alimento es ambiguo u oculto.
- Usa valores nutricionales realistas de tablas mexicanas (ej. tortilla de maíz ≈ 64 kcal).
- "comentario": 1-2 frases útiles en español (qué viste, alguna duda, o un consejo breve).
- Responde únicamente con el JSON pedido, sin texto adicional ni markdown.`,

  PROMPTS: {
    plato: 'Analiza esta foto de mi comida. Identifica cada alimento, cuenta las piezas exactas y calcula calorías y macronutrientes de lo que voy a comer.',
    etiqueta: 'Esta foto es la TABLA NUTRIMENTAL de un producto empacado. Lee la etiqueta: nombre del producto, tamaño de porción y datos por porción. Devuelve UNA entrada en "alimentos" con cantidad = 1 porción y sus gramos, kcal y macros según la etiqueta. Si la etiqueta da datos por 100 g, conviértelos al tamaño de porción indicado. En "comentario" indica cuántas porciones trae el paquete si es visible.',
    texto: 'Comí lo siguiente (sin foto). Calcula calorías y macros respetando las cantidades y piezas que menciono:\n\n',
  },

  /* Esquema de los campos de cada alimento (compartido) */
  _camposAlimento() {
    return {
      nombre:        { type: 'string' },
      cantidad:      { type: 'number' },
      unidad:        { type: 'string' },
      gramos:        { type: 'number' },
      kcal:          { type: 'number' },
      proteina:      { type: 'number' },
      carbohidratos: { type: 'number' },
      grasa:         { type: 'number' },
      confianza:     { type: 'string', enum: ['alta', 'media', 'baja'] },
    };
  },

  /* ── Punto de entrada unificado ── */
  async analizarImagen(base64, mediaType, modo = 'plato') {
    const texto = this.PROMPTS[modo] || this.PROMPTS.plato;
    return this.proveedor() === 'gemini'
      ? this._gemini(texto, { base64, mediaType })
      : this._claude(texto, { base64, mediaType });
  },
  async analizarTexto(descripcion) {
    const texto = this.PROMPTS.texto + descripcion;
    return this.proveedor() === 'gemini'
      ? this._gemini(texto, null)
      : this._claude(texto, null);
  },

  _validarClave(prov) {
    if (!Store.getApiKey(prov)) {
      const err = new Error('Configura tu clave de ' + this.info(prov).nombre + ' en Perfil → Inteligencia artificial.');
      err.sinClave = true;
      throw err;
    }
  },

  /* ════════════ GEMINI ════════════ */
  async _gemini(texto, imagen) {
    this._validarClave('gemini');
    const clave = Store.getApiKey('gemini');
    const modelo = this.info('gemini').modelo;

    const partes = [];
    if (imagen) partes.push({ inline_data: { mime_type: imagen.mediaType, data: imagen.base64 } });
    partes.push({ text: texto });

    const cuerpo = {
      systemInstruction: { parts: [{ text: this.SISTEMA }] },
      contents: [{ role: 'user', parts: partes }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            alimentos: { type: 'array', items: { type: 'object', properties: this._camposAlimento(),
              required: ['nombre', 'cantidad', 'unidad', 'gramos', 'kcal', 'proteina', 'carbohidratos', 'grasa', 'confianza'] } },
            comentario: { type: 'string' },
          },
          required: ['alimentos', 'comentario'],
        },
      },
    };

    let resp;
    try {
      resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${encodeURIComponent(clave)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(cuerpo),
      });
    } catch {
      throw new Error('Sin conexión a internet. El análisis con IA necesita conexión.');
    }

    if (!resp.ok) {
      let detalle = '';
      try { detalle = (await resp.json()).error?.message || ''; } catch {}
      if (resp.status === 400 && /api key/i.test(detalle)) throw new Error('Clave de Gemini inválida. Revísala en Perfil.');
      if (resp.status === 403) throw new Error('Clave de Gemini sin permisos. Verifica que esté activa.');
      if (resp.status === 429) throw new Error('Llegaste al límite gratuito de Gemini por hoy. Intenta más tarde.');
      throw new Error('Error de Gemini (' + resp.status + '). ' + detalle);
    }

    const datos = await resp.json();
    const texto2 = datos.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
    if (!texto2) {
      if (datos.candidates?.[0]?.finishReason === 'SAFETY') throw new Error('La imagen fue bloqueada por filtros de seguridad. Prueba con otra foto.');
      throw new Error('Gemini no devolvió un resultado. Intenta de nuevo.');
    }
    return this._parsear(texto2);
  },

  /* ════════════ CLAUDE ════════════ */
  async _claude(texto, imagen) {
    this._validarClave('claude');
    const clave = Store.getApiKey('claude');

    const contenido = [];
    if (imagen) contenido.push({ type: 'image', source: { type: 'base64', media_type: imagen.mediaType, data: imagen.base64 } });
    contenido.push({ type: 'text', text: texto });

    const esquema = {
      type: 'object',
      properties: {
        alimentos: { type: 'array', items: { type: 'object', properties: this._camposAlimento(),
          required: ['nombre', 'cantidad', 'unidad', 'gramos', 'kcal', 'proteina', 'carbohidratos', 'grasa', 'confianza'],
          additionalProperties: false } },
        comentario: { type: 'string' },
      },
      required: ['alimentos', 'comentario'],
      additionalProperties: false,
    };

    let resp;
    try {
      resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': clave,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: this.info('claude').modelo,
          max_tokens: 16000,
          thinking: { type: 'adaptive' },
          system: this.SISTEMA,
          output_config: { format: { type: 'json_schema', schema: esquema } },
          messages: [{ role: 'user', content: contenido }],
        }),
      });
    } catch {
      throw new Error('Sin conexión a internet. El análisis con IA necesita conexión.');
    }

    if (!resp.ok) {
      let detalle = '';
      try { detalle = (await resp.json()).error?.message || ''; } catch {}
      if (resp.status === 401) throw new Error('Clave de Claude inválida. Revísala en Perfil.');
      if (resp.status === 429) throw new Error('Demasiadas solicitudes a Claude. Espera un momento.');
      if (resp.status === 529) throw new Error('El servicio de Claude está saturado. Intenta en unos minutos.');
      throw new Error('Error de Claude (' + resp.status + '). ' + detalle);
    }

    const datos = await resp.json();
    const bloque = (datos.content || []).find(b => b.type === 'text');
    if (!bloque) throw new Error('Claude no devolvió un resultado. Intenta de nuevo.');
    return this._parsear(bloque.text);
  },

  /* Convierte el texto JSON de cualquier proveedor en objeto validado */
  _parsear(texto) {
    let limpio = texto.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    let obj;
    try { obj = JSON.parse(limpio); }
    catch { throw new Error('La IA devolvió una respuesta inesperada. Intenta de nuevo.'); }
    if (!Array.isArray(obj.alimentos)) throw new Error('La IA no identificó alimentos. Intenta con otra foto o descripción.');
    return obj;
  },
};

/**
 * Redimensiona y convierte una imagen a base64 JPEG (máx 1568 px)
 * Devuelve { base64, mediaType }.
 */
function prepararImagen(archivo) {
  return new Promise((resolver, rechazar) => {
    const img = new Image();
    const url = URL.createObjectURL(archivo);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1568;
      let { width: w, height: h } = img;
      if (Math.max(w, h) > MAX) {
        const esc = MAX / Math.max(w, h);
        w = Math.round(w * esc); h = Math.round(h * esc);
      }
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);
      const dataUrl = cv.toDataURL('image/jpeg', 0.85);
      resolver({ base64: dataUrl.split(',')[1], mediaType: 'image/jpeg' });
    };
    img.onerror = () => { URL.revokeObjectURL(url); rechazar(new Error('No se pudo leer la imagen.')); };
    img.src = url;
  });
}

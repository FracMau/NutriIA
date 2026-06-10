/* ════════════════════════════════════════════
   NutriIA — scanner.js
   Escáner de códigos de barras:
   1) BarcodeDetector nativo (Chrome/Android)
   2) Respaldo: librería ZXing por CDN
   Búsqueda de productos en Open Food Facts (gratis, sin clave)
   ════════════════════════════════════════════ */
'use strict';

const Escaner = {
  _stream: null,
  _activo: false,
  _zxingReader: null,
  FORMATOS: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'],

  soportaNativo() { return 'BarcodeDetector' in window; },

  /** Carga ZXing desde CDN solo si hace falta */
  async _cargarZXing() {
    if (window.ZXing) return;
    await new Promise((ok, fallo) => {
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/@zxing/library@0.21.3/umd/index.min.js';
      s.onload = ok;
      s.onerror = () => fallo(new Error('No se pudo cargar el lector de códigos (revisa tu internet).'));
      document.head.appendChild(s);
    });
  },

  /**
   * Inicia la cámara y busca códigos en vivo.
   * alEncontrar(codigo) se llama una sola vez.
   */
  async iniciarCamara(video, alEncontrar, alEstado) {
    this.detener();
    try {
      this._stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } },
        audio: false,
      });
    } catch (e) {
      if (e.name === 'NotAllowedError') throw new Error('Permiso de cámara denegado. Actívalo en tu navegador, o usa "Foto del código".');
      throw new Error('No se pudo abrir la cámara. Usa "Foto del código" o escribe el código manualmente.');
    }
    video.srcObject = this._stream;
    await video.play();
    this._activo = true;

    if (this.soportaNativo()) {
      const detector = new BarcodeDetector({ formats: this.FORMATOS });
      const ciclo = async () => {
        if (!this._activo) return;
        try {
          const codigos = await detector.detect(video);
          if (codigos.length > 0) {
            const v = codigos[0].rawValue;
            this.detener();
            alEncontrar(v);
            return;
          }
        } catch {}
        setTimeout(ciclo, 220);
      };
      ciclo();
    } else {
      alEstado?.('Cargando lector de códigos…');
      await this._cargarZXing();
      if (!this._activo) return;
      alEstado?.('Apunta la cámara al código de barras');
      this._zxingReader = new ZXing.BrowserMultiFormatReader();
      this._zxingReader.decodeFromStream(this._stream, video, (resultado) => {
        if (resultado && this._activo) {
          const v = resultado.getText();
          this.detener();
          alEncontrar(v);
        }
      });
    }
  },

  /** Detecta un código en una foto (archivo de imagen) */
  async detectarEnFoto(archivo) {
    const bitmap = await createImageBitmap(archivo);
    if (this.soportaNativo()) {
      const detector = new BarcodeDetector({ formats: this.FORMATOS });
      const codigos = await detector.detect(bitmap);
      if (codigos.length > 0) return codigos[0].rawValue;
    } else {
      await this._cargarZXing();
      const url = URL.createObjectURL(archivo);
      try {
        const lector = new ZXing.BrowserMultiFormatReader();
        const resultado = await lector.decodeFromImageUrl(url);
        return resultado.getText();
      } catch {
        // sigue al error genérico de abajo
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    throw new Error('No se encontró ningún código en la foto. Intenta acercarte más y con buena luz.');
  },

  detener() {
    this._activo = false;
    if (this._zxingReader) { try { this._zxingReader.reset(); } catch {} this._zxingReader = null; }
    if (this._stream) {
      this._stream.getTracks().forEach(t => t.stop());
      this._stream = null;
    }
  },

  /**
   * Busca un producto por código de barras en Open Food Facts.
   * Devuelve { nombre, marca, imagen, por100g: {kcal,p,c,f}, porcionG, paqueteG }
   */
  async buscarProducto(codigo) {
    codigo = String(codigo).replace(/\D/g, '');
    if (!codigo) throw new Error('Código no válido.');

    let resp;
    try {
      resp = await fetch(`https://world.openfoodfacts.org/api/v2/product/${codigo}.json?fields=product_name,product_name_es,brands,image_small_url,nutriments,serving_quantity,quantity,product_quantity`);
    } catch {
      throw new Error('Sin conexión. La búsqueda de productos necesita internet.');
    }
    if (!resp.ok) throw new Error('Error al consultar la base de productos.');
    const datos = await resp.json();
    if (datos.status !== 1 || !datos.product) {
      const err = new Error('Producto no encontrado en la base de datos.');
      err.noEncontrado = true;
      throw err;
    }

    const p = datos.product;
    const n = p.nutriments || {};
    const kcal100 = n['energy-kcal_100g'] ?? (n['energy_100g'] ? n['energy_100g'] / 4.184 : null);
    if (kcal100 == null) {
      const err = new Error('El producto existe pero no tiene información de calorías.');
      err.sinDatos = true;
      throw err;
    }

    return {
      codigo,
      nombre: p.product_name_es || p.product_name || 'Producto ' + codigo,
      marca: p.brands || '',
      imagen: p.image_small_url || '',
      por100g: {
        kcal: Math.round(kcal100),
        p: +(n.proteins_100g ?? 0).toFixed(1),
        c: +(n.carbohydrates_100g ?? 0).toFixed(1),
        f: +(n.fat_100g ?? 0).toFixed(1),
      },
      porcionG: parseFloat(p.serving_quantity) || null,
      paqueteG: parseFloat(p.product_quantity) || null,
    };
  },
};

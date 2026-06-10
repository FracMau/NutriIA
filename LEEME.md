# 🥗 NutriIA — Contador de Calorías con IA

App 100% local (HTML + CSS + JavaScript, sin servidor ni base de datos externa).
Todos tus datos se guardan en tu navegador con `localStorage`.

## 🚀 Cómo abrirla

**Opción recomendada (con cámara):** sirve la carpeta con un servidor local, porque
la cámara solo funciona en `http://localhost` o `https://`:

```powershell
# Si tienes Python:
cd contador-calorias
python -m http.server 8080
# abre http://localhost:8080
```

**Opción rápida:** doble clic en `index.html`. Todo funciona excepto la cámara en vivo
(puedes usar "Foto del código" y las fotos con IA, que abren la cámara del teléfono
o el selector de archivos).

## Activar la inteligencia artificial

Puedes elegir entre dos proveedores en **Perfil → Inteligencia artificial**:

- **Google Gemini · Gratis (recomendado)** — nivel gratuito generoso
  (~1,500 análisis al día sin costo) y excelente visión para comida.
  Crea tu clave en **aistudio.google.com/apikey**.
- **Claude · Premium (Anthropic)** — máxima precisión, pero cobra por uso.
  Crea tu clave en **platform.claude.com**.

Pega la clave del proveedor que elijas y guárdala. Se almacena SOLO en tu
dispositivo y se usa directo contra la API. Puedes cambiar de proveedor cuando
quieras; cada clave se recuerda por separado.

Con la IA puedes:
- 📸 **Foto de tu plato**: identifica los alimentos, **cuenta las piezas** (ej. 3 tortillas),
  estima porciones en gramos y calcula calorías y macros.
- 🏷️ **Foto de etiqueta nutricional**: lee la tabla nutrimental del empaque.
- 💬 **Describir con palabras**: "2 tacos al pastor y un vaso de horchata".

## 📷 Escáner de códigos de barras

- Usa la cámara en vivo (Chrome/Edge/Android) o una **foto del código**.
- También puedes escribir el código a mano.
- Busca el producto en **Open Food Facts** (gratuito, sin clave) y registra
  por **gramos, porciones o paquete completo**.

## Motor de cálculo profesional

- **TMB con Mifflin-St Jeor** + **factor de actividad real** calculado con un
  cuestionario (tipo de día + días de ejercicio + intensidad), en lugar de una
  lista desplegable que la gente sobreestima.
- Con tu **peso meta y fecha objetivo** calcula el déficit/superávit exacto
  (1 kg ≈ 7,700 kcal) y tu objetivo diario.
- **Límites biológicos**: si la meta exige un déficit peligroso o bajar de tu
  mínimo saludable, lanza una alerta de "Meta no saludable" y ajusta el plan.
- **Distribución de comidas configurable** (Desayuno/Comida/Cena/Snacks): pones
  los porcentajes y la app reparte tu objetivo; cada comida muestra su propio
  presupuesto y barra de progreso.
- **Simulador de desviación**: convierte tu desvío calórico en gramos de peso
  ganado/perdido, por día y acumulado en los últimos días.
- Cada vez que **registras tu peso**, el plan se **recalcula automáticamente**.
- Te dice la **fecha estimada** en la que llegarás a tu meta.

## Diseño

Interfaz premium con iconografía SVG de trazo (sin emojis), tipografía Manrope,
tema oscuro/claro, tarjetas con relieve y numeración tabular.

## ✨ Además incluye

- Registro por día (desayuno, comida, cena y snacks) con navegación de fechas.
- Macros (proteína, carbs, grasa) con barras de progreso.
- Contador de agua con meta según tu peso.
- Registro de ejercicio **por minutos**: eliges la actividad (correr, pesas,
  bici, fútbol, yoga…) y los minutos, y la app calcula las calorías quemadas
  con valores MET y tu peso. Suma esas calorías a tu presupuesto del día.
- Gráficas de peso (con línea de meta) y de calorías de 14 días.
- Racha de días, IMC, alimentos favoritos, recientes y personalizados.
- Tema claro/oscuro, exportar/importar respaldo en JSON.

## 📁 Archivos

```
contador-calorias/
├── index.html        ← estructura
├── css/styles.css    ← sistema de diseño premium
├── js/icons.js       ← iconografía SVG (sin emojis)
├── js/db.js          ← base de alimentos comunes
├── js/storage.js     ← guardado local
├── js/nutrition.js   ← motor de cálculo profesional
├── js/charts.js      ← gráficas SVG
├── js/ai.js          ← IA (API de Claude, visión)
├── js/scanner.js     ← escáner de códigos + Open Food Facts
└── js/app.js         ← lógica de la interfaz
```

# Comunica 10 — Gimnasio de Comunicación Personal

> **Menos teoría, más práctica.**
> Aplicación web mobile-first construida sobre **Jekyll**, **CSS3 moderno (Vanilla)** y **JavaScript Vanilla**, diseñada para ayudar a cualquier persona a desarrollar progresivamente la capacidad de hablar frente a una cámara de celular de manera espontánea, clara, natural y estructurada (del Nivel 0 al Nivel 10).

---

## 📱 Cómo Ejecutar el Proyecto

### Opción 1: Servidor Jekyll (Entorno Nativo)
Requiere Ruby y Jekyll instalados:
```bash
cd comunica-10
jekyll serve
```
Abre tu navegador en: [http://localhost:4000](http://localhost:4000)

---

### Opción 2: Cualquier Servidor Estático Local (Node / Python)
Si prefieres no usar el servidor integrado de Ruby:
```bash
# Compilar el sitio estático
jekyll build

# Servir con Node.js
npx -y serve _site

# O servir con Python
python -m http.server 4000 -d _site
```

---

## 🏗️ Arquitectura del Proyecto

```
comunica-10/
├── _config.yml               # Configuración de Jekyll y permalinks estándar
├── _data/
│   ├── levels.yml            # Definición completa de los 11 niveles (Nivel 0 al 10)
│   ├── exercises.yml         # Banco de misiones con tiempos, retos y criterios
│   ├── skills.yml            # Matriz de habilidades (Fluidez, Estructura, Muletillas...)
│   └── onboarding.yml        # Configuración del onboarding de 4 pasos
├── _layouts/
│   ├── default.html          # Shell para landing page de conversión
│   └── app.html              # Shell para la app móvil con barra de navegación fija
├── _includes/
│   ├── header.html           # Cabecera con logo y píldora de racha (🔥)
│   ├── bottom-nav.html       # Navegación inferior móvil (Inicio, Entrenar, Progreso, Perfil)
│   ├── camera-view.html      # Contenedor de cámara selfie, HUD y visualizador de audio
├── assets/
│   ├── css/
│   │   ├── tokens.css        # Paleta dark slate, acentos índigo/esmeralda/fucsia y elevaciones
│   │   ├── main.css          # Reset, tipografía Google Fonts (Outfit / Plus Jakarta Sans)
│   │   ├── components.css    # Cards, botones touch (48px+), barra de progreso, HUD de grabación
│   │   └── animations.css    # Micro-animaciones (pulsos de grabación, XP toast, fade-ins)
│   └── js/
│       ├── storage.js        # Capa de almacenamiento abstracta (Storage API desacoplada de LocalStorage)
│       ├── data.js           # Repositorio de datos con respaldo para entorno estático directo
│       ├── recorder.js       # Driver para navigator.mediaDevices.getUserMedia + MediaRecorder + Web Audio
│       ├── analyzer.js       # Motor de feedback pedagógico y métricas de IA simulada (esquema JSON)
│       ├── gamification.js   # Lógica de XP (+100, +50, +20), rangos de orador y motor adaptativo
│       └── app.js            # Controlador principal de vistas, temporizadores y eventos
├── app/
│   ├── index.html            # Dashboard ("¿Qué hago hoy?", Misión diaria, Racha, Radar)
│   ├── train.html            # Explorador interactivo de Niveles 0 al 10
│   ├── mission.html          # Pantalla de Misión (Cuenta atrás 15s -> Grabación de cámara en vivo)
│   ├── results.html          # Análisis de resultados, métricas cuantitativas y coaching tip
│   ├── comparison.html       # Comparativa visual de intentos (Intento 1 vs Intento 2 con % de mejora)
│   ├── progress.html         # Sección "Mis muletillas" (tendencia semanal) y "El poder del silencio"
│   ├── profile.html          # Perfil de orador, estadísticas históricas, racha y reset local
│   └── onboarding.html       # Flujo guiado de 4 pasos
└── index.html                # Landing Page de impacto ("Deja de pensar tanto. Aprende a hablar.")
```

---

## ⚙️ Funcionalidades Implementadas (MVP Completo)

1. **Landing Page de Conversión**: Comunica de inmediato el valor ("Deja de pensar tanto. Aprende a hablar"), muestra los 11 niveles y la regla 10% teoría / 90% práctica.
2. **Onboarding Guiado (4 Pasos)**: Preguntas de meta, nivel inicial autopercibido, disponibilidad de tiempo y preparación de la primera misión.
3. **Dashboard (< 5 segundos para entrenar)**:
   - Saludo matutino y rango actual de orador.
   - Barra de nivel y progreso.
   - Racha activa con píldora animada (🔥 7 días).
   - Misión del día lista para iniciar con un solo clic.
   - Resumen visual de progreso de habilidades.
4. **Gimnasio de 11 Niveles (Nivel 0 al 10)**:
   - Desde el desbloqueo vocal básico (30s) hasta la maestría espontánea de 10 minutos con preguntas sorpresa.
5. **Misión con Cámara en Vivo**:
   - Cuenta atrás configurable de preparación (15s o 5s).
   - Acceso real a la cámara frontal y micrófono mediante `navigator.mediaDevices.getUserMedia`.
   - Grabación en memoria mediante `MediaRecorder` con detección de codecs compatibles.
   - Indicador visual de volumen de voz con `AudioContext` en vivo.
   - Modo de cámara simulada si el navegador no cuenta con periféricos o se deniegan permisos.
6. **Resultados y Análisis**:
   - Desglose de Fluidez, Claridad, Estructura, Naturalidad, Muletillas, Pausas largas y Palabras por minuto (ppm).
   - Fortalezas detectadas ("Lo hiciste bien").
   - Oportunidad prioritaria guiada ("Prueba hacer una pausa de 1 a 2 segundos").
7. **Comparación de Intentos (Intento 1 vs Intento 2)**:
   - Tabla comparativa de evolución.
   - Cálculo automático del porcentaje de superación (ej. *"¡Mejoraste un 23% en esta misión!"*).
8. **Sección "Mis Muletillas"**:
   - Conteo semanal de "eh", "este", "o sea", "entonces".
   - Comparativa de frecuencia por minuto (14/min ➔ 8/min = ↓ 43%).
   - Filosofía pedagógica del silencio deliberado.
9. **Gamificación y Rango**:
   - Sistema de XP (+100 por misión, +50 primera del día, +20 racha, etc.).
   - 5 Rangos de Orador: Principiante (0-999), Explorador (1000-2499), Comunicador (2500-4999), Orador (5000-9999), Maestro (10000+).
10. **Persistencia Desacoplada**:
    - Capa abstracta `Storage` implementada con `localStorage` que permite conectar APIs REST o GraphQL sin cambiar los componentes de interfaz.

---

## 🤖 Funcionalidades Simuladas (Preparadas para Fase 2)

- **Análisis de IA**: El módulo `analyzer.js` genera una respuesta sintética estructurada siguiendo el esquema JSON definitivo (`fluency`, `clarity`, `structure`, `fillerWords`, `longPauses`, `wordsPerMinute`, `strengths`, `improvements`). En la siguiente fase, este módulo solo requerirá sustituir la llamada local por una llamada `fetch('/api/analyze', { method: 'POST', body: formData })`.
- **Almacenamiento de Vídeo Permanente**: En el MVP, los fragmentos grabados viven en la memoria del navegador (`Blob URL`) para permitir reproducción y análisis sin saturar servidores ni requerir backend.

---

## 🚀 Próximos Pasos Recomendados

1. **Speech-to-Text en Streaming**: Integrar Whisper API o Web Speech API para transcribir el audio en tiempo real mientras el usuario habla.
2. **Conexión con LLM Real**: Enviar la transcripción generada junto con los criterios de superación de cada nivel a un endpoint para generar feedback textual hiperpersonalizado.
3. **PWA (Progressive Web App)**: Añadir `manifest.json` y un Service Worker sencillo para que los usuarios puedan "Instalar" Comunica 10 en su pantalla de inicio como una app nativa en iOS y Android.

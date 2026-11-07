---
applyTo: 'public/**'
---

# Instrucciones de Desarrollo Frontend (`public/**`)

## 1. Arquitectura Web Vanilla
- Utiliza exclusivamente **HTML5 semántico**, **CSS3 moderno con variables nativas (`:root`)** y **JavaScript ES2020+ nativo** sin frameworks externos ni empaquetadores.
- Garantiza accesibilidad mediante atributos ARIA (`role="log"`, `aria-live="polite"`, `aria-label`) y navegación por teclado.

## 2. Prevención Estricta de XSS
- **Prohibición absoluta de `innerHTML`**: Ningún dato proveniente del usuario o de la respuesta JSON de `/api/chat` puede inyectarse mediante `innerHTML`.
- Crea nodos mediante `document.createElement()` y asigna su contenido de texto exclusivamente con la propiedad `element.textContent`.

## 3. Experiencia de Usuario e Inclusión Operativa
- Mantén el identificador `conversation_id` en memoria de la sesión actual del cliente y envíalo en cada petición subsecuente a `POST /api/chat`.
- Incluye soporte para dictado por voz mediante la **Web Speech API** (` window.SpeechRecognition || window.webkitSpeechRecognition`) configurada con `lang = "es-MX"`, facilitando la operación con manos ocupadas para el personal de bodega y almacén.
- Soporta modo claro y modo oscuro automático mediante `@media (prefers-color-scheme: dark)` manteniendo alto contraste corporativo.

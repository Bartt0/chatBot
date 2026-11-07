# Instrucciones Maestras del Proyecto: `chatbot-rioclaro`

## Contexto de Negocio
Este repositorio contiene la solución oficial para **Distribuidora Río Claro** (proyecto integrador de certificación Microsoft AI-901). La aplicación ofrece un asistente comercial y logístico unificado para las 5 sucursales operativas (Guadalajara, Zapopan, León, Querétaro y Aguascalientes).

## Reglas Arquitectónicas Innegociables

1. **Arquitectura Desacoplada (Cliente -> Backend -> Microsoft Foundry)**:
   - El navegador web (cliente) **jamás** se comunica de forma directa con los endpoints de Microsoft Foundry ni almacena tokens o configuraciones de nube.
   - Toda interacción pasa exclusivamente por el endpoint `POST /api/chat` expuesto por el servidor backend en Express.

2. **Entorno de Ejecución y Plataforma**:
   - **Node.js 24 LTS** (compatible con `"engines": { "node": ">=22.9" }`) utilizando módulos ES nativos (`"type": "module"`, sintaxis `import`/`export` y `import.meta.dirname`).
   - **Express 5** (`^5.2.1`) para el enrutamiento HTTP y servicio de archivos estáticos.

3. **Autenticación Sin Secretos Estáticos (Zero-Key Policy)**:
   - Está estrictamente prohibido el uso de claves API (`API Keys`) codificadas en código fuente o archivos de configuración versionados.
   - La autenticación contra Microsoft Foundry se realiza exclusivamente mediante `DefaultAzureCredential` del paquete `@azure/identity` (resolviendo Azure CLI en desarrollo local y System-Assigned Managed Identity en Azure App Service).

4. **Validación de Entrada y Manejo Seguro de Errores**:
   - El backend valida que `message` sea una cadena no vacía de entre `1` y `2000` caracteres; en caso contrario devuelve HTTP `422 Unprocessable Entity`.
   - Cualquier excepción en la comunicación con Microsoft Foundry se captura y responde con HTTP `502 Bad Gateway` y el mensaje genérico `"El asistente no está disponible temporalmente."`, sin exponer trazas de ejecución (`stack traces`) ni metadatos sensibles.

5. **Sanitización DOM y Prevención de XSS**:
   - En el frontend (`public/`), queda estrictamente prohibido utilizar `innerHTML`, `outerHTML` o `insertAdjacentHTML` para mostrar contenido dinámico.
   - Toda respuesta del asistente o entrada del usuario debe insertarse en el DOM exclusivamente mediante `textContent`.

6. **Compatibilidad Multiplataforma y Estilo de Redacción**:
   - Los scripts y comandos documentados deben ser compatibles con entornos POSIX (Linux/macOS) y Windows (PowerShell/WSL).
   - Mantener en todo momento un lenguaje técnico, formal, corporativo y profesional en comentarios, código, interfaz e informes.

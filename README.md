# Chatbot Río Claro — Asistente Comercial y Logístico con Microsoft Foundry

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.9%20%7C%2024%20LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2.1-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Azure App Service](https://img.shields.io/badge/Azure%20App%20Service-Activo-0078D4?logo=microsoftazure&logoColor=white)](https://rioclaro-bot-897.azurewebsites.net)
[![Microsoft Foundry](https://img.shields.io/badge/Microsoft%20Foundry-gpt--5--mini-5C2D91)](https://ai.azure.com/)

Solución integral desarrollada para **Distribuidora Río Claro** como proyecto integrador de la certificación **Microsoft AI-901**. El sistema unifica la consulta de catálogos de higiene y limpieza institucional (presentaciones de litro, galón, porrón y tambor de 200 L), tiempos de entrega y política central de devoluciones para las **5 sucursales operativas** (Guadalajara, Zapopan, León, Querétaro y Aguascalientes).

🌐 **Demo en Producción (Azure App Service):**  
👉 **[https://rioclaro-bot-897.azurewebsites.net](https://rioclaro-bot-897.azurewebsites.net)**

📄 **Documentación Ejecutiva y Entregable Académico:**  
👉 **[Ver `entregable.md`](./entregable.md)**

---

## 1. Arquitectura de la Solución

La aplicación sigue una **arquitectura web desacoplada de tres capas**, donde el navegador jamás se comunica directamente con los servicios de IA ni almacena llaves o tokens:

```text
[ Navegador Web (Vanilla HTML5/CSS3/JS + Web Speech API es-MX) ]
                              │
                              ▼  POST /api/chat (Validación 1-2000 caracteres)
[ Backend Express 5 en Azure App Service (Linux | Node.js 24 LTS) ]
                              │
                              ▼  DefaultAzureCredential (Managed Identity / Entra ID)
[ Microsoft Foundry Project -> Agente: asistente-rioclaro (gpt-5-mini) ]
```

### Características Principales
- **Autenticación Zero-Key (`DefaultAzureCredential`)**: Sin claves API en código ni variables de entorno; utiliza Azure CLI en desarrollo local y **System-Assigned Managed Identity** con el rol RBAC `Foundry User` en producción.
- **Conversación Multi-Turno con Estado**: Creación y reutilización de `conversation_id` mediante `openai.conversations.create()` y `openai.responses.create()` usando `agent_reference`.
- **Seguridad y Prevención de XSS**: Validación estricta de entrada (`1` a `2000` caracteres -> HTTP `422`), respuestas seguras ante fallos aguas arriba (HTTP `502` genérico sin exponer trazas) y renderizado en el DOM exclusivamente mediante `textContent` (cero uso de `innerHTML`).
- **Inclusión Operativa por Voz (`es-MX`)**: Integración nativa con la **Web Speech API** para permitir consultas manos libres desde el piso de bodega y almacén.
- **Interfaz Moderna en Modo Oscuro**: Diseño limpio estilo dashboard con indicadores de sucursales activas y chips de consulta rápida.

---

## 2. Estructura del Proyecto

```text
├── .github/
│   ├── copilot-instructions.md             # Reglas maestras de arquitectura y seguridad
│   ├── instructions/
│   │   ├── backend.instructions.md         # Lineamientos para Express 5 y Azure SDK
│   │   └── frontend.instructions.md        # Estándares Vanilla JS, accesibilidad y anti-XSS
│   └── agents/
│       ├── arquitecto.agent.md             # Agente en modo Plan (solo lectura)
│       ├── constructor.agent.md            # Agente de implementación Full Stack
│       └── desplegador.agent.md            # Agente DevOps para Azure CLI y RBAC
├── Docs/                                   # Capturas de evidencia en Foundry, local y Azure
├── public/
│   ├── index.html                          # Interfaz corporativa Distribuidora Río Claro
│   ├── styles.css                          # Estilos responsivos en modo oscuro nativo
│   └── app.js                              # Lógica de cliente, textContent y Web Speech API
├── scripts/
│   └── create-agent.js                     # Script de aprovisionamiento del agente en Foundry
├── .env.example                            # Plantilla de variables de entorno
├── .gitignore                              # Exclusión de node_modules, .env, .azure y logs
├── entregable.md                           # Entregable académico completo con evidencias
├── package.json                            # Configuración ES Modules y dependencias
└── server.js                               # Servidor Express 5 y endpoints /health y /api/chat
```

---

## 3. Requisitos Previos

- **Node.js** `>= 22.9` (recomendado **Node.js 24 LTS**).
- **Azure CLI** (`az`) instalado y con sesión iniciada (`az login`).
- Un proyecto activo en **Microsoft Foundry** con el despliegue del modelo `gpt-5-mini` y permisos RBAC asignados (`Foundry User`).

---

## 4. Instalación y Ejecución Local

1. **Clonar el repositorio e instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar las variables de entorno:**
   Copia la plantilla `.env.example` a `.env` y coloca el endpoint de tu proyecto de Microsoft Foundry:
   ```bash
   cp .env.example .env
   ```
   Variables en `.env`:
   ```dotenv
   FOUNDRY_PROJECT_ENDPOINT=https://<tu-recurso>.services.ai.azure.com/api/projects/<tu-proyecto>
   FOUNDRY_AGENT_NAME=asistente-rioclaro
   FOUNDRY_MODEL_DEPLOYMENT=gpt-5-mini
   PORT=3000
   ```

3. **Autenticarse en Azure CLI (para `DefaultAzureCredential` local):**
   ```bash
   az login
   ```

4. **Aprovisionar el agente en Microsoft Foundry:**
   ```bash
   npm run create-agent
   ```

5. **Iniciar el servidor en modo desarrollo:**
   ```bash
   npm run dev
   ```
   Abre `http://localhost:3000` en tu navegador.

---

## 5. Endpoints de la API

| Método | Ruta | Descripción | Respuestas |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Sonda de verificación de estado para Azure App Service. | `200 OK` -> `{ "status": "ok" }` |
| `POST` | `/api/chat` | Envía un mensaje al agente `asistente-rioclaro` y mantiene el contexto. | `200 OK` -> `{ "reply": "...", "conversation_id": "..." }`<br>`422 Unprocessable Entity` -> Mensaje vacío o `> 2000` caracteres<br>`502 Bad Gateway` -> `{ "error": "El asistente no está disponible temporalmente." }` |

---

## 6. Autor

- **Fidel Arias Zavala** — Proyecto Integrador Certificación **Microsoft AI-901** (Caso *Distribuidora Río Claro*).

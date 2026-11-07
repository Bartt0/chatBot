# Entregable Técnico y Ejecutivo: Proyecto Integrador Microsoft AI-901

## 1. Ficha Técnica del Proyecto

| Atributo | Detalle Oficial |
| :--- | :--- |
| **Proyecto** | `chatbot-rioclaro` — Asistente Comercial y Logístico Unificado |
| **Organización Caso** | Distribuidora Río Claro S.A. de C.V. (140 colaboradores, 5 sucursales) |
| **Consultor / Arquitecto** | Arquitecto de Software y Desarrollador Cloud Full Stack (Certificación Microsoft AI-901) |
| **Repositorio** | `chatbot-rioclaro` (Node.js 24 LTS + Express 5 + Microsoft Foundry SDK) |
| **Modelo e Integración** | Agente `asistente-rioclaro` sobre **Microsoft Foundry** (`gpt-5-mini`) |

> ### 🌐 URL Pública Activa en Azure App Service
> **`https://<app>.azurewebsites.net`**  
> *(Espacio reservado para la URL productiva de la instancia Linux Node 24 LTS desplegada en Azure App Service: `https://chatbot-rioclaro-app.azurewebsites.net`)*

---

## 2. Diagnóstico Operativo: El Problema en Distribuidora Río Claro

**Distribuidora Río Claro** es una empresa comercializadora de productos de higiene y limpieza institucional con **140 empleados** distribuidos en **5 sucursales estratégicas**: **Guadalajara (Matriz), Zapopan, León, Querétaro y Aguascalientes**.

El crecimiento acelerado en el corredor Occidente-Bajío generó cuellos de botella críticos que afectan la rentabilidad y el control operativo:

1. **Fragmentación de Catálogos y Criterios Comerciales**: Cada sucursal maneja hojas de cálculo aisladas para consultar las presentaciones de litro, galón (3.785 L), porrón (20 L) y tambor industrial (200 L), provocando discrepancias en tiempos de entrega prometidos a clientes institucionales.
2. **Duplicidad Documental (PDF y Mensajería Instantánea)**: Los comprobantes, remisiones y facturas se envían simultáneamente por correo electrónico en formato PDF y mediante fotografías por WhatsApp sin validación centralizada de folio fiscal (UUID).
3. **Sobrecarga Operativa en Cuentas por Pagar (12 Horas Semanales)**: **Laura**, responsable de Cuentas por Pagar, invierte más de **12 horas semanales** en captura manual, conciliación de facturas duplicadas y respuesta repetitiva a dudas sobre políticas de devolución y notas de crédito.
4. **Fricción en Piso de Bodega**: En el almacén, el personal operativo liderado por **Toño** trabaja con las manos ocupadas movilizando tambores y tarimas, dificultando el uso de teclados tradicionales para verificar especificaciones de empaque o reglas de recepción.

---

## 3. Arquitectura Técnica de la Solución

La solución implementa una **arquitectura web desacoplada de tres capas** diseñada bajo estándares empresariales de seguridad en la nube:

```
[ Navegador Web (Vanilla HTML5/CSS3/JS + Web Speech API es-MX) ]
                              │
                              ▼  HTTPS (POST /api/chat | Validación 1-2000 chars)
[ Azure App Service (Linux | Node.js 24 LTS | Express 5 Server) ]
                              │
                              ▼  DefaultAzureCredential (Managed Identity / Entra ID)
                              │  Rol RBAC: Foundry User (53ca6127-db72-4b80-b1b0-d745d6d5456d)
[ Microsoft Foundry Project -> Agente: asistente-rioclaro (gpt-5-mini) ]
```

### Componentes Clave de Ingeniería
- **Capa de Presentación (`public/`)**: Interfaz responsiva desarrollada con HTML5 semántico, CSS3 con soporte nativo de modo oscuro (`prefers-color-scheme: dark`) y JavaScript ES2020+. Incorpora chips de consulta rápida, dictado por voz en español mexicano (`es-MX`) y sanitización estricta del DOM mediante `textContent` (prohibiendo `innerHTML` para neutralizar vectores XSS).
- **Capa de Aplicación (`server.js`)**: Servidor Express 5 ejecutándose en Node.js 24 LTS. Expone `GET /health` para monitoreo de plataforma y `POST /api/chat` con validación estricta de longitud (`1` a `2000` caracteres -> HTTP `422`), administración de contexto mediante `openai.conversations.create()` e invocación referenciada con `agentRef`. En caso de fallo aguas arriba, responde con un código HTTP `502` genérico que protege trazas y metadatos internos.
- **Capa de Identidad e Inteligencia (`@azure/identity` + `@azure/ai-projects`)**: Instancia única (Singleton) autenticada mediante `DefaultAzureCredential`. En producción utiliza la **System-Assigned Managed Identity** del App Service con el rol RBAC **Foundry User** (`53ca6127-db72-4b80-b1b0-d745d6d5456d`), eliminando por completo el uso de claves estáticas (`API Keys`) en el código o variables de entorno.

---

## 4. Aplicación Técnica de los 6 Principios de IA Responsable

| Principio de IA Responsable | Implementación Técnica y Organizacional en `chatbot-rioclaro` |
| :--- | :--- |
| **1. Equidad (Fairness)** | El agente `asistente-rioclaro` aplica exactamente las mismas reglas comerciales, políticas de devolución y estándares de servicio para las 5 sucursales (GDL, ZAP, BJX, QRO, AGS), eliminando asimetrías de información entre la matriz y las plazas foráneas. |
| **2. Confiabilidad y Seguridad (Reliability & Safety)** | Las instrucciones del sistema en `scripts/create-agent.js` prohíben explícitamente inventar precios, saldos, folios fiscales o existencias no verificadas, acotando las respuestas a un máximo de 3 párrafos verificables. El backend valida entradas (`1-2000` caracteres) y gestiona fallos mediante respuestas HTTP `502` controladas. |
| **3. Privacidad y Seguridad (Privacy & Security)** | Arquitectura desacoplada donde el navegador jamás interactúa directamente con Microsoft Foundry. Autenticación 100% libre de llaves estáticas mediante **Managed Identity** y Microsoft Entra ID, sumada a la inserción exclusiva con `textContent` en el frontend para impedir ataques Cross-Site Scripting (XSS). |
| **4. Inclusión (Inclusiveness)** | Integración nativa de la **Web Speech API (`es-MX`)** mediante un botón de micrófono con retroalimentación visual y de estado ARIA, permitiendo que el personal de bodega y patio de maniobras (como Toño) realice consultas mediante comandos de voz sin depender del teclado físico. |
| **5. Transparencia (Transparency)** | La interfaz incluye de forma permanente un **Banner de Transparencia de IA** (`role="note"`) en la parte superior del área de trabajo, informando claramente al colaborador que interactúa con un sistema automatizado (`asistente-rioclaro`) y señalando los alcances de la herramienta. |
| **6. Rendición de Cuentas (Accountability)** | El diseño establece límites claros de decisión humana: las cotizaciones especiales, conciliaciones de UUID y autorizaciones de notas de crédito permanecen bajo supervisión formal de Cuentas por Pagar y las gerencias de sucursal, mientras el código y el aprovisionamiento quedan auditables en `.github/agents/` y `scripts/create-agent.js`. |

---

## 5. Matriz de Valor por Personaje del Caso

| Personaje y Cargo | Problemática Principal | Cómo `chatbot-rioclaro` Resuelve su Necesidad |
| :--- | :--- | :--- |
| **1. Don Ernesto**<br>*(Director General)* | Falta de estandarización operativa entre las 5 sucursales y riesgo financiero por procesos manuales desarticulados. | Obtiene un canal institucional unificado y gobernable en Azure que homologa políticas comerciales y de devolución en las 5 plazas con costos controlados (`gpt-5-mini`). |
| **2. Laura**<br>*(Cuentas por Pagar)* | Pérdida de 12 horas semanales aclarando políticas de devolución y filtrando facturas duplicadas enviadas por PDF y WhatsApp. | El asistente resuelve de forma automática las consultas recurrentes sobre requisitos de devolución y validación obligatoria de UUID y remisión, liberando su agenda para tareas contables de alto valor. |
| **3. Mariana**<br>*(Gerente Sucursal León - BJX)* | Incertidumbre en tiempos de entrega del corredor Bajío y demoras al consultar presentaciones disponibles frente a clientes institucionales. | Cuenta con acceso inmediato (incluyendo un chip rápido dedicado a Sucursal León) para confirmar tiempos de entrega (24-48 h en ruta consolidada / 72 h en tambores de 200 L) y presentaciones oficiales. |
| **4. Toño**<br>*(Jefe de Bodega)* | Dificultad para teclear consultas en computadora o teléfono mientras supervisa carga, descarga y estiba de galones y tambores. | Utiliza el botón de dictado por voz (`es-MX`) integrado en la barra de entrada para consultar especificaciones de empaque y criterios de recepción de mercancía de manera manos libres. |
| **5. Carlos**<br>*(Soporte y Sistemas)* | Sobrecarga de mantenimiento técnico, riesgo de filtración de credenciales y dificultad para auditar despliegues manuales. | Recibe una arquitectura limpia en Node.js 24 LTS sobre Azure App Service autenticada con Managed Identity (sin rotación manual de claves API), endpoint `/health` y agentes DevOps documentados en `.github/`. |

---

## 6. Evidencias de Funcionamiento y Despliegue

### 6.1 Captura del Asistente Respondiendo en Vivo (Interfaz Web Corporativa)
> Coloca aquí la captura de pantalla de la interfaz de **Distribuidora Río Claro** mostrando los indicadores de las 5 sucursales (`GDL`, `ZAP`, `BJX`, `QRO`, `AGS`), el banner de transparencia de IA y una conversación activa con el agente `asistente-rioclaro`.
>
> `![Evidencia UI Asistente en Vivo](./docs/evidencia-chat-vivo.png)`

### 6.2 Captura de Terminal: Aprovisionamiento del Agente y Despliegue en Azure CLI
> Coloca aquí la captura de pantalla de la terminal ejecutando `npm run create-agent` y los comandos de despliegue y asignación RBAC (`53ca6127-db72-4b80-b1b0-d745d6d5456d`) en Azure App Service.
>
> `![Evidencia Terminal Despliegue Azure](./docs/evidencia-terminal-azure.png)`

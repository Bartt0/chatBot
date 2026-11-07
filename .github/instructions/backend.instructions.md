---
applyTo: 'server.js,scripts/**'
---

# Instrucciones de Desarrollo Backend y Aprovisionamiento (`server.js`, `scripts/**`)

## 1. Gestión del Ciclo de Vida de Clientes Azure
- Inicializa `AIProjectClient` y el cliente OpenAI derivado (`await project.getOpenAIClient()`) bajo un patrón **Singleton** a nivel de módulo/proceso.
- No instancies un nuevo `AIProjectClient` ni `DefaultAzureCredential` en cada petición HTTP entrante a `/api/chat` para evitar agotamiento de sockets y sobrecarga de tokens en Microsoft Entra ID.

## 2. Invocación de Agentes en Microsoft Foundry
- Al invocar respuestas del agente mediante `openai.responses.create`, utiliza siempre la estructura oficial de referencia de agente:
  ```js
  const agentRef = {
    body: {
      agent_reference: {
        name: AGENT_NAME,
        type: "agent_reference"
      }
    }
  };
  const response = await openai.responses.create(
    { conversation: conversationId, input: message },
    agentRef
  );
  ```
- Reutiliza el `conversation_id` proporcionado por el cliente para preservar el contexto multi-turno, o genera uno nuevo mediante `await openai.conversations.create()` cuando no esté presente.

## 3. Aprovisionamiento de Agentes (`scripts/create-agent.js`)
- El aprovisionamiento se realiza con `project.agents.createVersion(AGENT_NAME, { kind: "prompt", model, instructions })`.
- El modelo por defecto debe tomarse de `process.env.FOUNDRY_MODEL_DEPLOYMENT || "gpt-5-mini"`.
- Las instrucciones del agente deben acotar las respuestas a un máximo de 3 párrafos y prohibir explícitamente la invención de precios, facturas o existencias no verificadas.

## 4. Mitigación de Fugas de Información
- En bloques `try/catch` de Express 5, nunca devuelvas `error.message` ni `error.stack` en el cuerpo JSON del HTTP `502`.
- Devuelve únicamente:
  ```json
  { "error": "El asistente no está disponible temporalmente." }
  ```
- Asegura siempre la disponibilidad del endpoint `GET /health` respondiendo HTTP `200` con `{ "status": "ok" }` para las sondas de salud de Azure App Service.

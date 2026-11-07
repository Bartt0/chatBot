import path from "node:path";
import express from "express";
import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";

const app = express();
const PORT = process.env.PORT || 3000;

const PROJECT_ENDPOINT = process.env.FOUNDRY_PROJECT_ENDPOINT;
const AGENT_NAME = process.env.FOUNDRY_AGENT_NAME || "asistente-rioclaro";

// Inicialización única (Singleton) de AIProjectClient y cliente OpenAI con DefaultAzureCredential
const project = PROJECT_ENDPOINT
  ? new AIProjectClient(PROJECT_ENDPOINT, new DefaultAzureCredential())
  : null;
const openai = project ? project.getOpenAIClient() : null;

app.disable("x-powered-by");
app.use(express.json({ limit: "16kb" }));

// Servir archivos estáticos desde public/ resolviendo rutas mediante import.meta.dirname
const publicDir = path.join(import.meta.dirname, "public");
app.use("/", express.static(publicDir));

// Endpoint de verificación de salud operativa
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Endpoint principal de conversación con el agente de Microsoft Foundry
app.post("/api/chat", async (req, res) => {
  const rawMessage = req.body?.message;
  const incomingConversationId = req.body?.conversation_id;

  if (typeof rawMessage !== "string") {
    return res.status(422).json({
      error: "El campo 'message' es obligatorio y debe ser una cadena de texto válida."
    });
  }

  const message = rawMessage.trim();
  if (message.length < 1 || message.length > 2000) {
    return res.status(422).json({
      error: "El mensaje debe contener entre 1 y 2000 caracteres."
    });
  }

  try {
    if (!openai) {
      throw new Error("El cliente OpenAI de Microsoft Foundry no está inicializado. Verifica FOUNDRY_PROJECT_ENDPOINT.");
    }

    const conversationId =
      typeof incomingConversationId === "string" && incomingConversationId.trim().length > 0
        ? incomingConversationId.trim()
        : (await openai.conversations.create()).id;

    // En @azure/ai-projects 2.x la API de Responses requiere 'agent_reference' en el body
    // (la propiedad 'agent' devuelve 400 invalid_payload por estar deprecada en el servicio)
    const agentRef = {
      body: {
        agent_reference: {
          name: AGENT_NAME,
          type: "agent_reference"
        }
      }
    };

    const response = await openai.responses.create(
      {
        conversation: conversationId,
        input: message
      },
      agentRef
    );

    return res.status(200).json({
      reply: response.output_text || "No se recibió texto de respuesta del agente.",
      conversation_id: conversationId
    });
  } catch (err) {
    console.error("[POST /api/chat] Error en llamada a Microsoft Foundry:", err.message);
    console.error(
      "[POST /api/chat] Detalle de error API:",
      JSON.stringify(err.error ?? err.body ?? null, null, 2)
    );

    return res.status(502).json({
      error: "El asistente no está disponible temporalmente."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corporativo Distribuidora Río Claro activo en el puerto ${PORT}`);
});

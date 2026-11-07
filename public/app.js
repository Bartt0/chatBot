// Estado de conversación en memoria durante la sesión activa
let currentConversationId = null;
let isSubmitting = false;
let isRecording = false;

const messagesContainer = document.getElementById("messages");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const voiceBtn = document.getElementById("voice-btn");
const voiceStatus = document.getElementById("voice-status");
const chipButtons = document.querySelectorAll(".chip");

/**
 * Construye e inserta un mensaje en el feed utilizando exclusivamente textContent
 * para garantizar sanitización total contra ataques XSS.
 */
function appendMessage(role, text, extraClass = "") {
  const row = document.createElement("article");
  row.classList.add("msg-row");
  row.classList.add(role === "user" ? "msg-user" : "msg-assistant");

  if (extraClass) {
    row.classList.add(extraClass);
  }

  const avatar = document.createElement("div");
  avatar.classList.add("msg-avatar");
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = role === "user" ? "TÚ" : "RC";

  const content = document.createElement("div");
  content.classList.add("msg-content");

  const header = document.createElement("div");
  header.classList.add("msg-header");

  const author = document.createElement("span");
  author.classList.add("msg-author");
  author.textContent = role === "user" ? "Colaborador" : "Asistente Río Claro";
  header.appendChild(author);

  if (role !== "user") {
    const badge = document.createElement("span");
    badge.classList.add("msg-badge");
    badge.textContent = "IA Corporativa";
    header.appendChild(badge);
  }

  const bubble = document.createElement("div");
  bubble.classList.add("msg-bubble");
  bubble.textContent = text;

  content.appendChild(header);
  content.appendChild(bubble);

  row.appendChild(avatar);
  row.appendChild(content);
  messagesContainer.appendChild(row);

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  return { row, bubble };
}

/**
 * Habilita o deshabilita controles mientras se espera respuesta del servidor.
 */
function setLoadingState(loading) {
  isSubmitting = loading;
  sendBtn.disabled = loading;
  userInput.disabled = loading;
  chipButtons.forEach((chip) => {
    chip.disabled = loading;
  });
}

/**
 * Envía la consulta al endpoint POST /api/chat conservando el conversation_id.
 */
async function sendMessage(rawText) {
  if (isSubmitting) {
    return;
  }

  const message = typeof rawText === "string" ? rawText.trim() : "";
  if (message.length < 1 || message.length > 2000) {
    return;
  }

  appendMessage("user", message);
  userInput.value = "";
  setLoadingState(true);

  const loadingEntry = appendMessage("assistant", "Consultando...", "msg-loading");

  try {
    const payload = { message };
    if (currentConversationId) {
      payload.conversation_id = currentConversationId;
    }

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    loadingEntry.row.remove();

    if (!response.ok) {
      const errorText =
        typeof data.error === "string"
          ? data.error
          : "El asistente no está disponible temporalmente.";
      appendMessage("assistant", errorText, "msg-error");
      return;
    }

    if (typeof data.conversation_id === "string" && data.conversation_id.trim().length > 0) {
      currentConversationId = data.conversation_id.trim();
    }

    const replyText =
      typeof data.reply === "string" && data.reply.trim().length > 0
        ? data.reply
        : "No se obtuvo respuesta disponible.";

    appendMessage("assistant", replyText);
  } catch (_err) {
    loadingEntry.row.remove();
    appendMessage(
      "assistant",
      "El asistente no está disponible temporalmente. Verifica tu conexión.",
      "msg-error"
    );
  } finally {
    setLoadingState(false);
    userInput.focus();
  }
}

// Envío del formulario principal
chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(userInput.value);
});

// Activación de chips de consulta rápida
chipButtons.forEach((chip) => {
  chip.addEventListener("click", () => {
    const query = chip.getAttribute("data-query");
    if (query) {
      sendMessage(query);
    }
  });
});

// Integración con Web Speech API (es-MX) para personal de bodega
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognitionAPI) {
  voiceBtn.disabled = true;
  voiceBtn.title = "Reconocimiento de voz no disponible en este navegador";
} else {
  const recognition = new SpeechRecognitionAPI();
  recognition.lang = "es-MX";
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.addEventListener("start", () => {
    isRecording = true;
    voiceBtn.classList.add("recording");
    voiceBtn.setAttribute("aria-pressed", "true");
    voiceStatus.textContent = "Escuchando dictado por voz (es-MX)...";
  });

  recognition.addEventListener("result", (event) => {
    const transcript = event.results?.[0]?.[0]?.transcript;
    if (typeof transcript === "string" && transcript.trim().length > 0) {
      const cleanTranscript = transcript.trim().slice(0, 2000);
      userInput.value = cleanTranscript;
      voiceStatus.textContent = "Dictado procesado. Enviando...";
      sendMessage(cleanTranscript);
    }
  });

  recognition.addEventListener("error", () => {
    voiceStatus.textContent = "No se pudo capturar el audio del micrófono.";
  });

  recognition.addEventListener("end", () => {
    isRecording = false;
    voiceBtn.classList.remove("recording");
    voiceBtn.setAttribute("aria-pressed", "false");
    setTimeout(() => {
      if (!isRecording) {
        voiceStatus.textContent = "";
      }
    }, 3000);
  });

  voiceBtn.addEventListener("click", () => {
    if (isSubmitting) {
      return;
    }
    if (isRecording) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (_err) {
        recognition.stop();
      }
    }
  });
}

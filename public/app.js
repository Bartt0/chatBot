import { exampleModules } from "./example-data.js";

// Estado de conversación en memoria durante la sesión activa
let currentConversationId = null;
let isSubmitting = false;
let isRecording = false;

const messagesContainer = document.getElementById("messages");
const conversationCanvas = messagesContainer.querySelector(".conversation-canvas");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const voiceBtn = document.getElementById("voice-btn");
const voiceStatus = document.getElementById("voice-status");
const chipButtons = document.querySelectorAll(".chip");
const newChatBtn = document.getElementById("new-chat-btn");
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebar-toggle");
const sidebarBackdrop = document.getElementById("sidebar-backdrop");
const conversationList = document.getElementById("conversation-list");
const historyStatus = document.getElementById("history-status");
const storageStatus = document.getElementById("storage-status");
const informationView = document.getElementById("information-view");
const informationTitle = document.getElementById("information-title");
const informationDescription = document.getElementById("information-description");
const informationItems = document.getElementById("information-items");
const composerDock = document.querySelector(".composer-dock");
const showChatBtn = document.getElementById("show-chat-btn");
const returnChatBtn = document.getElementById("return-chat-btn");

const storageKey = "rioclaro-conversations-v1";
const historyLimit = 6;
let nextLocalId = 0;
let conversations = [];
let currentConversation = createConversation();

const welcomeMessage =
  "Hola. Estoy conectado al catálogo institucional y a las reglas logísticas de Guadalajara, Zapopan, León, Querétaro y Aguascalientes.\n\n¿Qué consulta de presentaciones, entregas o devoluciones deseas revisar?";

function createConversation() {
  nextLocalId += 1;
  return {
    id: `${Date.now()}-${nextLocalId}`,
    conversationId: null,
    messages: [],
    draft: ""
  };
}

function showStorageStatus(message) {
  storageStatus.textContent = message;
  storageStatus.hidden = !message;
}

function isValidConversation(value) {
  return value !== null && typeof value === "object" &&
    typeof value.id === "string" && value.id.length > 0 &&
    (value.conversationId === null || typeof value.conversationId === "string") &&
    typeof value.draft === "string" && value.draft.length <= 2000 &&
    Array.isArray(value.messages) && (value.messages.length > 0 || value.draft.length > 0) &&
    value.messages.every((message) =>
      message !== null && typeof message === "object" &&
      (message.role === "user" || message.role === "assistant") &&
      typeof message.text === "string" &&
      (message.extraClass === "" || message.extraClass === "msg-error")
    );
}

function restoreHistory() {
  try {
    const stored = sessionStorage.getItem(storageKey);
    if (!stored) {
      return;
    }

    const data = JSON.parse(stored);
    if (!data || !Array.isArray(data.conversations) ||
        data.conversations.length > historyLimit ||
        !data.conversations.every(isValidConversation) ||
        new Set(data.conversations.map((conversation) => conversation.id)).size !== data.conversations.length ||
        (data.activeId !== null && typeof data.activeId !== "string")) {
      throw new Error("Historial inválido");
    }

    conversations = data.conversations;
    currentConversation = conversations.find((conversation) => conversation.id === data.activeId) ?? createConversation();
    currentConversationId = currentConversation.conversationId;
  } catch (_error) {
    showStorageStatus("No fue posible recuperar el historial de esta pestaña. Las conversaciones nuevas podrían no conservarse al recargar.");
  }
}

function saveHistory() {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify({
      activeId: conversations.some((conversation) => conversation.id === currentConversation.id)
        ? currentConversation.id
        : null,
      conversations
    }));
    showStorageStatus("");
  } catch (_error) {
    showStorageStatus("No fue posible guardar el historial en esta pestaña. Puedes continuar el chat, pero podrías perderlo al recargar.");
  }
}

function conversationTitle(conversation) {
  const firstMessage = conversation.messages.find((message) => message.role === "user");
  return firstMessage ? firstMessage.text.slice(0, 60) : `Borrador: ${conversation.draft.slice(0, 50)}`;
}

function renderHistory() {
  conversationList.replaceChildren();
  if (conversations.length === 0) {
    const empty = document.createElement("p");
    empty.classList.add("history-empty");
    empty.textContent = "Aún no hay conversaciones.";
    conversationList.appendChild(empty);
    return;
  }

  conversations.forEach((conversation) => {
    const row = document.createElement("div");
    row.classList.add("history-row");
    const select = document.createElement("button");
    select.type = "button";
    select.classList.add("history-select");
    select.textContent = conversationTitle(conversation);
    select.title = conversationTitle(conversation);
    select.disabled = isSubmitting || isRecording;
    if (conversation.id === currentConversation.id) {
      select.setAttribute("aria-current", "true");
    }
    select.addEventListener("click", () => selectConversation(conversation));

    const remove = document.createElement("button");
    remove.type = "button";
    remove.classList.add("history-remove");
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Eliminar conversación: ${conversationTitle(conversation)}`);
    remove.disabled = isSubmitting || isRecording;
    remove.addEventListener("click", () => removeConversation(conversation));
    row.append(select, remove);
    conversationList.appendChild(row);
  });
}

function promoteCurrentConversation() {
  conversations = conversations.filter((conversation) => conversation.id !== currentConversation.id);
  conversations.unshift(currentConversation);
  if (conversations.length > historyLimit) {
    conversations.pop();
    historyStatus.textContent = "Se retiró la conversación menos reciente para mantener el límite de seis.";
  }
}

function recordMessage(role, text, extraClass = "") {
  currentConversation.messages.push({ role, text, extraClass });
  promoteCurrentConversation();
  saveHistory();
  renderHistory();
}

function saveDraft(activity = false) {
  currentConversation.draft = userInput.value;
  const saved = conversations.some((conversation) => conversation.id === currentConversation.id);
  if (currentConversation.draft || currentConversation.messages.length > 0) {
    if (!saved || activity) {
      promoteCurrentConversation();
    }
    saveHistory();
    renderHistory();
  } else if (saved) {
    conversations = conversations.filter((conversation) => conversation.id !== currentConversation.id);
    saveHistory();
    renderHistory();
  }
}

function renderConversation() {
  conversationCanvas.replaceChildren();
  appendMessage("assistant", welcomeMessage, "welcome-message");
  currentConversation.messages.forEach((message) => {
    appendMessage(message.role, message.text, message.extraClass);
  });
  userInput.value = currentConversation.draft;
  renderHistory();
}

function selectConversation(conversation) {
  if (isSubmitting || isRecording) {
    return;
  }
  saveDraft();
  currentConversation = conversation;
  currentConversationId = conversation.conversationId;
  promoteCurrentConversation();
  saveHistory();
  renderConversation();
  showChat();
}

function removeConversation(conversation) {
  if (isSubmitting || isRecording) {
    return;
  }
  conversations = conversations.filter((item) => item.id !== conversation.id);
  if (conversation.id === currentConversation.id) {
    currentConversation = createConversation();
    currentConversationId = null;
    renderConversation();
    showChat();
  } else {
    renderHistory();
  }
  saveHistory();
}

function showChat() {
  informationView.hidden = true;
  messagesContainer.hidden = false;
  composerDock.hidden = false;
  setSidebarOpen(false);
  if (!isSubmitting) {
    userInput.focus();
  }
}

function showInformation(moduleId, itemTitle = "") {
  const module = exampleModules[moduleId];
  if (!module) {
    return;
  }

  saveDraft();
  informationTitle.textContent = module.title;
  informationDescription.textContent = module.description;
  informationItems.replaceChildren();
  const items = itemTitle ? module.items.filter((item) => item.title === itemTitle) : module.items;

  items.forEach((item) => {
    const card = document.createElement("article");
    card.classList.add("information-card");
    const title = document.createElement("h3");
    title.textContent = item.title;
    card.appendChild(title);

    const details = document.createElement("dl");
    item.details.forEach(([label, value]) => {
      const term = document.createElement("dt");
      term.textContent = label;
      const description = document.createElement("dd");
      description.textContent = value;
      details.append(term, description);
    });
    card.appendChild(details);

    const actions = document.createElement("div");
    actions.classList.add("information-actions");
    const prepare = document.createElement("button");
    prepare.type = "button";
    prepare.classList.add("secondary-btn", "context-action");
    prepare.textContent = "Preparar pregunta";
    prepare.disabled = isSubmitting || isRecording;
    prepare.addEventListener("click", () => prepareContextQuery(item.query));
    const send = document.createElement("button");
    send.type = "button";
    send.classList.add("new-chat-btn", "context-action");
    send.textContent = "Consultar ahora";
    send.disabled = isSubmitting || isRecording;
    send.addEventListener("click", () => {
      showChat();
      sendMessage(item.query, true);
    });
    actions.append(prepare, send);
    card.appendChild(actions);
    informationItems.appendChild(card);
  });

  messagesContainer.hidden = true;
  composerDock.hidden = true;
  informationView.hidden = false;
  setSidebarOpen(false);
  informationTitle.focus();
}

function prepareContextQuery(query) {
  const draft = userInput.value.trim();
  const combined = draft ? `${draft} ${query}` : query;
  if (combined.length > 2000) {
    showStorageStatus("No se pudo añadir la pregunta: el borrador superaría los 2000 caracteres. Reduce el texto e inténtalo de nuevo.");
    return;
  }
  userInput.value = combined;
  saveDraft(true);
  showChat();
}

function splitMarkdownRow(line) {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells = [];
  let cell = "";
  let escaped = false;

  for (const character of trimmed) {
    if (escaped) {
      cell += character;
      escaped = false;
    } else if (character === "\\") {
      escaped = true;
    } else if (character === "|") {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += character;
    }
  }

  if (escaped) {
    cell += "\\";
  }
  cells.push(cell.trim());
  return cells;
}

function isMarkdownTableDivider(line) {
  const cells = splitMarkdownRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function appendTextBlock(container, lines) {
  if (lines.length === 0) {
    return;
  }

  const paragraph = document.createElement("p");
  paragraph.textContent = lines.join("\n");
  container.appendChild(paragraph);
}

function appendMarkdownTable(container, rows) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("table-scroll");

  const table = document.createElement("table");
  table.classList.add("response-table");
  const head = document.createElement("thead");
  const headerRow = document.createElement("tr");

  rows[0].forEach((value) => {
    const cell = document.createElement("th");
    cell.scope = "col";
    cell.textContent = value;
    headerRow.appendChild(cell);
  });
  head.appendChild(headerRow);
  table.appendChild(head);

  const body = document.createElement("tbody");
  rows.slice(1).forEach((row) => {
    const tableRow = document.createElement("tr");
    rows[0].forEach((_, index) => {
      const cell = document.createElement("td");
      cell.textContent = row[index] ?? "";
      tableRow.appendChild(cell);
    });
    body.appendChild(tableRow);
  });
  table.appendChild(body);
  wrapper.appendChild(table);
  container.appendChild(wrapper);
}

function renderResponseContent(container, text) {
  const lines = text.split("\n");
  let textLines = [];
  let index = 0;

  while (index < lines.length) {
    const isTable =
      lines[index].includes("|") &&
      index + 1 < lines.length &&
      lines[index + 1].includes("|") &&
      isMarkdownTableDivider(lines[index + 1]);

    if (!isTable) {
      textLines.push(lines[index]);
      index += 1;
      continue;
    }

    appendTextBlock(container, textLines);
    textLines = [];

    const header = splitMarkdownRow(lines[index]);
    const tableRows = [header];
    index += 2;

    while (index < lines.length && lines[index].includes("|")) {
      const row = splitMarkdownRow(lines[index]);
      tableRows.push(Array.from({ length: header.length }, (_, column) => row[column] ?? ""));
      index += 1;
    }

    appendMarkdownTable(container, tableRows);
  }

  appendTextBlock(container, textLines);
}

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
    badge.textContent = extraClass === "welcome-message" ? "IA Corporativa" : "Fuente Verificada ✓";
    header.appendChild(badge);
  }

  const bubble = document.createElement("div");
  bubble.classList.add("msg-bubble");
  renderResponseContent(bubble, text);

  content.appendChild(header);
  content.appendChild(bubble);

  row.appendChild(avatar);
  row.appendChild(content);
  conversationCanvas.appendChild(row);

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
    chip.disabled = loading || isRecording;
  });
  updateConversationControls();
}

function updateConversationControls() {
  newChatBtn.disabled = isSubmitting || isRecording;
  sendBtn.disabled = isSubmitting || isRecording;
  document.querySelectorAll(".context-action").forEach((action) => {
    action.disabled = isSubmitting || isRecording;
  });
  chipButtons.forEach((chip) => {
    chip.disabled = isSubmitting || isRecording;
  });
  renderHistory();
}

/**
 * Envía la consulta al endpoint POST /api/chat conservando el conversation_id.
 */
async function sendMessage(rawText, preserveDraft = false) {
  if (isSubmitting) {
    return;
  }

  const message = typeof rawText === "string" ? rawText.trim() : "";
  if (message.length < 1 || message.length > 2000) {
    return;
  }

  appendMessage("user", message);
  if (!preserveDraft) {
    userInput.value = "";
  }
  currentConversation.draft = userInput.value;
  recordMessage("user", message);
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
      recordMessage("assistant", errorText, "msg-error");
      return;
    }

    if (typeof data.conversation_id === "string" && data.conversation_id.trim().length > 0) {
      currentConversationId = data.conversation_id.trim();
      currentConversation.conversationId = currentConversationId;
    }

    const replyText =
      typeof data.reply === "string" && data.reply.trim().length > 0
        ? data.reply
        : "No se obtuvo respuesta disponible.";

    appendMessage("assistant", replyText);
    recordMessage("assistant", replyText);
  } catch (_err) {
    loadingEntry.row.remove();
    appendMessage(
      "assistant",
      "El asistente no está disponible temporalmente. Verifica tu conexión.",
      "msg-error"
    );
    recordMessage(
      "assistant",
      "El asistente no está disponible temporalmente. Verifica tu conexión.",
      "msg-error"
    );
  } finally {
    setLoadingState(false);
    userInput.focus();
  }
}

function setSidebarOpen(open) {
  sidebar.classList.toggle("is-open", open);
  sidebarBackdrop.classList.toggle("is-visible", open);
  sidebarToggle.setAttribute("aria-expanded", String(open));
  sidebarToggle.setAttribute("aria-label", open ? "Cerrar navegación" : "Abrir navegación");
}

function startNewConversation() {
  if (isSubmitting || isRecording) {
    return;
  }

  saveDraft();
  currentConversation = createConversation();
  currentConversationId = null;
  voiceStatus.textContent = "";
  saveHistory();
  renderConversation();
  showChat();
}

// Envío del formulario principal
chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!isRecording) {
    sendMessage(userInput.value);
  }
});

newChatBtn.addEventListener("click", startNewConversation);
userInput.addEventListener("input", () => saveDraft(true));
showChatBtn.addEventListener("click", showChat);
returnChatBtn.addEventListener("click", showChat);

// Activación de chips de consulta rápida
chipButtons.forEach((chip) => {
  chip.addEventListener("click", () => {
    const query = chip.getAttribute("data-query");
    if (query) {
      sendMessage(query);
    }
  });
});

document.querySelectorAll("[data-context-query]").forEach((action) => {
  action.addEventListener("click", () => {
    if (isSubmitting || isRecording) {
      return;
    }
    const query = action.getAttribute("data-context-query");
    if (query) {
      prepareContextQuery(query);
    }
  });
});

document.querySelectorAll("[data-module]").forEach((action) => {
  action.addEventListener("click", () => {
    showInformation(action.getAttribute("data-module"));
  });
});

document.querySelectorAll("[data-branch]").forEach((branch) => {
  branch.addEventListener("click", () => {
    const name = branch.getAttribute("data-branch");
    if (name) {
      showInformation("rutas", name);
    }
  });
});

sidebarToggle.addEventListener("click", () => {
  setSidebarOpen(!sidebar.classList.contains("is-open"));
});

sidebarBackdrop.addEventListener("click", () => {
  setSidebarOpen(false);
  sidebarToggle.focus();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && sidebar.classList.contains("is-open")) {
    setSidebarOpen(false);
    sidebarToggle.focus();
  }
});

restoreHistory();
renderConversation();

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
    updateConversationControls();
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
    updateConversationControls();
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

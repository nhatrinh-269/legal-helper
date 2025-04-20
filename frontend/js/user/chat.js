const user = JSON.parse(localStorage.getItem("user"));
const userId = user?.user_id;
const API = "http://localhost:8000/api/v1/user/chat";

let currentChatId = localStorage.getItem("chat_id") || null;
let messages = [];

const chatWindow = document.getElementById("chatWindow");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const newChatBtn = document.getElementById("newChatBtn");
const chatHistoryList = document.getElementById("chatHistoryList");

// Resize textarea
chatInput.addEventListener("input", () => {
  chatInput.style.height = "auto";
  chatInput.style.height = chatInput.scrollHeight + "px";
});

// Gửi tin nhắn khi Enter
chatInput.addEventListener("keypress", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn.addEventListener("click", sendMessage);

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  appendMessage("user", text);
  chatInput.value = "";
  chatInput.style.height = "auto";

  // Gửi câu hỏi đến Gemini
  const res = await fetch(`${API}/askllms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, question: text })
  });
  
  const data = await res.json();
  
  if (res.status !== 200) {
    appendMessage("bot", data.detail || "Lỗi hệ thống");
    return;
  }
  appendMessage("bot", data.answer);

  // Lưu đoạn chat (POST hoặc PUT)
  messages.push({ role: "user", text }, { role: "bot", text: data.answer });
  if (currentChatId) {
    await fetch(`${API}/update/${currentChatId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message_content: messages })
    });
  } else {
    const saveRes = await fetch(`${API}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, message_content: messages })
    });
    const saved = await saveRes.json();
    currentChatId = saved.id;
    localStorage.setItem("chat_id", currentChatId);
    loadChatHistory();
  }
}

function appendMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = `message ${role}`;
  msg.innerHTML = `<div>${text}</div><div class="message-time">${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>`;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

newChatBtn.addEventListener("click", () => {
  if (messages.length > 0) saveCurrentChat();
  currentChatId = null;
  localStorage.removeItem("chat_id");
  messages = [];
  chatWindow.innerHTML = "";
  appendMessage("bot", "Xin chào! Tôi là Legal Helper. Bạn cần hỗ trợ gì?");
});

async function loadChatHistory() {
  const res = await fetch(`${API}/list/${userId}`);
  const data = await res.json();

  chatHistoryList.innerHTML = "";
  data.forEach(chat => {
    const div = document.createElement("div");
    div.className = "chat-session";
    if (chat.id == currentChatId) div.classList.add("active");

    div.innerHTML = `
      <div class="chat-title-row">
        <span class="chat-title">${chat.title}</span>
        <button class="delete-btn" data-id="${chat.id}">🗑</button>
      </div>
    `;


    div.addEventListener("click", () => loadChat(chat));
    div.querySelector(".delete-btn").addEventListener("click", e => {
      e.stopPropagation();
      deleteChat(chat.id);
    });

    chatHistoryList.appendChild(div);
  });
}

async function loadChat(chat) {
  if (messages.length > 0) await saveCurrentChat();

  currentChatId = chat.id;
  localStorage.setItem("chat_id", currentChatId);
  messages = chat.message_content;

  chatWindow.innerHTML = "";
  messages.forEach(msg => appendMessage(msg.role, msg.text));
}

async function saveCurrentChat() {
  if (!messages.length) return;
  if (currentChatId) {
    await fetch(`${API}/update/${currentChatId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message_content: messages })
    });
  } else {
    const res = await fetch(`${API}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, message_content: messages })
    });
    const data = await res.json();
    currentChatId = data.id;
    localStorage.setItem("chat_id", currentChatId);
  }
  loadChatHistory();
}

async function deleteChat(chatId) {
  await fetch(`${API}/delete/${chatId}`, { method: "DELETE" });

  if (chatId == currentChatId) {
    currentChatId = null;
    localStorage.removeItem("chat_id");
    messages = [];
    chatWindow.innerHTML = "";
    appendMessage("bot", "Xin chào! Tôi là Legal Helper. Bạn cần hỗ trợ gì?");
  }

  loadChatHistory();
}

window.addEventListener("DOMContentLoaded", () => {
  loadChatHistory();
  if (!currentChatId) {
    appendMessage("bot", "Xin chào! Tôi là Legal Helper. Bạn cần hỗ trợ gì?");
  }
});

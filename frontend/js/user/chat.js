// Lấy thông tin user
const user = JSON.parse(localStorage.getItem("user"));
const userId = user?.user_id;
const API = `/api/v1/user/chat`;

let currentChatId = localStorage.getItem("chat_id") || null;
let messages = [];
let allChats = [];

// DOM elements
const chatWindow      = document.getElementById("chatWindow");
const chatInput       = document.getElementById("chatInput");
const sendBtn         = document.getElementById("sendBtn");
const newChatBtn      = document.getElementById("newChatBtn");
const chatHistoryList = document.getElementById("chatHistoryList");
const searchBar       = document.querySelector(".search-bar");
const menuBtn         = document.getElementById("menuBtn");
const sidebar         = document.getElementById("sidebar");

// Toggle sidebar trên mobile
menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

// Đóng sidebar khi click ngoài (mobile)
document.addEventListener("click", (e) => {
  if (
    sidebar.classList.contains("open") &&
    !sidebar.contains(e.target) &&
    e.target !== menuBtn
  ) {
    sidebar.classList.remove("open");
  }
});

// Auto-resize textarea
chatInput.addEventListener("input", () => {
  chatInput.style.height = "auto";
  chatInput.style.height = chatInput.scrollHeight + "px";
});

// Gửi message khi nhấn Enter (không Shift)
chatInput.addEventListener("keypress", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
sendBtn.addEventListener("click", sendMessage);

// Tạo mới phiên chat
newChatBtn.addEventListener("click", () => {
  if (messages.length > 0) saveCurrentChat();
  currentChatId = null;
  localStorage.removeItem("chat_id");
  messages = [];
  chatWindow.innerHTML = "";
  appendMessage("assistant", "Xin chào! Tôi là Legal Helper. Bạn cần hỗ trợ gì?");
});

// Local search khi gõ
searchBar.addEventListener("input", e => {
  const q = e.target.value.trim().toLowerCase();
  const filtered = allChats.filter(chat =>
    chat.title.toLowerCase().includes(q) ||
    chat.message_content.some(m => m.text.toLowerCase().includes(q))
  );
  renderChatList(filtered);
});

// Khởi tạo khi load trang
window.addEventListener("DOMContentLoaded", () => {
  fetchAllChats();
  if (!currentChatId) {
    appendMessage("assistant", "Xin chào! Tôi là Legal Helper. Bạn cần hỗ trợ gì?");
  }
});

// Fetch toàn bộ chats
async function fetchAllChats() {
  try {
    const res = await fetch(`${API}/list/${userId}`);
    allChats = await res.json();
    renderChatList(allChats);
  } catch (e) {
    console.error("Lỗi khi fetch tất cả chats:", e);
  }
}

// Render sidebar list
function renderChatList(chats) {
  chatHistoryList.innerHTML = "";
  chats.forEach(chat => {
    const div = document.createElement("div");
    div.className = "chat-session";
    if (chat.id == currentChatId) div.classList.add("active");
    div.innerHTML = `
      <div class="chat-title-row">
        <span class="chat-title">${chat.title}</span>
        <button class="delete-btn" data-id="${chat.id}">🗑</button>
      </div>`;
    // Click vào session để load
    div.addEventListener("click", () => loadChat(chat));
    // Xoá session
    div.querySelector(".delete-btn").addEventListener("click", e => {
      e.stopPropagation();
      deleteChat(chat.id);
    });
    chatHistoryList.appendChild(div);
  });
}

// Load một phiên chat
async function loadChat(chat) {
  if (messages.length > 0) await saveCurrentChat();
  currentChatId = chat.id;
  localStorage.setItem("chat_id", currentChatId);
  messages = chat.message_content;
  chatWindow.innerHTML = "";
  messages.forEach(msg => appendMessage(msg.role, msg.text));
}

// Lưu phiên chat hiện tại
async function saveCurrentChat() {
  if (!messages.length) return;
  const payload = { message_content: messages };
  if (currentChatId) {
    await fetch(`${API}/update/${currentChatId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } else {
    const res = await fetch(`${API}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, ...payload })
    });
    const data = await res.json();
    currentChatId = data.id;
    localStorage.setItem("chat_id", currentChatId);
  }
  await fetchAllChats();
}

// Xoá một phiên chat
async function deleteChat(chatId) {
  await fetch(`${API}/delete/${chatId}`, { method: "DELETE" });
  if (chatId == currentChatId) {
    currentChatId = null;
    localStorage.removeItem("chat_id");
    messages = [];
    chatWindow.innerHTML = "";
    appendMessage("assistant", "Xin chào! Tôi là Legal Helper. Bạn cần hỗ trợ gì?");
  }
  await fetchAllChats();
}

// Gửi tin nhắn lên backend
async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  appendMessage("user", text);
  chatInput.value = "";
  chatInput.style.height = "auto";

  // Chuẩn bị hiển thị thinking
  const thinkingEl = appendMessage("assistant", "💭 Đang suy nghĩ...");
  thinkingEl.classList.add("blinking");

  // Gửi request
  try {
    const histories = messages.map(m => ({ role: m.role, content: m.text }));
    const res = await fetch(`${API}/askllms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, question: text, histories })
    });
    const data = await res.json();
    thinkingEl.classList.remove("blinking");

    if (!res.ok) {
      thinkingEl.textContent = data.detail || "Lỗi hệ thống";
      return;
    }

    // Hiệu ứng gõ text
    thinkingEl.textContent = "";
    await typeText(thinkingEl, data.answer);

    // Lưu messages
    messages.push(
      { role: "user", text },
      { role: "assistant", text: data.answer }
    );

    // Cập nhật DB
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
      await fetchAllChats();
    }
  } catch (e) {
    thinkingEl.classList.remove("blinking");
    thinkingEl.textContent = "Lỗi kết nối";
    console.error(e);
  }
}

// Hiệu ứng typing
async function typeText(element, fullText) {
  const htmlContent = marked.parse(fullText);
  element.innerHTML = "";
  let i = 0;
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;
  const finalText = tempDiv.innerHTML;

  for (; i <= finalText.length; i++) {
    element.innerHTML = finalText.substring(0, i);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    await new Promise(r => setTimeout(r, 1));
  }
}

// Thêm message vào chat window
function appendMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = `message ${role}`;

  const markdownHTML = marked.parse(text); // 👉 Chuyển markdown thành HTML

  msg.innerHTML = `
    <div class="message-content">${markdownHTML}</div>
    <div class="message-time">
      ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
    </div>`;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return msg.querySelector(".message-content");
}


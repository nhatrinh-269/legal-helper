// Lấy thông tin user từ localStorage
const user = JSON.parse(localStorage.getItem("user"));
const userId = user?.user_id;
const API = "http://localhost:8000/api/v1/user/chat";

let currentChatId = localStorage.getItem("chat_id") || null;
let messages = [];

// DOM elements
const chatWindow      = document.getElementById("chatWindow");
const chatInput       = document.getElementById("chatInput");
const sendBtn         = document.getElementById("sendBtn");
const newChatBtn      = document.getElementById("newChatBtn");
const chatHistoryList = document.getElementById("chatHistoryList");

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

// Hàm gửi tin nhắn lên backend
async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  appendMessage("user", text);
  chatInput.value = "";
  chatInput.style.height = "auto";

  const histories = messages.map(m => ({ role: m.role, content: m.text }));

  // 👉 Hiển thị "Đang suy nghĩ..." NGAY LẬP TỨC
  const thinkingElement = appendMessage("assistant", "💭 Đang suy nghĩ...");

  // Sau đó thêm class .blinking vào phần tử message-content
  thinkingElement.classList.add("blinking");


  // 🚀 Gọi API
  const res = await fetch(`${API}/askllms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, question: text, histories })
  });
  const data = await res.json();

  if (!res.ok) {
    thinkingElement.innerHTML = data.detail || "Lỗi hệ thống";
    return;
  }

  // ✅ Xoá "Đang suy nghĩ..." và gõ từ từ ra câu trả lời
  thinkingElement.classList.remove("blinking");

  // ✅ Xoá text cũ ("Đang suy nghĩ...") rồi gõ từ từ ra câu trả lời
  thinkingElement.innerHTML = "";
  await typeText(thinkingElement, data.answer);

  messages.push(
    { role: "user", text },
    { role: "assistant", text: data.answer }
  );

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

// Thêm message vào chat window và trả về element chứa text
function appendMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = `message ${role}`;
  msg.innerHTML = `
    <div class="message-content">${text}</div>
    <div class="message-time">
      ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
    </div>
  `;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return msg.querySelector(".message-content"); // Trả về element để typeText sử dụng
}

// Hiệu ứng typing từng ký tự
async function typeText(element, fullText) {
  // ✅ Convert Markdown → HTML
  const htmlContent = marked.parse(fullText);
  element.innerHTML = ""; // Xoá cũ

  // Typing hiệu ứng từng ký tự của HTML:
  let i = 0;
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;
  const finalText = tempDiv.innerHTML;

  for (; i <= finalText.length; i++) {
    element.innerHTML = finalText.substring(0, i);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    await new Promise(resolve => setTimeout(resolve, 1)); // 10ms mỗi ký tự (tùy chỉnh)
  }
}

// Tạo mới phiên chat
newChatBtn.addEventListener("click", () => {
  if (messages.length > 0) saveCurrentChat();
  currentChatId = null;
  localStorage.removeItem("chat_id");
  messages = [];
  chatWindow.innerHTML = "";
  appendMessage("assistant", "Xin chào! Tôi là Legal Helper. Bạn cần hỗ trợ gì?");
});

// Load danh sách chat cũ
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

// Load nội dung một phiên chat
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
  loadChatHistory();
}

// Khởi tạo khi load trang
window.addEventListener("DOMContentLoaded", () => {
  loadChatHistory();
  if (!currentChatId) {
    appendMessage("assistant", "Xin chào! Tôi là Legal Helper. Bạn cần hỗ trợ gì?");
  }
});

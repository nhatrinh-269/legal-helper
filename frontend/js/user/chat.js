const chatWindow = document.getElementById('chatWindow');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.getElementById('newChatBtn');

sendBtn.addEventListener('click', () => submitMessage());

chatInput.addEventListener('input', () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = chatInput.scrollHeight + 'px';
});

chatInput.addEventListener('keypress', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    submitMessage();
  }
});

function submitMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  const userMsg = document.createElement('div');
  userMsg.className = 'message user animated';
  userMsg.innerHTML = `<div>${text}</div><div class="message-time">${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>`;
  chatWindow.appendChild(userMsg);

  const botMsg = document.createElement('div');
  botMsg.className = 'message bot animated';
  botMsg.innerHTML = `<div>Đang xử lý câu hỏi...</div>`;
  chatWindow.appendChild(botMsg);

  chatInput.value = '';
  chatInput.style.height = 'auto';
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

newChatBtn.addEventListener('click', () => {
  chatWindow.innerHTML = '';
  const welcome = document.createElement('div');
  welcome.className = 'message bot animated';
  welcome.innerHTML = `
    <div>Xin chào! Tôi là Legal Helper. Bạn cần hỗ trợ gì?</div>
    <div class="message-time">${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
  `;
  chatWindow.appendChild(welcome);
  chatInput.value = '';
  chatInput.style.height = 'auto';
  chatInput.focus();
});

const user = JSON.parse(localStorage.getItem("user"));
const userId = user?.user_id;
const API_BASE = "http://localhost:8000/api/v1/user/feedback";

// Load lịch sử phản hồi
async function loadFeedback() {
  if (!userId) return;

  try {
    const res = await fetch(`${API_BASE}/fb/${userId}`);
    if (!res.ok) throw new Error("Không tải được phản hồi");

    const data = await res.json();

    const container = document.querySelector(".feedback-history");

    // Xóa các feedback-item cũ, giữ lại <h3>
    const items = container.querySelectorAll(".feedback-item");
    items.forEach(item => item.remove());

    // Thêm phản hồi mới
    data.forEach(item => {
      const div = document.createElement("div");
      div.classList.add("feedback-item");
      div.innerHTML = `<p><strong>${new Date(item.timestamp).toLocaleDateString()}:</strong> ${item.content}</p>`;
      container.appendChild(div);
    });
  } catch (error) {
    console.error("Lỗi khi tải phản hồi:", error);
    alert("Không thể tải phản hồi từ hệ thống.");
  }
}

// Gửi phản hồi mới
document.getElementById("feedbackForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const feedbackText = document.getElementById("feedbackInput").value.trim();
  if (!feedbackText || !userId) return;

  try {
    const res = await fetch(`${API_BASE}/createfb/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        content: feedbackText
      })
    });

    if (!res.ok) throw new Error("Không gửi được phản hồi");

    document.getElementById("feedbackInput").value = "";
    loadFeedback(); // Reload lại danh sách sau khi gửi thành công
  } catch (error) {
    console.error("Lỗi khi gửi phản hồi:", error);
    alert("Không thể gửi phản hồi. Vui lòng thử lại.");
  }
});

// Tự động tải phản hồi khi trang được load
window.addEventListener("DOMContentLoaded", loadFeedback);

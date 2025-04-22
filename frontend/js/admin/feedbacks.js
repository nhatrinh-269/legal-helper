// frontend/js/admin/feedbacks.js

document.addEventListener("DOMContentLoaded", () => {
    const feedbackTableBody = document.getElementById("feedbackTableBody");
  
    // Hàm load feedbacks từ API
    async function loadFeedbacks() {
      try {
        const res = await fetch("/api/v1/admin/feedbacks");
        if (!res.ok) {
          console.error("Lỗi khi load feedbacks:", res.status);
          return;
        }
        const data = await res.json();
        renderTable(data);
      } catch (err) {
        console.error("Error loading feedbacks:", err);
      }
    }
  
    // Render bảng chỉ 3 cột: user, content, timestamp
    function renderTable(items) {
      feedbackTableBody.innerHTML = "";
      items.forEach(fb => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${fb.user}</td>
          <td>${fb.content}</td>
          <td>${new Date(fb.timestamp).toLocaleString()}</td>
        `;
        feedbackTableBody.appendChild(tr);
      });
    }
  
    // Khởi tạo
    loadFeedbacks();
  });
  
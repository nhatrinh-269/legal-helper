// frontend/js/admin/usagequota.js

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("quotaTableBody");
  
    // 1. Load dữ liệu quota từ API
    async function loadQuota() {
      try {
        const res = await fetch("/api/v1/admin/quota");
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        renderTable(data);
      } catch (err) {
        console.error("Lỗi khi load quota:", err);
      }
    }
  
    // 2. Render bảng với progress bar
    function renderTable(items) {
      tableBody.innerHTML = "";
      items.forEach(item => {
        const percent = Math.min(Math.round(item.percent_used), 100);
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${item.user}</td>
          <td>${new Date(item.usage_date).toLocaleDateString()}</td>
          <td>${item.questions_asked}</td>
          <td>${item.question_limit}</td>
          <td>
            <div class="progress-container">
              <div 
                class="progress-bar" 
                style="width: ${percent}%;"
                title="${percent}%"
              ></div>
            </div>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    }
  
    // 3. Khởi tạo
    loadQuota();
  });
  
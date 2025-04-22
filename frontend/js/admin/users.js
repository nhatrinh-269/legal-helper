// frontend/js/admin/users.js

document.addEventListener("DOMContentLoaded", () => {
    const userTableBody = document.getElementById("userTableBody");
    const roleFilter     = document.getElementById("roleFilter");
    const statusFilter   = document.getElementById("statusFilter");
  
    // 1. Load users với filter và render bảng
    async function loadUsers() {
      const params = new URLSearchParams();
      if (roleFilter.value)   params.append("role",   roleFilter.value);
      if (statusFilter.value) params.append("status", statusFilter.value);
  
      try {
        const res = await fetch(`/api/v1/admin/users?${params}`);
        if (!res.ok) throw new Error(`Load users failed: ${res.status}`);
        const users = await res.json();
        renderTable(users);
      } catch (err) {
        console.error(err);
        userTableBody.innerHTML = `<tr><td colspan="7">Không thể tải dữ liệu</td></tr>`;
      }
    }
  
    // 2. Render lại toàn bộ tbody dựa trên array users
    function renderTable(users) {
      userTableBody.innerHTML = "";
  
      users.forEach(user => {
        const isActive = user.status === "active";
        const btnText  = isActive ? "Disable" : "Activate";
        const btnClass = isActive ? "btn-disable" : "btn-activate";
  
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${user.user_id}</td>
          <td>${user.full_name}</td>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td class="cell-status">${user.status}</td>
          <td>${new Date(user.registration_time).toLocaleString()}</td>
          <td class="actions">
            <button 
              data-id="${user.user_id}" 
              class="btn-action ${btnClass} btn-toggle-status"
            >
              ${btnText}
            </button>
          </td>
        `;
        userTableBody.appendChild(tr);
      });
  
      // 3. Gán listener cho mỗi nút Toggle
      document.querySelectorAll(".btn-toggle-status").forEach(btn => {
        btn.addEventListener("click", () => toggleStatus(btn));
      });
    }
  
    // 4. Toggle trạng thái của 1 user và chỉ update DOM trên dòng đó
    async function toggleStatus(btn) {
      const userId = btn.dataset.id;
      btn.disabled    = true;
      btn.textContent = "Processing…";
  
      try {
        const res = await fetch(`/api/v1/admin/users/${userId}/status`, {
          method: "PATCH",
        });
        if (!res.ok) throw new Error(`Status patch failed: ${res.status}`);
  
        const payload   = await res.json();
        const newStatus = payload.status;  // 'active' hoặc 'inactive'
  
        // Lấy <tr> chứa nút và cell status
        const row    = btn.closest("tr");
        const statusCell = row.querySelector(".cell-status");
  
        // Update cell status text
        statusCell.textContent = newStatus;
  
        // Update nút: text + class
        if (newStatus === "active") {
          btn.textContent = "Disable";
          btn.classList.remove("btn-activate");
          btn.classList.add("btn-disable");
        } else {
          btn.textContent = "Activate";
          btn.classList.remove("btn-disable");
          btn.classList.add("btn-activate");
        }
      } catch (err) {
        console.error(err);
        // Nếu có lỗi, reset text và class về ban đầu
        const fallbackStatus = btn.textContent.includes("Disable") ? "Disable" : "Activate";
        btn.textContent = fallbackStatus;
      } finally {
        btn.disabled = false;
      }
    }
  
    // 5. Event listener cho filter dropdowns
    roleFilter.addEventListener("change", loadUsers);
    statusFilter.addEventListener("change", loadUsers);
  
    // 6. Chạy load lần đầu
    loadUsers();
  });
  
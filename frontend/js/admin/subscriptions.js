// frontend/js/admin/subscriptions.js

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("subscriptionsTableBody");
  
    // 1. Load danh sách subscriptions từ API
    async function loadSubscriptions() {
      try {
        const res = await fetch("/api/v1/admin/subscriptions");
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        renderTable(data);
      } catch (err) {
        console.error("Lỗi khi load subscriptions:", err);
      }
    }
  
    // 2. Render bảng và gắn sự kiện View / Cancel
    function renderTable(items) {
      tableBody.innerHTML = "";
      items.forEach(sub => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${sub.user}</td>
          <td>${sub.package}</td>
          <td>${new Date(sub.start_time).toLocaleDateString()}</td>
          <td>${new Date(sub.end_time).toLocaleDateString()}</td>
          <td>${sub.status}</td>
          <td class="actions">
            <button data-id="${sub.subscription_id}" class="btn-view">View</button>
            <button data-id="${sub.subscription_id}" class="btn-cancel">Cancel</button>
          </td>
        `;
        tableBody.appendChild(tr);
      });
  
      // View chi tiết
      document.querySelectorAll(".btn-view").forEach(btn => {
        btn.addEventListener("click", () => {
          const sub = items.find(x => x.subscription_id == btn.dataset.id);
          alert(
            `Chi tiết Subscription:\n` +
            `User: ${sub.user}\n` +
            `Package: ${sub.package}\n` +
            `Start: ${new Date(sub.start_time).toLocaleString()}\n` +
            `End: ${new Date(sub.end_time).toLocaleString()}\n` +
            `Status: ${sub.status}`
          );
        });
      });
  
      // Cancel subscription
      document.querySelectorAll(".btn-cancel").forEach(btn => {
        btn.addEventListener("click", async () => {
          if (!confirm("Bạn có chắc muốn huỷ subscription này không?")) return;
          btn.disabled = true;
          try {
            const res = await fetch(`/api/v1/admin/subscriptions/${btn.dataset.id}`, {
              method: "DELETE"
            });
            if (!res.ok) throw new Error(res.status);
          } catch (err) {
            console.error("Huỷ thất bại:", err);
          } finally {
            await loadSubscriptions();
          }
        });
      });
    }
  
    // 3. Khởi tạo
    loadSubscriptions();
  });
  
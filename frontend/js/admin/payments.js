// frontend/js/admin/payments.js

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("paymentsTableBody");
  
    // Load payments từ API
    async function loadPayments() {
      try {
        const res = await fetch("/api/v1/admin/payments");
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        renderTable(data);
      } catch (err) {
        console.error("Lỗi khi load payments:", err);
      }
    }
  
    // Render bảng và gắn sự kiện View
    function renderTable(payments) {
      tableBody.innerHTML = "";
      payments.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${p.user}</td>
          <td>${p.method}</td>
          <td>${Number(p.amount).toLocaleString()}₫</td>
          <td>${p.package}</td>
          <td>${p.status}</td>
          <td>${new Date(p.payment_time).toLocaleString()}</td>
          <td class="actions">
            <button data-id="${p.payment_id}" class="btn-view">View</button>
          </td>
        `;
        tableBody.appendChild(tr);
      });
  
      document.querySelectorAll(".btn-view").forEach(btn => {
        btn.addEventListener("click", () => {
          const pay = payments.find(x => x.payment_id == btn.dataset.id);
          alert(`Chi tiết thanh toán:
  ID: ${pay.payment_id}
  Người dùng: ${pay.user}
  Phương thức: ${pay.method}
  Số tiền: ${Number(pay.amount).toLocaleString()}₫
  Gói: ${pay.package}
  Trạng thái: ${pay.status}
  Thời gian: ${new Date(pay.payment_time).toLocaleString()}`);
        });
      });
    }
  
    // Khởi tạo
    loadPayments();
  });
  
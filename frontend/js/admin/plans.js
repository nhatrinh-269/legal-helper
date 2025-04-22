// frontend/js/admin/plans.js

document.addEventListener("DOMContentLoaded", () => {
    const plansTableBody = document.getElementById("plansTableBody");
    const addBtn = document.querySelector(".btn-primary");
  
    // Fetch và render danh sách gói
    async function loadPlans() {
      try {
        const res = await fetch("/api/v1/admin/plans");
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        renderTable(data);
      } catch (err) {
        console.error("Lỗi khi load plans:", err);
      }
    }
  
    // Tạo bảng
    function renderTable(plans) {
      plansTableBody.innerHTML = "";
      plans.forEach(plan => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${plan.package_name}</td>
          <td>${plan.description || ""}</td>
          <td>${Number(plan.price).toLocaleString()}₫</td>
          <td>${plan.duration_days}</td>
          <td>${plan.question_limit}</td>
          <td class="actions">
            <button data-id="${plan.package_id}" class="btn-action btn-edit">Edit</button>
            <button data-id="${plan.package_id}" class="btn-action btn-delete">Delete</button>
          </td>
        `;
        plansTableBody.appendChild(tr);
      });
  
      // Edit
      document.querySelectorAll(".btn-edit").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          alert(`Chức năng Edit chưa làm: plan_id=${id}`);
        });
      });
  
      // Delete
      document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", async () => {
          if (!confirm("Xoá gói này?")) return;
          btn.disabled = true;
          try {
            const res = await fetch(`/api/v1/admin/plans/${btn.dataset.id}`, {
              method: "DELETE"
            });
            if (!res.ok) throw new Error(res.status);
          } catch (err) {
            console.error("Xoá thất bại:", err);
          } finally {
            await loadPlans();
          }
        });
      });
    }
  
    // Bấm thêm gói
    addBtn.addEventListener("click", () => {
      alert("Chức năng Thêm gói chưa làm.");
    });
  
    loadPlans();
  });
  
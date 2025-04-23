// frontend/js/admin/plans.js

document.addEventListener("DOMContentLoaded", () => {
  const tbody           = document.getElementById("plansTableBody");
  const addBtn          = document.querySelector(".btn-primary");
  const modal           = document.getElementById("planModal");
  const closeModal      = document.getElementById("closePlanModal");
  const cancelModalBtn  = document.getElementById("cancelPlanBtn");
  const form            = document.getElementById("planForm");
  const titleEl         = document.getElementById("planModalTitle");
  // form fields
  const inputName       = document.getElementById("inputName");
  const inputDesc       = document.getElementById("inputDesc");
  const inputPrice      = document.getElementById("inputPrice");
  const inputDuration   = document.getElementById("inputDuration");
  const inputLimit      = document.getElementById("inputLimit");

  let currentPlanId = null;

  // Load initial
  loadPlans();

  // Fetch & render
  async function loadPlans() {
    try {
      const res  = await fetch("/api/v1/admin/plans");
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      renderTable(data);
      bindActions();
    } catch (err) {
      console.error("Load plans failed:", err);
    }
  }

  function renderTable(plans) {
    tbody.innerHTML = "";
    plans.forEach(plan => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${plan.package_name}</td>
        <td>${plan.description || ""}</td>
        <td>${Number(plan.price).toLocaleString()}₫</td>
        <td>${plan.duration_days}</td>
        <td>${plan.question_limit}</td>
        <td class="actions">
          <button class="btn btn-outline btn-sm edit-btn" data-id="${plan.package_id}">Edit</button>
          <button class="btn btn-danger  btn-sm delete-btn" data-id="${plan.package_id}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function bindActions() {
    // Delete
    tbody.querySelectorAll(".delete-btn").forEach(btn => {
      btn.onclick = async () => {
        if (!confirm("Xoá gói này?")) return;
        try {
          const res = await fetch(`/api/v1/admin/plans/${btn.dataset.id}`, { method: "DELETE" });
          if (!res.ok) throw new Error(res.status);
          loadPlans();
        } catch (err) {
          console.error("Delete failed:", err);
          alert("Xoá thất bại");
        }
      };
    });

    // Edit
    tbody.querySelectorAll(".edit-btn").forEach(btn => {
      btn.onclick = () => openModal(btn.dataset.id);
    });
  }

  // Open modal for create or edit
  addBtn.onclick = () => openModal(null);

  function openModal(planId) {
    currentPlanId = planId;
    if (planId) {
      titleEl.innerText = "Chỉnh sửa gói";
      // Prefill from the table row
      const row = tbody.querySelector(`button[data-id="${planId}"]`).closest("tr");
      inputName.value     = row.cells[0].innerText;
      inputDesc.value     = row.cells[1].innerText;
      inputPrice.value    = Number(row.cells[2].innerText.replace(/[₫,]/g, ""));
      inputDuration.value = row.cells[3].innerText;
      inputLimit.value    = row.cells[4].innerText;
    } else {
      titleEl.innerText = "Thêm gói mới";
      form.reset();
    }
    modal.classList.remove("d-none");
  }

  // Close modal
  closeModal.onclick     = () => modal.classList.add("d-none");
  cancelModalBtn.onclick = () => modal.classList.add("d-none");

  // Submit form
  form.onsubmit = async e => {
    e.preventDefault();
    const payload = {
      package_name:  inputName.value.trim(),
      description:   inputDesc.value.trim(),
      price:         parseFloat(inputPrice.value),
      duration_days: parseInt(inputDuration.value, 10),
      question_limit:parseInt(inputLimit.value, 10)
    };
    try {
      let res;
      if (currentPlanId) {
        res = await fetch(`/api/v1/admin/plans/${currentPlanId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("/api/v1/admin/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || res.status);
      }
      modal.classList.add("d-none");
      loadPlans();
    } catch (err) {
      console.error("Save plan failed:", err);
      alert("Lưu thất bại: " + err.message);
    }
  };
});

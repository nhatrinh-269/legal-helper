// frontend/js/admin/feedbacks.js

document.addEventListener("DOMContentLoaded", () => {
  // Table body
  const tbody = document.getElementById("feedbackTableBody");

  // Modal elements
  const modal           = document.getElementById("replyModal");
  const closeModal      = document.getElementById("closeModal");
  const userEmailInput  = document.getElementById("modalUserEmail");
  const adminEmailInput = document.getElementById("modalAdminEmail");
  const replyTextArea   = document.getElementById("modalReplyText");
  const sendBtn         = document.getElementById("modalSendBtn");
  const cancelBtn       = document.getElementById("modalCancelBtn");

  // Track feedback being replied to
  let currentFeedbackId = null;

  // Load feedbacks on start
  loadFeedbacks();

  // 1. Fetch all feedbacks
  async function loadFeedbacks() {
    try {
      const res  = await fetch("/api/v1/admin/feedbacks");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      renderTable(data);
      bindActions();
    } catch (err) {
      console.error("Error loading feedbacks:", err);
    }
  }

  // 2. Populate table rows
  function renderTable(items) {
    tbody.innerHTML = "";
    items.forEach(fb => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${fb.user}</td>
        <td>${fb.content}</td>
        <td>${new Date(fb.timestamp).toLocaleString()}</td>
        <td>${fb.reply || ""}</td>
        <td>
          <button
            class="btn btn-outline btn-sm reply-btn"
            data-id="${fb.feedback_id}"
          >Trả lời</button>
          <button
            class="btn btn-danger btn-sm delete-btn"
            data-id="${fb.feedback_id}"
          >Xóa</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // 3. Attach event handlers
  function bindActions() {
    // Delete handlers
    tbody.querySelectorAll(".delete-btn").forEach(btn => {
      btn.onclick = async () => {
        if (!confirm("Xác nhận xóa phản hồi này?")) return;
        const id = btn.dataset.id;
        try {
          const res = await fetch(`/api/v1/admin/feedbacks/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          loadFeedbacks();
        } catch (err) {
          alert("Xóa thất bại");
          console.error(err);
        }
      };
    });

    // Reply handlers
    tbody.querySelectorAll(".reply-btn").forEach(btn => {
      btn.onclick = async () => {
        currentFeedbackId = btn.dataset.id;

        // Fetch user email for this feedback
        try {
          const resp = await fetch(`/api/v1/admin/feedbacks/${currentFeedbackId}/user-email`);
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const { email } = await resp.json();
          userEmailInput.value = email;
        } catch (err) {
          console.error("Không lấy được email người dùng:", err);
          userEmailInput.value = "";
        }

        // Clear previous reply text and show modal
        replyTextArea.value = "";
        modal.classList.remove("d-none");
      };
    });
  }

  // 4. Modal close handlers
  closeModal.onclick = () => modal.classList.add("d-none");
  cancelBtn.onclick  = () => modal.classList.add("d-none");

  // 5. Send reply (simulate) button
  sendBtn.onclick = () => {
    const reply = replyTextArea.value.trim();
    if (!reply) {
      alert("Vui lòng nhập nội dung trả lời.");
      return;
    }

    // Simulate sending email
    alert("📧 Gửi phản hồi thành công!");

    // Update the reply cell in the table
    const row = tbody.querySelector(`.reply-btn[data-id="${currentFeedbackId}"]`).closest("tr");
    row.cells[3].innerText = reply;  // 4th cell is the reply column

    // Hide modal
    modal.classList.add("d-none");
  };
});

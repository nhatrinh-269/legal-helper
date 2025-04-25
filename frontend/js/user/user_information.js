// frontend/js/user/user_information.js

const user      = JSON.parse(localStorage.getItem("user"));
const userId    = user?.user_id;
const API_BASE  = `/api/v1/user/info`;

const infoList      = document.getElementById("infoList");
const editBtn       = document.getElementById("editBtn");
const deleteBtn     = document.getElementById("deleteBtn");
const logoutBtn     = document.getElementById("logoutBtn");
const backBtn       = document.getElementById("backBtn");

const editModal     = document.getElementById("editModal");
const cancelModal   = document.getElementById("cancelModal");
const editForm      = document.getElementById("editForm");
const inputName     = document.getElementById("inputName");
const inputEmail    = document.getElementById("inputEmail");
const inputPassword = document.getElementById("inputPassword");

document.addEventListener("DOMContentLoaded", () => {
  if (!userId) {
    alert("Bạn chưa đăng nhập.");
    return window.location.href = "../login";
  }
  loadUserInfo();
  bindEvents();
});

async function loadUserInfo() {
  try {
    const res  = await fetch(`${API_BASE}/${userId}`);
    const data = await res.json();
    if (!res.ok) throw data;
    infoList.innerHTML = `
      <li><strong>Họ tên:</strong> ${data.full_name}</li>
      <li><strong>Email:</strong> ${data.email}</li>
      <li><strong>Ngày đăng ký:</strong> ${new Date(data.registration_time).toLocaleDateString('vi-VN')}</li>
      <li><strong>Gói DV:</strong> ${data.package}</li>
      <li><strong>Hết hạn:</strong> ${ data.end_date
        ? new Date(data.end_date).toLocaleDateString('vi-VN') : '---' }</li>
      <li><strong>Câu hỏi:</strong> ${data.question_usage.used}/${data.question_usage.limit}</li>
    `;
  } catch (err) {
    console.error("Lỗi tải info:", err);
    infoList.innerHTML = `<li style="color:red;">Không thể tải thông tin.</li>`;
  }
}

function bindEvents() {
  // Open edit modal
  editBtn.addEventListener("click", () => {
    // Prefill inputs
    const items = infoList.querySelectorAll("li");
    inputName.value  = items[0].innerText.split(":")[1].trim();
    inputEmail.value = items[1].innerText.split(":")[1].trim();
    inputPassword.value = "";
    editModal.classList.remove("d-none");
  });

  // Cancel modal
  cancelModal.addEventListener("click", () => {
    editModal.classList.add("d-none");
  });

  // Submit edit form
  editForm.addEventListener("submit", async e => {
    e.preventDefault();
    const payload = {
      full_name: inputName.value.trim(),
      email:     inputEmail.value.trim(),
      password:  inputPassword.value.trim() || undefined
    };
    try {
      const res  = await fetch(`${API_BASE}/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw data;
      editModal.classList.add("d-none");
      loadUserInfo();
      alert("Cập nhật thành công!");
    } catch (err) {
      console.error("Update lỗi:", err);
      alert(err.detail || "Cập nhật thất bại");
    }
  });

  // Delete account
  deleteBtn.addEventListener("click", async () => {
    if (!confirm("Bạn chắc muốn xóa tài khoản?")) return;
    try {
      const res = await fetch(`${API_BASE}/${userId}`, { method: "DELETE" });
      if (!res.ok) throw await res.json();
      localStorage.clear();
      alert("Đã xóa tài khoản.");
      window.location.href = "../login";
    } catch (err) {
      console.error("Xóa lỗi:", err);
      alert(err.detail || "Xóa thất bại");
    }
  });

  // Logout
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "../login";
  });

  // Back to chat
  backBtn.addEventListener("click", () => {
    window.location.href = "chat";
  });
}

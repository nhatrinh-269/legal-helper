const user = JSON.parse(localStorage.getItem("user"));
const userId = user?.user_id;
const API_BASE = "http://localhost:8000/api/v1/user/info";

document.addEventListener('DOMContentLoaded', () => {
  if (!userId) {
    alert("Bạn chưa đăng nhập.");
    window.location.href = "../login.html";
    return;
  }

  fetch(`${API_BASE}/${userId}`)
    .then(res => {
      if (!res.ok) throw new Error("Không lấy được thông tin người dùng");
      return res.json();
    })
    .then(data => {
      document.querySelector('.info-list').innerHTML = `
        <li><strong>Tên:</strong> ${data.full_name}</li>
        <li><strong>Email:</strong> ${data.email}</li>
        <li><strong>Ngày đăng ký:</strong> ${new Date(data.registration_time).toLocaleDateString('vi-VN')}</li>
        <li><strong>Gói dịch vụ:</strong> ${data.package}</li>
        <li><strong>Ngày hết hạn:</strong> ${data.end_date ? new Date(data.end_date).toLocaleDateString('vi-VN') : '---'}</li>
        <li><strong>Số câu hỏi:</strong> ${data.question_usage.used}/${data.question_usage.limit}</li>
      `;
    })
    .catch(err => {
      console.error("Lỗi khi tải thông tin:", err);
      document.querySelector('.info-list').innerHTML = `
        <li style="color:red;">Không thể tải dữ liệu người dùng.</li>
      `;
    });
});

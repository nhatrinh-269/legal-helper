// login.js
document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  // 1️⃣ Xoá toàn bộ dữ liệu cũ trước khi login
  localStorage.clear();

  // 2️⃣ Lấy giá trị form
  const email = e.target.email.value.trim();
  const password = e.target.password.value;

  try {
    const res = await fetch("http://localhost:8000/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      alert("❌ Đăng nhập thất bại: " + (error.detail || error.message));
      return;
    }

    const data = await res.json();
    console.log("✅ Login success:", data);

    // 3️⃣ Lưu thông tin mới (user hoặc token)
    localStorage.setItem("user", JSON.stringify(data));

    // 4️⃣ Hiệu ứng rồi chuyển trang
    document.querySelector(".form-wrapper").classList.add("fade-out");
    setTimeout(() => {
      window.location.href = "user/chat";
    }, 500);

  } catch (err) {
    console.error("Lỗi kết nối server:", err);
    alert("Lỗi kết nối đến server. Vui lòng thử lại.");
  }
});

function oauthLogin(provider) {
  alert(`Chuyển sang đăng nhập với ${provider}`);
}

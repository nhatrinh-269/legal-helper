// login.js
document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

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

    // Lưu thông tin user (có thể là token sau này)
    localStorage.setItem("user", JSON.stringify(data));

    // Animation rời đi trước khi chuyển trang
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

// register.js
document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const full_name = e.target.full_name.value.trim();
  const email     = e.target.email.value.trim();
  const password  = e.target.password.value;

  try {
    const res = await fetch("http://localhost:8000/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ full_name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert("❌ Đăng ký thất bại: " + (data.detail || data.message));
      return;
    }

    alert("✅ " + data.message);
    window.location.href = "login";

  } catch (err) {
    console.error("Lỗi kết nối server:", err);
    alert("Lỗi kết nối đến server. Vui lòng thử lại.");
  }
});

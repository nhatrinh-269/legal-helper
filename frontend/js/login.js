document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  localStorage.clear();

  const email = e.target.email.value.trim();
  const password = e.target.password.value;

  try {
    const res = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      alert("❌ Đăng nhập thất bại: " + (error.detail || error.message));
      return;
    }

    const data = await res.json();
    console.log("✅ Login success:", data);
    localStorage.setItem("user", JSON.stringify(data));

    // Chuyển trang theo role
    document.querySelector(".form-wrapper").classList.add("fade-out");
    setTimeout(() => {
      if (data.role === "admin") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/user/chat";
      }
    }, 500);

  } catch (err) {
    console.error("Lỗi kết nối server:", err);
    alert("Lỗi kết nối đến server. Vui lòng thử lại.");
  }
});

function oauthLogin(provider) {
  alert(`Chuyển sang đăng nhập với ${provider}`);
}

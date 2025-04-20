document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();
  
    const full_name = e.target.full_name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
  
    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ full_name, email, password }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        alert("❌ " + (data.detail || "Đăng ký thất bại"));
        return;
      }
  
      alert("✅ " + data.message);
      window.location.href = "login";
    } catch (err) {
      console.error("Lỗi:", err);
      alert("Lỗi kết nối server");
    }
  });
  
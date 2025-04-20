document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
  
    const email = e.target.email.value;
    const password = e.target.password.value;
  
    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ email, password }),
      });
  
      if (!res.ok) {
        const error = await res.json();
        alert("❌ " + error.detail || "Đăng nhập thất bại");
        return;
      }
  
      const data = await res.json();
      console.log("✅ Login success:", data);
      // Lưu user vào localStorage (nếu cần)
      localStorage.setItem("user", JSON.stringify(data));
  
      // Animation rời đi
      document.querySelector(".form-wrapper").classList.add("fade-out");
      setTimeout(() => {
        window.location.href = "user/chat.html";
      }, 500);
    } catch (err) {
      alert("Lỗi kết nối server");
      console.error(err);
    }
  });
  
  function oauthLogin(provider) {
    alert(`Chuyển sang đăng nhập với ${provider}`);
  }
  
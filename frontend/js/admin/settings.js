// frontend/js/admin/settings.js

document.addEventListener("DOMContentLoaded", () => {
    const API_BASE       = "/api/v1/admin/settings";
    const geminiInput    = document.getElementById("geminiApiKey");
    const quotaInput     = document.getElementById("quotaWarning");
    const emailInput     = document.getElementById("systemEmail");
    const passwordInput  = document.getElementById("adminPassword");
    const form           = document.getElementById("settingsForm");
  
    // 1️⃣ Load hiện tại
    fetch(API_BASE)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        geminiInput.value = data.gemini_api_key || "";
        quotaInput.value  = data.quota_warning_threshold;
        emailInput.value  = data.system_email || "";
      })
      .catch(err => {
        console.error("Load settings failed:", err);
        alert("Không thể tải cài đặt.");
      });
  
    // 2️⃣ Submit form
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const payload = {
        gemini_api_key: geminiInput.value.trim() || undefined,
        quota_warning_threshold: parseInt(quotaInput.value, 10) || undefined,
        system_email: emailInput.value.trim() || undefined
      };
      if (passwordInput.value) {
        payload.admin_password = passwordInput.value;
      }
  
      try {
        const res = await fetch(API_BASE, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || res.status);
        }
        alert("Lưu cài đặt thành công!");
        passwordInput.value = "";
      } catch (err) {
        console.error("Update settings failed:", err);
        alert("Lưu cài đặt thất bại: " + err.message);
      }
    });
  });
  
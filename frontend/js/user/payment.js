// Lấy thông tin user từ localStorage
function getCurrentUser() {
    const raw = localStorage.getItem("user");
    if (!raw) {
      // Chuyển về đúng file login.html
      window.location.href = "login.html";
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch {
      localStorage.removeItem("user");
      window.location.href = "login.html";
      return null;
    }
  }
  
  // Lấy package_id từ query string
  function getPackageId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("package_id");
  }
  
  // Hiển thị lỗi
  function showError(msg) {
    const container = document.getElementById("paymentInfo");
    container.innerHTML = `<p class="error">${msg}</p>`;
  }
  
  // Load chi tiết gói
  async function loadPaymentInfo() {
    const user = getCurrentUser();
    if (!user) return;
  
    const pkgId = getPackageId();
    if (!pkgId) {
      return showError("Không tìm thấy gói dịch vụ.");
    }
  
    try {
      const res = await fetch(`/api/v1/user/payment/package?package_id=${pkgId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const pkg = await res.json();
  
      const container = document.getElementById("paymentInfo");
      container.innerHTML = `
        <div class="payment-info">
          <h3 class="package-title">Gói dịch vụ: ${pkg.package_name}</h3>
          <ul>
            ${pkg.description.map(line => `<li>✔ ${line}</li>`).join("")}
          </ul>
          <p class="price">${pkg.price === 0 ? "0đ" : pkg.price.toLocaleString("vi-VN") + "đ/tháng"}</p>
        </div>
        <div class="payment-method">
          <h3>Chọn phương thức thanh toán</h3>
          <div class="payment-options">
            ${pkg.methods.map(m => `
              <label class="payment-option">
                <input type="radio" name="method" value="${m}" ${m==="momo"?"checked":""}/>
                <img src="/assets/${m.charAt(0).toUpperCase()+m.slice(1)}.${m==="stripe"?"jpeg":m==="vnpay"?"webp":"png"}" alt="${m}" />
                <span>${m.toUpperCase()}</span>
              </label>
            `).join("")}
          </div>
        </div>
      `;
    } catch (err) {
      showError("⚠ Không thể tải thông tin thanh toán.");
      console.error(err);
    }
  }
  
  // Gửi yêu cầu thanh toán
  async function submitPayment() {
    const user = getCurrentUser();
    if (!user) return;
  
    const pkgId = getPackageId();
    const method = document.querySelector('input[name="method"]:checked')?.value;
    if (!pkgId || !method) return;
  
    // Chuẩn bị payload khớp schema PaymentRequest
    const payload = {
      user_id:    user.user_id,
      package_id: Number(pkgId),
      method
    };
    console.log(">>> Payment payload:", payload);
  
    try {
      const res = await fetch(`/api/v1/user/payment/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message);
  
      alert(data.message);
      // Chuyển về chat.html sau khi thành công
      window.location.href = "chat";
    } catch (err) {
      alert("Thanh toán không thành công: " + err.message);
      console.error(err);
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    loadPaymentInfo();
    document.getElementById("payBtn").addEventListener("click", submitPayment);
  });
  
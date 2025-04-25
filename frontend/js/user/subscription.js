async function fetchPlans() {
    const container = document.getElementById("plansContainer");
    container.innerHTML = "";
  
    try {
      const res = await fetch(`/api/v1/user/subscription/plans`);
  
      if (!res.ok) {
        throw new Error(`Lỗi HTTP ${res.status}: ${res.statusText}`);
      }
  
      const data = await res.json();
  
      if (!Array.isArray(data)) {
        throw new Error("Dữ liệu không hợp lệ");
      }
  
      data.forEach(plan => {
        const card = document.createElement("div");
        card.className = "plan-card pop-in" + (plan.is_highlight ? " highlight" : "");
  
        card.innerHTML = `
        <h3>${plan.package_name}</h3>
        <ul>
          ${plan.features.map(f => `<li>✔ ${f}</li>`).join("")}
        </ul>
        <p class="price">${plan.price === 0 ? "0đ" : plan.price.toLocaleString("vi-VN") + "đ/tháng"}</p>
        ${["free", "enterprise"].includes(plan.package_name.toLowerCase()) 
          ? "" 
          : `<button onclick="goToPayment(${plan.package_id})" class="btn btn-primary">Chọn gói</button>`}        
      `;      
  
        container.appendChild(card);
      });
  
    } catch (err) {
      container.innerHTML = `<p class="error">⚠ Không thể tải danh sách gói dịch vụ.</p>`;
      console.error("Fetch error:", err);
    }
  }
  
  function goToPayment(packageId) {
    window.location.href = `payment?package_id=${packageId}`;
  }
  
  fetchPlans();
  
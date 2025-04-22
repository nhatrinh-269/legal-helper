document.addEventListener("DOMContentLoaded", () => {
    fetchOverview();
    fetchCharts();
    fetchLatest();
  });
  
  function fetchOverview() {
    fetch("/api/v1/admin/dashboard/overview")
      .then(res => res.json())
      .then(data => {
        document.getElementById("totalUsers").textContent = data.total_users;
        document.getElementById("totalFeedbacks").textContent = data.total_feedbacks;
        document.getElementById("totalQuestions").textContent = data.total_questions_today;
        document.getElementById("monthlyRevenue").textContent = data.monthly_revenue.toLocaleString() + "đ";
      });
  }
  
  function fetchCharts() {
    fetch("/api/v1/admin/dashboard/charts")
      .then(res => res.json())
      .then(data => {
        renderLineChart("questionsChart", data.questions_per_day.map(q => q.date), data.questions_per_day.map(q => q.count));
        renderBarChart("revenueChart", data.revenue_per_month.map(r => r.month), data.revenue_per_month.map(r => r.revenue));
        renderPieChart("packageChart", data.package_distribution.map(p => p.name), data.package_distribution.map(p => p.count));
      });
  }
  
  function fetchLatest() {
    fetch("/api/v1/admin/dashboard/latest")
      .then(res => res.json())
      .then(data => {
        fillTable("feedbackTable", data.feedbacks, ["user", "content", "time"]);
        fillTable("paymentTable", data.payments, ["user", "amount", "method", "time"]);
        fillTable("topQuotaTable", data.top_quota, ["user", "questions", "date"]);
        fillTable("newUsersTable", data.new_users, ["name", "email", "time"]);
      });
  }
  
  function fillTable(id, rows, keys) {
    const tbody = document.getElementById(id).querySelector("tbody");
    tbody.innerHTML = "";
    rows.forEach(row => {
      const tr = document.createElement("tr");
      keys.forEach(key => {
        const td = document.createElement("td");
        td.textContent = row[key];
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }
  
  function renderLineChart(canvasId, labels, data) {
    const ctx = document.getElementById(canvasId).getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          label: "Số câu hỏi",
          data: data,
          borderColor: "#6c63ff",
          tension: 0.3
        }]
      },
      options: {
        responsive: true
      }
    });
  }
  
  function renderBarChart(canvasId, labels, data) {
    const ctx = document.getElementById(canvasId).getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Doanh thu",
          data: data,
          backgroundColor: "#6c63ff"
        }]
      },
      options: {
        responsive: true
      }
    });
  }
  
  function renderPieChart(canvasId, labels, data) {
    const ctx = document.getElementById(canvasId).getContext("2d");
    new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ["#6c63ff", "#f39c12", "#27ae60", "#e74c3c"]
        }]
      },
      options: {
        responsive: true
      }
    });
  }
  
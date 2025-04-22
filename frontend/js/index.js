// Cho phép Enter để chuyển sang login
document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      window.location.href = "login";
    }
  });
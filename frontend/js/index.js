// frontend/js/index.js

document.addEventListener("DOMContentLoaded", () => {
  // === Scroll Spy: highlight active nav link ===
  const sections = document.querySelectorAll("section[id]");
  const desktopNavLinks = document.querySelectorAll(".nav a");
  const mobileNavLinks  = document.querySelectorAll(".mobile-sidebar nav a");

  function activateNavLink() {
    const scrollY = window.pageYOffset;

    sections.forEach((section) => {
      const sectionTop    = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      const sectionId     = section.getAttribute("id");

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        desktopNavLinks.forEach(link => {
          link.classList.toggle("active", link.getAttribute("href") === `#${sectionId}`);
        });
        mobileNavLinks.forEach(link => {
          link.classList.toggle("active", link.getAttribute("href") === `#${sectionId}`);
        });
      }
    });
  }

  window.addEventListener("scroll", activateNavLink);
  activateNavLink(); // chạy lần đầu

  // === Mobile sidebar toggle ===
  const hamburgerBtn   = document.getElementById("hamburgerBtn");
  const mobileSidebar  = document.getElementById("mobileSidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");

  // Mở/đóng khi bấm hamburger
  hamburgerBtn.addEventListener("click", () => {
    mobileSidebar.classList.toggle("open");
    sidebarOverlay.classList.toggle("open");
  });

  // Đóng khi bấm overlay hoặc chọn link
  sidebarOverlay.addEventListener("click", () => {
    mobileSidebar.classList.remove("open");
    sidebarOverlay.classList.remove("open");
  });
  mobileNavLinks.forEach(link => {
    link.addEventListener("click", () => {
      mobileSidebar.classList.remove("open");
      sidebarOverlay.classList.remove("open");
    });
  });
});

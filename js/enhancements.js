document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("darkModeToggle");
  if (toggleBtn) {
    toggleBtn.onclick = () => {
      document.body.classList.toggle("dark-mode");
      localStorage.setItem("darkMode", document.body.classList.contains("dark-mode") ? "on" : "off");
    };
  }

  if (localStorage.getItem("darkMode") === "on") {
    document.body.classList.add("dark-mode");
  }

  const topBtn = document.createElement("div");
  topBtn.innerHTML = "↑";
  topBtn.className = "scroll-top";
  topBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  document.body.appendChild(topBtn);

  window.addEventListener("scroll", () => {
    topBtn.style.display = window.scrollY > 300 ? "block" : "none";
  });

  document.querySelectorAll("a[href^='http']").forEach(link => {
    if (!link.href.includes(location.hostname)) {
      link.target = "_blank";
      link.rel = "noopener";
    }
  });
});

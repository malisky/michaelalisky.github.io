
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.createElement("button");
  btn.textContent = "Toggle Dark Mode";
  btn.className = "toggle-darkmode";
  btn.onclick = () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode") ? "on" : "off");
  };
  document.body.appendChild(btn);

  // Apply dark mode if stored
  if (localStorage.getItem("darkMode") === "on") {
    document.body.classList.add("dark-mode");
  }

  // Scroll-to-top button
  const topBtn = document.createElement("div");
  topBtn.innerHTML = "↑";
  topBtn.className = "scroll-top";
  topBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  document.body.appendChild(topBtn);

  window.addEventListener("scroll", () => {
    topBtn.style.display = window.scrollY > 300 ? "block" : "none";
  });

  // External links: open in new tab, no icon
  document.querySelectorAll("a[href^='http']").forEach(link => {
    if (!link.href.includes(location.hostname)) {
      link.target = "_blank";
      link.rel = "noopener";
    }
  });
});

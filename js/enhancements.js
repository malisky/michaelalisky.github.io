// enhancements.js

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("night-toggle");
  const transitionOverlay = document.querySelector(".theme-transition");

  if (toggle && transitionOverlay) {
    toggle.addEventListener("click", () => {
      document.body.classList.add("animating-theme");
      transitionOverlay.style.opacity = "1";

      setTimeout(() => {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem(
          "darkMode",
          document.body.classList.contains("dark-mode")
        );
        transitionOverlay.style.opacity = "0";

        setTimeout(() => {
          document.body.classList.remove("animating-theme");
        }, 700); // match CSS transition
      }, 50);
    });

    if (localStorage.getItem("darkMode") === "true") {
      document.body.classList.add("dark-mode");
    }
  }

  // Optional: Scroll to top button behavior
  const topBtn = document.querySelector(".scroll-top");
  if (topBtn) {
    window.addEventListener("scroll", () => {
      topBtn.style.display = window.scrollY > 300 ? "block" : "none";
    });
    topBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});

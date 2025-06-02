// Simplified yet enhanced version of enhancements.js
document.addEventListener("DOMContentLoaded", () => {
  // Theme toggle functionality
  const toggle = document.getElementById("night-toggle");
  const transitionOverlay = document.querySelector(".theme-transition");
  
  if (toggle && transitionOverlay) {
    // Handle dark mode toggle (without delay and animation checks)
    toggle.addEventListener("click", () => {
      // Just toggle the class immediately
      document.body.classList.toggle("dark-mode");
      
      // Save preference
      localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
    });
    
    // Apply theme from storage
    if (localStorage.getItem("darkMode") === "true") {
      document.body.classList.add("dark-mode");
    }
    
    // Simple system preference check
    if (localStorage.getItem("darkMode") === null && 
        window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.body.classList.add("dark-mode");
    }
  }
  
  // Scroll to top button
  const topBtn = document.querySelector(".scroll-top");
  if (topBtn) {
    // Show/hide based on scroll position
    window.addEventListener("scroll", () => {
      topBtn.style.display = window.scrollY > 300 ? "block" : "none";
    }, { passive: true });
    
    // Scroll to top on click
    topBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
  
  // Basic sticky navigation
  const nav = document.querySelector("nav");
  if (nav) {
    const navTop = nav.offsetTop;
    
    window.addEventListener("scroll", () => {
      if (window.scrollY > navTop) {
        nav.classList.add("sticky");
      } else {
        nav.classList.remove("sticky");
      }
    }, { passive: true });
  }
});

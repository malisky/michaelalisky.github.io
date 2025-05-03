document.addEventListener('DOMContentLoaded', function() {
  const overlays = document.querySelectorAll('.static-overlay');

  overlays.forEach(overlay => {
    setInterval(() => {
      const randomOpacity = 0.1 + Math.random() * 0.2;
      overlay.style.opacity = randomOpacity;

      if (Math.random() > 0.95) {
        overlay.style.opacity = 0.5;
        setTimeout(() => {
          overlay.style.opacity = randomOpacity;
        }, 50);
      }
    }, 100);
  });
});

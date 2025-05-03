
document.addEventListener("DOMContentLoaded", function () {
  const newsletterToCoords = {"taiwan.html": [23.6978, 120.9605], "mongolia.html": [47.8864, 106.9057], "spain.html": [40.4168, -3.7038], "georgia.html": [41.7151, 44.8271], "slovenia.html": [46.1512, 14.9955], "turkey.html": [39.9208, 32.8541], "november.html": [48.2082, 16.3738]};

  fetch("/newsletter/newsletters.json")
    .then(res => res.json())
    .then(data => {
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      const container = document.getElementById("newsletter-container");
      const mapFrame = document.getElementById("map-frame");

      data.forEach(entry => {
        const slug = entry.link.replace(/^.*\//, "");
        const coords = newsletterToCoords[slug] || [30, 10];

        const card = document.createElement("div");
        card.classList.add("newsletter-entry");
        card.setAttribute("data-slug", slug);
        card.setAttribute("data-coords", JSON.stringify(coords));
        card.innerHTML = `
          <img src="${entry.image}" alt="${entry.title}" />
          <h3>${entry.title}</h3>
          <p class="date">${entry.date || ''}</p>
        `;

        card.addEventListener("click", (e) => {
          e.preventDefault();

          // Map interaction via postMessage
          if (mapFrame && mapFrame.contentWindow) {
            mapFrame.contentWindow.postMessage({ slug: slug, coords: coords }, "*");
          }

          // Blur effect and delay
          document.body.classList.add("blurred");
          setTimeout(() => {
            window.location.href = `/newsletter/${slug}`;
          }, 1000);
        });

        container.appendChild(card);
      });

      // Looping scroll
      container.innerHTML += container.innerHTML;
      let scrollSpeed = 1.5;
      function loopScroll() {
        container.scrollLeft += scrollSpeed;
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
        requestAnimationFrame(loopScroll);
      }
      loopScroll();

      // Manual scroll with arrows
      document.getElementById("arrow-left").onclick = () => {
        container.scrollBy({ left: -400, behavior: "smooth" });
      };
      document.getElementById("arrow-right").onclick = () => {
        container.scrollBy({ left: 400, behavior: "smooth" });
      };
    });
});

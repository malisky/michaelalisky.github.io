
document.addEventListener("DOMContentLoaded", function () {
  fetch("/newsletter/newsletters.json")
    .then(res => res.json())
    .then(data => {
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      const container = document.getElementById("newsletter-container");
      const mapFrame = document.getElementById("map-frame");

      data.forEach(entry => {
        const slug = entry.link.replace(/^.*\//, "");
        const card = document.createElement("div");
        card.classList.add("newsletter-entry");
        card.setAttribute("data-slug", slug);
        card.innerHTML = `
          <a href="/newsletter/${slug}" style="text-decoration: none; color: inherit;">
            <img src="${entry.image}" alt="${entry.title}" />
            <h3>${entry.title}</h3>
            <p class="date">${entry.date || ""}</p>
          </a>
        `;
        container.appendChild(card);
      });

      // Looping scroll effect (duplicated content)
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
    });

  // Hover scroll zone behavior removed for auto-looping simplicity
});

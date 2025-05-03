
document.addEventListener("DOMContentLoaded", function () {
  fetch("/newsletter/newsletters.json")
    .then((res) => res.json())
    .then((data) => {
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      const container = document.getElementById("newsletter-container");
      data.forEach((entry) => {
        const card = document.createElement("div");
        card.classList.add("newsletter-entry");
        card.innerHTML = `
          <img src="${entry.image}" alt="${entry.title}" />
          <h2>${entry.title}</h2>
          <p>${entry.description}</p>
          <a href="${entry.link}">Read more →</a>
        `;
        container.appendChild(card);
      });
    });

  const container = document.getElementById("newsletter-container");
  let scrollDirection = 0;
  let animationFrame;

  function smoothScroll() {
    if (scrollDirection !== 0) {
      container.scrollLeft += scrollDirection;
      animationFrame = requestAnimationFrame(smoothScroll);
    }
  }

  function startScrolling(dir) {
    scrollDirection = dir;
    animationFrame = requestAnimationFrame(smoothScroll);
  }

  function stopScrolling() {
    scrollDirection = 0;
    cancelAnimationFrame(animationFrame);
  }

  document.querySelector(".scroll-zone.left").addEventListener("mouseenter", () => startScrolling(-2));
  document.querySelector(".scroll-zone.right").addEventListener("mouseenter", () => startScrolling(2));
  document.querySelectorAll(".scroll-zone").forEach((el) =>
    el.addEventListener("mouseleave", stopScrolling)
  );
});

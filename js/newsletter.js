
document.addEventListener("DOMContentLoaded", function() {
  fetch('/newsletter/newsletters.json')
    .then(res => res.json())
    .then(data => {
      // Sort data by date (from earliest to latest)
      data.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      const container = document.getElementById('newsletter-container');
      data.forEach(entry => {
        const card = document.createElement('div');
        card.classList.add('newsletter-entry');
        card.innerHTML = `
          <img src="${entry.image}" alt="${entry.title}" class="newsletter-image"/>
          <h3>${entry.title}</h3>
          <p>${entry.date}</p>
        `;
        container.appendChild(card);
      });

      // Loop effect by cloning the first card and appending it to the end
      const firstCard = container.firstElementChild.cloneNode(true);
      container.appendChild(firstCard);

      // Continuous scroll logic
      let scrollSpeed = 1;
      const scrollAmount = 2;
      const scrollLeft = document.querySelector('.scroll-arrow.left');
      const scrollRight = document.querySelector('.scroll-arrow.right');

      function continuousScroll() {
        container.scrollLeft += scrollSpeed;
        // Looping effect when reaching the end
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
          container.scrollLeft = 0; // Jump back to the first entry
        }
        if (container.scrollLeft <= 0) {
          container.scrollLeft = container.scrollWidth - container.clientWidth; // Jump to the last entry
        }
      }

      // Automatically scroll when hovering over left or right side
      document.querySelector('.newsletter-scroll-wrapper').addEventListener('mousemove', (event) => {
        const containerWidth = container.clientWidth;
        const mouseX = event.pageX;

        if (mouseX < 150) {
          scrollSpeed = -scrollAmount; // Scroll left
        } else if (mouseX > containerWidth - 150) {
          scrollSpeed = scrollAmount; // Scroll right
        } else {
          scrollSpeed = 0; // Stop scrolling when not near edges
        }
      });

      // Trigger continuous scroll
      setInterval(continuousScroll, 10);
    });
  
  // Map section hover effect to scroll down
  const mapSection = document.getElementById('map-section');
  document.body.addEventListener('mousemove', (event) => {
    if (event.clientY > window.innerHeight - 50) {
      mapSection.classList.add('expanded');
    } else {
      mapSection.classList.remove('expanded');
    }
  });
});

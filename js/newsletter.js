
document.addEventListener("DOMContentLoaded", function() {
  fetch('/newsletter/newsletters.json')
    .then(res => res.json())
    .then(data => {
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
    });

  // Hover effect to show the map drawer
  const mapDrawer = document.querySelector('.map-drawer-preview');
  document.body.addEventListener('mousemove', (event) => {
    if (event.clientY > window.innerHeight - 50) {
      mapDrawer.style.height = '400px';
    } else {
      mapDrawer.style.height = '80px';
    }
  });

  // Horizontal scroll functionality with arrows
  const container = document.getElementById('newsletter-container');
  const scrollLeft = document.querySelector('.scroll-arrow.left');
  const scrollRight = document.querySelector('.scroll-arrow.right');

  scrollLeft.addEventListener('click', () => {
    container.scrollBy({ left: -400, behavior: 'smooth' });
  });
  scrollRight.addEventListener('click', () => {
    container.scrollBy({ left: 400, behavior: 'smooth' });
  });
});

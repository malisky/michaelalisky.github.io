fetch('/newsletter/newsletters.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('newsletter-container');
    data.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'newsletter-entry';
      card.innerHTML = `
        <a href="${entry.link}">
          <img src="${entry.image}" alt="${entry.title}">
          <h2>${entry.title}</h2>
          <p>${new Date(entry.date).toDateString()}</p>
        </a>
      `;
      container.appendChild(card);
    });
  });


function scrollLeft() {
  const container = document.getElementById('newsletter-container');
  container.scrollBy({ left: -400, behavior: 'smooth' });
}

function scrollRight() {
  const container = document.getElementById('newsletter-container');
  container.scrollBy({ left: 400, behavior: 'smooth' });
}

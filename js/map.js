const map = L.map('map').setView([30, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

fetch('/newsletter/newsletters.json')
  .then(res => res.json())
  .then(data => {
    data.forEach(entry => {
      if (entry.location) {
        const popup = `
          <a href="${entry.link}">
            <img src="${entry.image}" alt="${entry.title}" /><br>
            <strong>${entry.title}</strong>
          </a>`;
        L.marker([entry.location.lat, entry.location.lng]).addTo(map).bindPopup(popup);
      }
    });
  });

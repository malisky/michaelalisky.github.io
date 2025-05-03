
const map = L.map('map').setView([30, 0], 2); // Center globally

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Custom green pin
const greenPinIcon = L.icon({
  iconUrl: '/images/green-pin.svg',
  iconSize: [32, 40],
  iconAnchor: [16, 40],  // The tail of the pin should point directly to the location
  popupAnchor: [0, -36]
});

fetch('/newsletter/newsletters.json')
  .then(res => res.json())
  .then(data => {
    data.forEach(entry => {
      if (entry.location) {
        const popup = `
          <div style="text-align:center; max-width:140px;">
            <a href="${entry.link}" style="text-decoration:none;">
              <img src="${entry.image}" alt="${entry.title}" style="width:100%; border-radius:8px; margin-bottom:0.5rem;">
              <div style="font-weight:bold; font-size:0.95rem; color:#2e5d7c;">${entry.title}</div>
            </a>
          </div>`;
        L.marker([entry.location.lat, entry.location.lng], { icon: greenPinIcon })
          .addTo(map)
          .bindPopup(popup);
      }
    });
  });

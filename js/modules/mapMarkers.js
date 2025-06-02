// Global array to store all markers
let allMarkers = [];

// Initialize markers on the map
function initMapMarkers(map) {
  const markerIcon = L.divIcon({
    className: 'custom-marker-icon',
    html: '<div class="marker-dot"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });

  fetch("/newsletter/newsletters.json")
    .then(res => res.json())
    .then(data => {
      data.forEach(entry => {
        if (!entry.location || typeof entry.location.lat !== 'number' || typeof entry.location.lng !== 'number') {
          console.warn("Invalid marker data:", entry);
          return;
        }

        const marker = L.marker([entry.location.lat, entry.location.lng], {
          icon: markerIcon
        }).addTo(map);

        const popupContent = `
          <a href="${entry.link}" class="marker-popup-card" target="_blank">
            <img src="${entry.image}" alt="${entry.title}" />
            <div class="text">
              <h3>${entry.title}</h3>
              <p>${new Date(entry.date).toDateString()}</p>
              <p>${entry.location_name}</p>
            </div>
          </a>
        `;

        marker.bindPopup(popupContent, {
          closeButton: false,
          className: 'marker-popup'
        });

        marker.on("mouseover", function () {
          this.openPopup();
        });

        marker.on("mouseout", function () {
          this.closePopup();
        });

        allMarkers.push(marker);
      });

      fitAllMarkers(map);
    })
    .catch(err => {
      console.error("Failed to load newsletter markers:", err);
    });

  window.fitAllMarkers = function(map) {
    if (allMarkers.length > 0) {
      const bounds = L.featureGroup(allMarkers).getBounds();
      map.flyToBounds(bounds, {
        padding: [50, 50],
        duration: 1.5
      });
    }
  };
}

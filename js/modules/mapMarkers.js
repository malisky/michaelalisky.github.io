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

  const spiderfier = initSpiderfier(map);

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

        // Extract country group from location name
        if (entry.location_name) {
          const parts = entry.location_name.split(",");
          marker.countryGroup = parts[parts.length - 1]?.trim();
        }

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
          className: 'marker-popup',
          autoPan: false
        });

        // Show popup on hover and close after delay
        marker.on("mouseover", function () {
          this.openPopup();
          this._hoverTimer = setTimeout(() => this.closePopup(), 2000);
        });

        marker.on("mouseout", function () {
          clearTimeout(this._hoverTimer);
        });

        // Make the whole marker clickable
        marker.on("click", () => {
          window.open(entry.link, "_blank");
        });

        // Add to spiderfier and tracking array
        spiderfier.addMarker(marker);
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

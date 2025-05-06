/**
 * Map marker creation from newsletters.json using simple circle markers
 */
let markers = [];
let markerBounds = null;

function initMapMarkers(map) {
  markerBounds = L.latLngBounds();

  fetch('/newsletter/newsletters.json')
    .then(response => response.json())
    .then(data => {
      data.forEach(item => {
        if (!item.location || !item.link) return;

        const coords = [item.location.lat, item.location.lng];

        const marker = L.circleMarker(coords, {
          radius: 6,
          color: "#2ecc71", // green stroke
          fillColor: "#2ecc71",
          fillOpacity: 0.9,
          weight: 2
        });

        const popupContent = `
          <div class="popup-content">
            <strong>${item.title}</strong><br/>
            <span>${item.location_name}</span>
          </div>
        `;
        marker.bindPopup(popupContent);
        marker.on('click', () => window.location.href = item.link);

        marker.addTo(map);
        markers.push(marker);
        markerBounds.extend(coords);
      });

      if (markerBounds.isValid()) {
        map.fitBounds(markerBounds, {
          padding: [50, 50],
          maxZoom: 7
        });
      }
    })
    .catch(err => console.error("Error loading newsletters.json:", err));
}

// Allow external access for "Fit All" button
window.fitAllMarkers = function () {
  if (markerBounds && markerBounds.isValid() && window.leafletMap) {
    window.leafletMap.fitBounds(markerBounds, {
      padding: [50, 50],
      maxZoom: 7
    });
  }
};

/**
 * Dynamic map markers using newsletters.json + Spiderfier + hover effects
 */
let markers = [];
let markerBounds = null;

function initMapMarkers(map) {
  markerBounds = L.latLngBounds();

  // Initialize the spiderfier
  const spiderfier = initSpiderfier(map);

  fetch('/newsletter/newsletters.json')
    .then(response => response.json())
    .then(data => {
      data.forEach(item => {
        if (!item.location || !item.link) return;

        const coords = [item.location.lat, item.location.lng];

        const marker = L.circleMarker(coords, {
          radius: 6,
          color: "#3aa16c",         // Soft green border
          fillColor: "#3aa16c",     // Soft green fill
          fillOpacity: 0.85,
          weight: 2
        });

        // Tooltip with title + date
        marker.bindTooltip(`${item.title} (${item.date})`, {
          permanent: false,
          direction: "top",
          offset: [0, -8],
          className: "marker-tooltip"
        });

        // Popup remains for accessibility
        const popupContent = `
          <div class="popup-content">
            <strong>${item.title}</strong><br/>
            <span>${item.location_name}</span>
          </div>
        `;
        marker.bindPopup(popupContent);

        // Click navigates to the newsletter
        marker.on('click', () => window.location.href = item.link);

        // Hover effect: grow and glow
        marker.on("mouseover", function () {
          this.setStyle({
            radius: 8,
            color: "#a8e6cf", // lighter ring
            weight: 3
          });
        });
        marker.on("mouseout", function () {
          this.setStyle({
            radius: 6,
            color: "#3aa16c",
            weight: 2
          });
        });

        marker.addTo(map);
        spiderfier.addMarker(marker); // Spiderfier support

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

window.fitAllMarkers = function () {
  if (markerBounds && markerBounds.isValid() && window.leafletMap) {
    window.leafletMap.fitBounds(markerBounds, {
      padding: [50, 50],
      maxZoom: 7
    });
  }
};

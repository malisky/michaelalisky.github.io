// Global array to store all markers.
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
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log('Newsletter data loaded:', data);
      
      data.forEach(entry => {
        if (
          !entry.location ||
          typeof entry.location.lat !== "number" ||
          typeof entry.location.lng !== "number"
        ) {
          console.warn("Invalid marker data:", entry);
          return;
        }

        const marker = L.marker([entry.location.lat, entry.location.lng], {
          icon: markerIcon,
          link: entry.link, // Store link for spiderfier
          title: entry.title // Store title for tooltips
        }).addTo(map);

        // Store marker data for easier access
        marker._markerData = {
          title: entry.title,
          date: entry.date,
          location: entry.location_name,
          image: entry.image,
          link: entry.link
        };

        // Extract country group from location name
        if (entry.location_name) {
          const parts = entry.location_name.split(",");
          marker.countryGroup = parts[parts.length - 1]?.trim();
        }

        // Create popup content using proper template literals
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
          className: "marker-popup",
          autoPan: false
        });

        // Show popup on hover and close after delay
        let hoverTimer;
        marker.on("mouseover", function (e) {
          // Add hover effect to marker
          const markerElement = this.getElement();
          if (markerElement) {
            markerElement.classList.add('marker-hover');
          }
          
          this.openPopup();
          
          // Clear any existing timer
          clearTimeout(hoverTimer);
          
          // Set timer to close popup after 2 seconds
          hoverTimer = setTimeout(() => {
            this.closePopup();
            if (markerElement) {
              markerElement.classList.remove('marker-hover');
            }
          }, 2000);
        });

        marker.on("mouseout", function (e) {
          // Remove hover effect immediately
          const markerElement = this.getElement();
          if (markerElement) {
            markerElement.classList.remove('marker-hover');
          }
          // Note: Don't clear the timer here - let the popup fade naturally
        });

        // Add to spiderfier first, then add click handler
        spiderfier.addMarker(marker);
        allMarkers.push(marker);
      });

      fitAllMarkers(map);
    })
    .catch(err => {
      console.error("Failed to load newsletter markers:", err);
    });

  // Global function to fit all markers
  window.fitAllMarkers = function (map) {
    if (allMarkers.length > 0) {
      const bounds = L.featureGroup(allMarkers).getBounds();
      map.flyToBounds(bounds, {
        padding: [50, 50],
        duration: 1.5
      });
    }
  };
}

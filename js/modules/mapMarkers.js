/**
 * Map marker creation and management (simplified version)
 * Uses standard Leaflet markers for guaranteed visibility
 */

// Initialize markers and bounds
let markers = [];
let markerBounds = null;

/**
 * Create a marker for a newsletter location
 */
function createMarker(map, spiderfier, location) {
  // Use standard Leaflet marker (guaranteed to be visible)
  const marker = L.marker(location.coords, {
    title: location.title,
    group: location.country || 'default',
    riseOnHover: true
  });

  // Add popup if content is provided
  if (location.popup) {
    marker.bindPopup(location.popup, {
      maxWidth: 300,
      className: 'newsletter-popup'
    });
  }

  // If URL is provided, add click handler
  if (location.url) {
    marker.on('click', function() {
      window.location.href = location.url;
    });
  }

  // Add marker to the map and spiderfier
  marker.addTo(map);
  
  if (spiderfier) {
    spiderfier.addMarker(marker);
  }
  
  return marker;
}

/**
 * Load newsletter locations from the data file and create markers
 */
function loadNewsletterMarkers(map, spiderfier) {
  // For testing: create a hardcoded marker for Kazakhstan
  const kazMarker = createMarker(map, spiderfier, {
    coords: [43.2551, 76.9126], // Coordinates for Almaty
    title: "Almaty, Kazakhstan",
    country: "Kazakhstan",
    url: "/newsletter/kazakhstan.html"
  });
  markers.push(kazMarker);
  
  // Create more test markers for Kazakhstan to demonstrate spiderfier
  const locations = [
    {
      coords: [43.3, 77.0], // Slightly offset
      title: "Lake Kaindy",
      country: "Kazakhstan",
      url: "#"
    },
    {
      coords: [43.25, 77.1], // Slightly offset
      title: "Charyn Canyon",
      country: "Kazakhstan",
      url: "#"
    },
    {
      coords: [43.2, 76.9], // Slightly offset
      title: "Almaty Cathedral",
      country: "Kazakhstan",
      url: "#"
    }
  ];
  
  // Create test markers
  locations.forEach(location => {
    const marker = createMarker(map, spiderfier, location);
    markers.push(marker);
  });
  
  // Create bounds from all markers
  markerBounds = L.latLngBounds();
  markers.forEach(marker => {
    markerBounds.extend(marker.getLatLng());
  });
  
  // Fit the map to show all markers
  window.fitAllMarkers();
}

/**
 * Fit the map to show all markers
 */
window.fitAllMarkers = function() {
  if (markerBounds && markerBounds.isValid() && window.leafletMap) {
    window.leafletMap.fitBounds(markerBounds, {
      padding: [50, 50],
      maxZoom: 7
    });
  }
};

/**
 * Initialize the newsletter map with markers
 */
function initNewsletterMap() {
  // Initialize the map
  const map = initMap();
  
  // Initialize the spiderfier
  const spiderfier = initSpiderfier(map);
  
  // Load markers
  loadNewsletterMarkers(map, spiderfier);
  
  // Return the initialized components
  return {
    map,
    spiderfier
  };
}

/**
 * Map marker creation and management (self-initializing version)
 * Uses standard Leaflet markers for guaranteed visibility
 */

// Initialize markers and bounds
let markers = [];
let markerBounds = null;

/**
 * Create a marker for a newsletter location
 */
function createMarker(map, spiderfier, location) {
  console.log("Creating marker for:", location.title);
  
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
  console.log("Marker added to map");
  
  if (spiderfier) {
    spiderfier.addMarker(marker);
    console.log("Marker added to spiderfier");
  }
  
  return marker;
}

/**
 * Load newsletter locations from the data file and create markers
 */
function loadNewsletterMarkers(map, spiderfier) {
  console.log("Loading markers");
  
  // Initialize bounds
  markerBounds = L.latLngBounds();
  
  // Add hardcoded test markers
  console.log("Adding test markers");
  const testLocations = [
    {
      coords: [43.2551, 76.9126], // Coordinates for Almaty
      title: "Almaty, Kazakhstan",
      country: "Kazakhstan",
      url: "/newsletter/kz-test.html"
    },
    {
      coords: [43.3, 77.0], // Slightly offset
      title: "Lake Kaindy",
      country: "Kazakhstan",
      url: "/newsletter/kz-lake.html"
    },
    {
      coords: [47.9186, 106.9177], // Mongolia/UB
      title: "Ulaanbaatar, Mongolia",
      country: "Mongolia",
      url: "/newsletter/march-27-mongolia-adventures.html"
    }
  ];
  
  // Create test markers
  testLocations.forEach(location => {
    const marker = createMarker(map, spiderfier, location);
    markers.push(marker);
    markerBounds.extend(location.coords);
  });
  
  console.log("Test markers added, fitting map");
  
  // Fit the map to show all markers
  if (markerBounds.isValid()) {
    map.fitBounds(markerBounds, {
      padding: [50, 50],
      maxZoom: 7
    });
    console.log("Map fitted to bounds");
  }
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
  console.log("Initializing newsletter map");
  
  // Initialize the map
  const map = initMap();
  console.log("Map initialized");
  
  // Initialize the spiderfier
  const spiderfier = initSpiderfier(map);
  console.log("Spiderfier initialized");
  
  // Load markers
  loadNewsletterMarkers(map, spiderfier);
  
  // Return the initialized components
  return {
    map,
    spiderfier
  };
}

// Self-initialization when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM loaded, initializing map");
  
  // Check if the map container exists
  const mapContainer = document.getElementById('newsletter-map');
  if (mapContainer) {
    console.log("Map container found");
    
    // Initialize the map
    const mapComponents = initNewsletterMap();
    
    // Store the map in the window object
    window.leafletMap = mapComponents.map;
    window.mapSpiderfier = mapComponents.spiderfier;
    
    console.log("Map initialization complete");
  } else {
    console.error("Map container not found!");
  }
});

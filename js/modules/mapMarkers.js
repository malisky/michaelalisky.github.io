/**
 * Map marker creation and management
 * Handles creating markers and adding them to the map
 */

// Initialize markers and bounds
let markers = [];
let markerBounds = null;

/**
 * Create a marker for a newsletter location
 */
function createMarker(map, spiderfier, location) {
  // Create custom icon with appropriate size and anchor
  const icon = L.divIcon({
    className: 'newsletter-marker',
    html: `<div class="marker-pin" style="background-color: ${location.color || '#3388ff'}"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });

  // Create the marker with custom options
  const marker = L.marker(location.coords, {
    icon: icon,
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
    
    // Add cursor style to indicate clickability
    marker.on('mouseover', function() {
      if (marker._icon) {
        marker._icon.style.cursor = 'pointer';
      }
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
  // Initialize an empty bounds object to later fit all markers
  markerBounds = L.latLngBounds();
  
  // Fetch the locations data
  fetch('/data/newsletter-locations.json')
    .then(response => response.json())
    .then(locations => {
      // Create a marker for each location
      locations.forEach(location => {
        const marker = createMarker(map, spiderfier, location);
        markers.push(marker);
        
        // Extend the bounds to include this marker
        markerBounds.extend(location.coords);
      });
      
      // Fit the map to show all markers with some padding
      window.fitAllMarkers();
    })
    .catch(error => {
      console.error('Error loading newsletter locations:', error);
    });
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

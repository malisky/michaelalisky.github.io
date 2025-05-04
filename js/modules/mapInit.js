/**
 * Map initialization and configuration
 * Sets up the Leaflet map with basic options and controls
 */

function initMap() {
  // Initialize the map centered on Europe/Asia region
  const map = L.map('newsletter-map', {
    zoomControl: false, // We'll add a custom zoom control
    scrollWheelZoom: true, // Enable scroll wheel zooming
    maxZoom: 18,
    minZoom: 2,  // Allow zooming out to see the whole world
    attributionControl: false,
    doubleClickZoom: true,
  }).setView([45, 60], 4);  // Centered between Europe and Asia with closer zoom level
  
  // Store map reference globally so we can access it for dark mode toggle
  window.leafletMap = map;
  
  // Add custom zoom control with better positioning
  L.control.zoom({
    position: 'topright',
    zoomInTitle: 'Zoom in - see more detail',
    zoomOutTitle: 'Zoom out - see more area'
  }).addTo(map);
  
  // Add a "fit all markers" button
  const fitAllButton = L.control({position: 'topright'});
  fitAllButton.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
    div.innerHTML = '<a class="fit-all-button" href="#" title="Fit all locations" role="button" aria-label="Fit all locations">📍</a>';
    div.onclick = function() {
      if (typeof window.fitAllMarkers === 'function') {
        window.fitAllMarkers();
      }
      return false;
    };
    return div;
  };
  fitAllButton.addTo(map);
  
  // Add custom styled tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }).addTo(map);
  
  // Add small attribution in bottom corner
  L.control.attribution({
    position: 'bottomright',
    prefix: false
  }).addTo(map);
  
  // Handle window resize
  window.addEventListener('resize', function() {
    map.invalidateSize();
  });
  
  return map;
}

fetch('/data/geoBoundaries-KAZ-ADM1.geojson')
  .then(response => response.json())
  .then(geojson => {
    const kzLayer = L.geoJSON(geojson, {
      style: {
        color: '#ffcc00',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.1
      }
    }).addTo(map);

    window.kzLayer = kzLayer;
  });


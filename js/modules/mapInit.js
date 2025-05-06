/**
 * Map initialization and configuration
 * Sets up the Leaflet map with basic options and controls
 */
function initMap() {
  const spiderfier = initSpiderfier(map);
  
  console.log("Starting map initialization");
  
  // Get the map container
  const mapContainer = document.getElementById('newsletter-map');
  if (!mapContainer) {
    console.error("Map container not found!");
    return null;
  }
  
  console.log("Map container found, dimensions:", mapContainer.offsetWidth, "x", mapContainer.offsetHeight);
  
  // Initialize the map centered on Europe/Asia region
  const map = L.map('newsletter-map', {
    zoomControl: false, // We'll add a custom zoom control
    scrollWheelZoom: true, // Enable scroll wheel zooming
    maxZoom: 18,
    minZoom: 2,  // Allow zooming out to see the whole world
    attributionControl: false,
    doubleClickZoom: true,
  }).setView([40, 60], 3);  // Centered between Europe and Asia with closer zoom level
  
  console.log("Map object created");
  
  // Store map reference globally so we can access it for dark mode toggle
  window.leafletMap = map;
  
  // Add custom zoom control with better positioning
  L.control.zoom({
    position: 'topright',
    zoomInTitle: 'Zoom in - see more detail',
    zoomOutTitle: 'Zoom out - see more area'
  }).addTo(map);
  
  console.log("Zoom controls added");
  
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
  
  console.log("Fit all button added");
  
  // Add custom styled tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }).addTo(map);
  
  console.log("Tile layer added");
  
  // Add small attribution in bottom corner
  L.control.attribution({
    position: 'bottomright',
    prefix: false
  }).addTo(map);
  
  console.log("Attribution added");
  
  // Handle window resize
  window.addEventListener('resize', function() {
    map.invalidateSize();
    console.log("Map size invalidated after resize");
  });
  
  console.log("Map initialization complete");
  
  return map;
}

/**
 * Marker spiderfier for overlapping markers
 * Uses OverlappingMarkerSpiderfier to handle markers in the same location
 */

// Initialize the spiderfier
function initSpiderfier(map) {
  // Check if the OverlappingMarkerSpiderfier library is loaded
  if (typeof OverlappingMarkerSpiderfier === 'undefined') {
    console.warn('OverlappingMarkerSpiderfier not loaded. Clustered markers will not be available.');
    return null;
  }
  
  // Initialize with options
  const oms = new OverlappingMarkerSpiderfier(map, {
    keepSpiderfied: true,
    nearbyDistance: 20,
    circleSpiralSwitchover: 8,  // Show spiral after this many markers
    legWeight: 2,  // Spider leg thickness
    legColors: {
      usual: '#4a6f4a',  // Normal color (use your site's color variables)
      highlighted: '#2f4f2f'  // Hover color
    }
  });
  
  // Handle spiderfy event
  oms.addListener('spiderfy', function(markers) {
    // Add spiderfied class to all affected markers
    markers.forEach(marker => {
      const element = marker.getElement();
      if (element) {
        element.classList.add('spiderfied');
      }
    });
  });
  
  // Handle unspiderfy event
  oms.addListener('unspiderfy', function(markers) {
    // Remove spiderfied class from all affected markers
    markers.forEach(marker => {
      const element = marker.getElement();
      if (element) {
        element.classList.remove('spiderfied');
      }
    });
  });
  
  return oms;
}

// Load country boundaries for highlighting (GeoJSON)
function loadCountryBoundary(map, countryName, callback) {
  // Use a public GeoJSON source
  fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
    .then(response => response.json())
    .then(data => {
      // Find the country in the GeoJSON
      const countryFeature = data.features.find(feature => 
        feature.properties.ADMIN === countryName
      );
      
      if (countryFeature) {
        // Create a GeoJSON layer with the country boundary
        const countryLayer = L.geoJSON(countryFeature, {
          style: {
            color: '#4a6f4a',
            weight: 2,
            opacity: 0.6,
            fillColor: '#4a6f4a',
            fillOpacity: 0.1,
            dashArray: '5, 5',
            className: 'country-highlight'
          },
          interactive: true
        }).addTo(map);
        
        // Make the layer invisible initially
        countryLayer.setStyle({ opacity: 0, fillOpacity: 0 });
        
        if (typeof callback === 'function') {
          callback(countryLayer);
        }
        
        return countryLayer;
      }
      
      return null;
    })
    .catch(error => {
      console.error(`Error loading ${countryName} boundary:`, error);
      return null;
    });
}

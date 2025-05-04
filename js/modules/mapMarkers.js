/**
 * Marker creation and management
 * Handles loading newsletter data and creating map markers
 */

// Global array to store all markers
let allMarkers = [];

// Initialize markers on the map
function initMapMarkers(map) {
  // Custom icon for markers
  const markerIcon = L.divIcon({
    className: 'custom-marker-icon',
    html: '<div class="marker-dot"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
  
  // Initialize spiderfier for overlapping markers
  const oms = initSpiderfier(map);
  
  // Load newsletter data
  loadNewsletterData()
    .then(data => createMarkers(data, map, markerIcon, oms))
    .catch(handleDataError);
  
  // Make fitAllMarkers function globally available
  window.fitAllMarkers = function() {
    fitAllMarkers(map);
  };
}

// Load newsletter data from JSON file
async function loadNewsletterData() {
  try {
    const response = await fetch('/newsletter/newsletters.json');
    return await response.json();
  } catch (error) {
    console.error('Error loading newsletter data:', error);
    throw error;
  }
}

// Create markers from newsletter data
function createMarkers(data, map, markerIcon, oms) {
  // Get locations by country
  const locationsByCountry = groupMarkersByCountry(data);
  
  // Process all markers
  data.forEach(entry => {
    if (entry.location) {
      // Create marker
      const marker = L.marker([entry.location.lat, entry.location.lng], { 
        icon: markerIcon
      });
      
      // Add tooltip with title
      marker.bindTooltip(entry.title, {
        direction: 'top',
        offset: L.point(0, -10)
      });
      
      // Store metadata on marker for later use
      marker.newsletterId = entry.id;
      marker.newsletterTitle = entry.title;
      marker.newsletterLocation = entry.location_name || '';
      
      // Check if marker belongs to a country with multiple markers
      if (entry.location_name) {
        const country = extractCountry(entry.location_name);
        if (country && locationsByCountry[country] && locationsByCountry[country].length > 1) {
          // This is part of a group in one country
          marker.countryGroup = country;
          
          // Add special class for styling
          const markerElement = marker.getElement();
          if (markerElement) {
            markerElement.classList.add('country-group-marker');
            markerElement.classList.add(`${country.toLowerCase()}-marker`);
          }
        }
      }
      
      // Add direct click navigation
      marker.on('click', function() {
        window.location.href = entry.link;
      });
      
      // Make cursor change to pointer on hover
      marker.getElement().style.cursor = 'pointer';
      
      // Add marker to map
      marker.addTo(map);
      
      // Add marker to spiderfier if it exists
      if (oms) {
        oms.addMarker(marker);
      }
      
      // Add to all markers array
      allMarkers.push(marker);
    }
  });
  
  // Fit all markers initially
  fitAllMarkers(map);
  
  return allMarkers;
}

// Extract country from location string
function extractCountry(locationString) {
  if (!locationString) return null;
  
  // Split by comma and get the last part (usually the country)
  const parts = locationString.split(',');
  if (parts.length > 1) {
    return parts[parts.length - 1].trim();
  }
  
  return locationString.trim();
}

// Group markers by country
function groupMarkersByCountry(data) {
  const groups = {};
  
  data.forEach(entry => {
    if (entry.location && entry.location_name) {
      const country = extractCountry(entry.location_name);
      if (country) {
        if (!groups[country]) {
          groups[country] = [];
        }
        groups[country].push(entry);
      }
    }
  });
  
  return groups;
}

// Function to fit all markers on the map
function fitAllMarkers(map) {
  if (allMarkers.length > 0) {
    // Create a bounds object
    const markerBounds = L.featureGroup(allMarkers).getBounds();
    
    // Add padding for better visibility
    map.flyToBounds(markerBounds, {
      padding: [50, 50],
      duration: 1.5,
      easeLinearity: 0.5
    });
  }
}

// Handle data loading errors
function handleDataError(error) {
  console.error('Error loading newsletter data:', error);
  
  // Show error message
  const mapContainer = document.querySelector('.map-full-width');
  if (mapContainer) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'map-error';
    errorDiv.textContent = 'Could not load newsletter locations';
    mapContainer.appendChild(errorDiv);
  }
}

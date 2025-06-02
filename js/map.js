// Improved map.js with error handling and message coordination
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the map
  const map = L.map('map', {
    zoomControl: true,
    scrollWheelZoom: true,
    maxZoom: 18,
    minZoom: 2
  }).setView([30, 0], 2); // Center globally
  
  // Add tile layer with attribution
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(map);
  
  // Custom green pin
  const greenPinIcon = L.icon({
    iconUrl: '/images/green-pin.svg',
    iconSize: [32, 40],
    iconAnchor: [16, 40],  // The tail of the pin should point directly to the location
    popupAnchor: [0, -36]
  });
  
  // Store markers for later reference
  const markers = {};
  
  // Load newsletter locations
  loadNewsletterLocations();
  
  // Set up communication with parent window
  window.addEventListener('message', handleParentMessage);
  
  /**
   * Load newsletter locations from JSON file
   */
  async function loadNewsletterLocations() {
    try {
      const response = await fetch('/newsletter/newsletters.json');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch locations: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add markers for each newsletter with location
      data.forEach(entry => {
        if (entry.location) {
          addMarkerForNewsletter(entry);
        }
      });
      
      // Signal to parent that map is ready
      window.parent.postMessage({ type: 'map-ready' }, '*');
      
    } catch (error) {
      console.error('Error loading newsletter locations:', error);
      // Display error message on map
      L.popup()
        .setLatLng([30, 0])
        .setContent('<div class="map-error">Could not load locations</div>')
        .openOn(map);
    }
  }
  
  /**
   * Add a marker for a newsletter entry
   */
  function addMarkerForNewsletter(entry) {
    // Extract the slug from the link
    const slug = entry.link.replace(/^.*\//, "");
    
    // Create popup content
    const popup = `
      <div class="map-popup">
        <a href="${entry.link}">
          <img src="${entry.image}" alt="${entry.title}">
          <div class="popup-title">${entry.title}</div>
          ${entry.date ? `<div class="popup-date">${entry.date}</div>` : ''}
        </a>
      </div>`;
    
    // Create marker and add to map
    const marker = L.marker(
      [entry.location.lat, entry.location.lng], 
      { icon: greenPinIcon }
    )
      .addTo(map)
      .bindPopup(popup);
    
    // Store marker by slug for later reference
    markers[slug] = {
      marker: marker,
      coords: [entry.location.lat, entry.location.lng]
    };
  }
  
  /**
   * Handle messages from the parent window
   */
  function handleParentMessage(event) {
    // Validate message origin for security
    // const allowedOrigin = window.location.origin;
    // if (event.origin !== allowedOrigin) return;
    
    const data = event.data;
    
    // Handle location selection message
    if (data && data.type === 'select-location' && data.slug) {
      const markerInfo = markers[data.slug];
      
      if (markerInfo) {
        // Pan to the marker
        map.setView(markerInfo.coords, 8, {
          animate: true,
          duration: 1
        });
        
        // Open the popup
        setTimeout(() => {
          markerInfo.marker.openPopup();
        }, 800);
      } else if (data.coords) {
        // If we have coordinates but no marker, just pan to the coordinates
        map.setView(data.coords, 8, {
          animate: true,
          duration: 1
        });
      }
      
      // Acknowledge receipt
      window.parent.postMessage({ 
        type: 'location-selected',
        slug: data.slug
      }, '*');
    }
  }
});

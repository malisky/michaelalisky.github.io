// Global array to store all markers
let allMarkers = [];

// Group markers by proximity
function groupMarkersByProximity(markers, threshold = 0.5) {
  const groups = [];
  const processed = new Set();
  
  markers.forEach((marker, index) => {
    if (processed.has(index)) return;
    
    const group = [marker];
    const markerLatLng = marker.getLatLng();
    
    // Find nearby markers
    markers.forEach((otherMarker, otherIndex) => {
      if (index === otherIndex || processed.has(otherIndex)) return;
      
      const otherLatLng = otherMarker.getLatLng();
      const distance = markerLatLng.distanceTo(otherLatLng) / 1000; // Convert to km
      
      if (distance < threshold * 100) { // threshold in degrees roughly
        group.push(otherMarker);
        processed.add(otherIndex);
      }
    });
    
    processed.add(index);
    groups.push(group);
  });
  
  return groups;
}

// Create cluster tooltip content
function createClusterTooltip(markerGroup) {
  if (markerGroup.length === 1) {
    const marker = markerGroup[0];
    const data = marker._markerData;
    return `
      <div class="cluster-tooltip single-marker">
        <a href="${data.link}" class="marker-popup-card" target="_blank">
          <img src="${data.image}" alt="${data.title}" />
          <div class="text">
            <h3>${data.title}</h3>
            <p>${new Date(data.date).toDateString()}</p>
            <p>${data.location}</p>
          </div>
        </a>
      </div>
    `;
  }
  
  // Multiple markers - create vertical list
  const cards = markerGroup.map(marker => {
    const data = marker._markerData;
    return `
      <a href="${data.link}" class="cluster-card" target="_blank">
        <img src="${data.image}" alt="${data.title}" />
        <div class="card-text">
          <h4>${data.title}</h4>
          <p class="date">${new Date(data.date).toDateString()}</p>
          <p class="location">${data.location}</p>
        </div>
      </a>
    `;
  }).join('');
  
  return `
    <div class="cluster-tooltip multi-marker">
      <div class="cluster-header">
        <span class="cluster-count">${markerGroup.length} newsletters</span>
      </div>
      <div class="cluster-cards">
        ${cards}
      </div>
    </div>
  `;
}

// Initialize markers on the map
function initMapMarkers(map) {
  const markerIcon = L.divIcon({
    className: 'custom-marker-icon',
    html: '<div class="marker-dot"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
  
  // Fetch newsletter data
  fetch("/newsletter/newsletters.json")
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log('Newsletter data loaded:', data);
      
      // Create all markers first
      const markers = [];
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
          title: entry.title
        }).addTo(map);
        
        // Store marker data for easier access
        marker._markerData = {
          title: entry.title,
          date: entry.date,
          location: entry.location_name,
          image: entry.image,
          link: entry.link
        };
        
        marker.countryGroup = entry.countryGroup;
        markers.push(marker);
        allMarkers.push(marker);
      });
      
      // Group markers by proximity
      const markerGroups = groupMarkersByProximity(markers);
      
      // Set up hover behavior for each group
      markerGroups.forEach(group => {
        let clusterPopup = null;
        let hoverTimer = null;
        
        group.forEach(marker => {
          marker.on("mouseover", function(e) {
            // Clear any existing timer
            clearTimeout(hoverTimer);
            
            // Add hover effect to all markers in group
            group.forEach(m => {
              const markerElement = m.getElement();
              if (markerElement) {
                markerElement.classList.add('marker-hover');
              }
            });
            
            // Close any existing cluster popup
            if (clusterPopup) {
              map.closePopup(clusterPopup);
            }
            
            // Create and show cluster tooltip
            const tooltipContent = createClusterTooltip(group);
            clusterPopup = L.popup({
              closeButton: false,
              className: "cluster-popup",
              autoPan: false,
              maxWidth: group.length > 1 ? 350 : 300,
              maxHeight: group.length > 1 ? 400 : 200
            })
            .setLatLng(this.getLatLng())
            .setContent(tooltipContent)
            .openOn(map);
          });
          
          marker.on("mouseout", function(e) {
            // Set timer to close popup and remove hover effects
            hoverTimer = setTimeout(() => {
              group.forEach(m => {
                const markerElement = m.getElement();
                if (markerElement) {
                  markerElement.classList.remove('marker-hover');
                }
              });
              
              if (clusterPopup) {
                map.closePopup(clusterPopup);
                clusterPopup = null;
              }
            }, 500); // Short delay to allow moving between markers in group
          });
          
          // Direct click behavior
          marker.on("click", function(e) {
            L.DomEvent.stopPropagation(e);
            
            if (group.length === 1) {
              // Single marker - open link directly
              const link = this._markerData.link;
              window.open(link, "_blank");
            } else {
              // Multiple markers - the tooltip is already showing, user can click on individual cards
              // No additional action needed
            }
          });
        });
      });
      
      fitAllMarkers(map);
    })
    .catch(err => {
      console.error("Failed to load newsletter markers:", err);
    });
    
  // Global function to fit all markers
  window.fitAllMarkers = function(map) {
    if (allMarkers.length > 0) {
      const bounds = L.featureGroup(allMarkers).getBounds();
      map.flyToBounds(bounds, {
        padding: [50, 50],
        duration: 1.5
      });
    }
  };
}

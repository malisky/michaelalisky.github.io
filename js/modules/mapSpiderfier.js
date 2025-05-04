/**
 * Initialize and return the spiderfier functionality
 * Creates a simple hover-based spiderfier effect for markers
 */
function initSpiderfier(map) {
  // Store all markers by their group
  let groupedMarkers = {};
  
  const spiderfier = {
    markers: [],
    spiderfied: false,
    activeGroup: null,
    
    // Add a marker to the spiderfier
    addMarker: function(marker) {
      this.markers.push(marker);
      
      // Store the original position and group
      if (marker.options.group) {
        const group = marker.options.group;
        if (!groupedMarkers[group]) {
          groupedMarkers[group] = [];
        }
        groupedMarkers[group].push(marker);
        marker._originalLatLng = marker.getLatLng();
        
        // Add hover events to show titles and trigger spiderfying
        marker.on('mouseover', () => {
          // Make all markers in the group larger
          if (groupedMarkers[group].length > 1) {
            this.spreadMarkers(group);
            
            // Show titles for all markers in the group
            groupedMarkers[group].forEach(m => {
              if (m._titleDiv) {
                m._titleDiv.style.display = 'block';
              } else {
                // Create title if it doesn't exist
                const title = m.options.title || 'Unnamed location';
                const pos = map.latLngToLayerPoint(m.getLatLng());
                
                // Create a div for the title
                const titleDiv = document.createElement('div');
                titleDiv.className = 'marker-title';
                titleDiv.textContent = title;
                titleDiv.style.position = 'absolute';
                titleDiv.style.left = (pos.x + 15) + 'px';
                titleDiv.style.top = (pos.y - 15) + 'px';
                titleDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                titleDiv.style.padding = '3px 8px';
                titleDiv.style.borderRadius = '3px';
                titleDiv.style.fontSize = '12px';
                titleDiv.style.zIndex = '1000';
                titleDiv.style.pointerEvents = 'none';
                
                document.querySelector('.leaflet-marker-pane').parentNode.appendChild(titleDiv);
                m._titleDiv = titleDiv;
              }
            });
          }
        });
        
        marker.on('mouseout', () => {
          // Set timeout to allow moving between markers in the same group
          setTimeout(() => {
            // Check if mouse is over any marker in the group
            const mouseIsOverGroup = groupedMarkers[group].some(m => 
              m._icon && m._icon.matches(':hover')
            );
            
            if (!mouseIsOverGroup) {
              this.unspreadMarkers();
            }
          }, 100);
        });
      }
      
      return marker;
    },
    
    // Spread markers in a group outward
    spreadMarkers: function(group) {
      if (!groupedMarkers[group] || groupedMarkers[group].length <= 1) return;
      
      // Only spread if not already spiderfied or if different group
      if (this.spiderfied && this.activeGroup === group) return;
      
      // Unspread previous group if needed
      if (this.spiderfied) {
        this.unspreadMarkers();
      }
      
      const markers = groupedMarkers[group];
      
      // Find the center point (average of all markers)
      let centerLat = 0, centerLng = 0;
      markers.forEach(marker => {
        const pos = marker._originalLatLng;
        centerLat += pos.lat;
        centerLng += pos.lng;
      });
      centerLat /= markers.length;
      centerLng /= markers.length;
      const center = L.latLng(centerLat, centerLng);
      
      // Determine radius based on zoom level
      const zoom = map.getZoom();
      let radius = 0.2 / Math.pow(2, zoom - 2); // Adjust radius based on zoom
      
      // Distribute markers in a circle
      const angleStep = (2 * Math.PI) / markers.length;
      
      markers.forEach((marker, i) => {
        // Make markers larger on hover
        if (marker._icon) {
          marker._icon.style.transform += ' scale(1.2)';
          marker._icon.style.zIndex = 1000;
          marker._icon.style.transition = 'transform 0.2s ease-out';
        }
        
        // Calculate new position in a circle
        const angle = angleStep * i;
        const offsetLat = center.lat + radius * Math.cos(angle);
        const offsetLng = center.lng + radius * Math.sin(angle);
        const newLatLng = L.latLng(offsetLat, offsetLng);
        
        // Draw a line from center to the marker
        const line = L.polyline([center, newLatLng], {
          color: '#666',
          weight: 1,
          opacity: 0.6,
          dashArray: '3,3',
          interactive: false
        }).addTo(map);
        
        // Store line reference and move marker
        marker._spiderLine = line;
        marker.setLatLng(newLatLng);
        
        // Update title position
        if (marker._titleDiv) {
          const pos = map.latLngToLayerPoint(newLatLng);
          marker._titleDiv.style.left = (pos.x + 15) + 'px';
          marker._titleDiv.style.top = (pos.y - 15) + 'px';
        }
      });
      
      this.spiderfied = true;
      this.activeGroup = group;
    },
    
    // Return markers to original positions
    unspreadMarkers: function() {
      if (!this.spiderfied || !this.activeGroup) return;
      
      const markers = groupedMarkers[this.activeGroup];
      
      markers.forEach(marker => {
        // Return marker to original position
        marker.setLatLng(marker._originalLatLng);
        
        // Reset marker size
        if (marker._icon) {
          marker._icon.style.transform = marker._icon.style.transform.replace(' scale(1.2)', '');
          marker._icon.style.zIndex = '';
        }
        
        // Remove connecting line
        if (marker._spiderLine) {
          map.removeLayer(marker._spiderLine);
          delete marker._spiderLine;
        }
        
        // Hide title
        if (marker._titleDiv) {
          marker._titleDiv.style.display = 'none';
        }
      });
      
      this.spiderfied = false;
      this.activeGroup = null;
    },
    
    // Clean up all elements when needed
    cleanup: function() {
      // Remove all title divs from DOM
      this.markers.forEach(marker => {
        if (marker._titleDiv && marker._titleDiv.parentNode) {
          marker._titleDiv.parentNode.removeChild(marker._titleDiv);
        }
      });
      
      // Unspread if needed
      if (this.spiderfied) {
        this.unspreadMarkers();
      }
    }
  };
  
  // Clean up on map removal
  map.on('unload', () => {
    spiderfier.cleanup();
  });
  
  return spiderfier;
}

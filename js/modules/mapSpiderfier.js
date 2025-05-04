/**
 * Simplified spiderfier functionality
 * Just handles marker grouping and spreading, with minimal features
 */
function initSpiderfier(map) {
  console.log("Initializing spiderfier");
  
  // Store all markers by their group
  let groupedMarkers = {};
  
  const spiderfier = {
    markers: [],
    spiderfied: false,
    activeGroup: null,
    
    // Add a marker to the spiderfier
    addMarker: function(marker) {
      console.log("Adding marker to spiderfier:", marker.options.title);
      this.markers.push(marker);
      
      // Store the original position and group
      if (marker.options.group) {
        const group = marker.options.group;
        if (!groupedMarkers[group]) {
          groupedMarkers[group] = [];
        }
        groupedMarkers[group].push(marker);
        marker._originalLatLng = marker.getLatLng();
        
        // Add hover events to trigger spiderfying
        marker.on('mouseover', () => {
          console.log("Marker mouseover:", marker.options.title);
          // Spiderfy the markers in this group if there are multiple
          if (groupedMarkers[group].length > 1) {
            this.spreadMarkers(group);
          }
        });
      }
      
      return marker;
    },
    
    // Spread markers in a group outward
    spreadMarkers: function(group) {
      console.log("Spreading markers for group:", group);
      if (!groupedMarkers[group] || groupedMarkers[group].length <= 1) return;
      
      // Only spread if not already spiderfied or if different group
      if (this.spiderfied && this.activeGroup === group) return;
      
      // Unspread previous group if needed
      if (this.spiderfied) {
        this.unspreadMarkers();
      }
      
      const markers = groupedMarkers[group];
      console.log("Found", markers.length, "markers in group");
      
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
      
      // Use a fixed radius for simplicity
      const radius = 0.5;
      
      // Distribute markers in a circle
      const angleStep = (2 * Math.PI) / markers.length;
      
      markers.forEach((marker, i) => {
        // Calculate new position in a circle
        const angle = angleStep * i;
        const offsetLat = center.lat + radius * Math.cos(angle);
        const offsetLng = center.lng + radius * Math.sin(angle);
        const newLatLng = L.latLng(offsetLat, offsetLng);
        
        // Move marker
        marker.setLatLng(newLatLng);
        console.log("Moved marker to new position:", newLatLng);
      });
      
      this.spiderfied = true;
      this.activeGroup = group;
      
      // Set timeout to automatically unspread after 5 seconds
      setTimeout(() => {
        if (this.spiderfied && this.activeGroup === group) {
          this.unspreadMarkers();
        }
      }, 5000);
    },
    
    // Return markers to original positions
    unspreadMarkers: function() {
      if (!this.spiderfied || !this.activeGroup) return;
      
      console.log("Unspreading markers for group:", this.activeGroup);
      
      const markers = groupedMarkers[this.activeGroup];
      
      markers.forEach(marker => {
        // Return marker to original position
        marker.setLatLng(marker._originalLatLng);
      });
      
      this.spiderfied = false;
      this.activeGroup = null;
    }
  };
  
  return spiderfier;
}

/**
 * Marker spiderfier for overlapping markers
 * Handles overlapping markers by spreading them out when clicked
 */

// Initialize the spiderfier
function initSpiderfier(map) {
  // Set up variables to track marker groups
  let countryLayers = {};
  let countryMarkers = {};
  let activeCountry = null;
  
  // Create a simple spiderfier implementation 
  const spiderfier = {
    markers: [],
    spiderfied: false,
    currentCountry: null,
    
    // Add a marker to the spiderfier
    addMarker: function(marker) {
      this.markers.push(marker);
      
      // Check if marker belongs to a country group
      if (marker.countryGroup) {
        const country = marker.countryGroup;
        
        // Initialize country group if needed
        if (!countryMarkers[country]) {
          countryMarkers[country] = [];
        }
        
        // Add marker to country group
        countryMarkers[country].push(marker);
        
        // Add click handler for country markers
        marker.on('click', (e) => {
          // Prevent default behavior (navigation)
          L.DomEvent.stopPropagation(e);
          
          // If marker is already spiderfied, navigate to the newsletter
          if (this.spiderfied && this.currentCountry === country) {
            window.location.href = marker.options.link || marker._path;
            return;
          }
          
          // Otherwise, spiderfy the markers
          this.spiderfy(country);
        });
        
        // Add mouseover handler to highlight country
        marker.on('mouseover', () => {
          this.highlightCountry(country);
        });
        
        // Add mouseout handler to unhighlight country
        marker.on('mouseout', () => {
          if (this.currentCountry !== country) {
            this.unhighlightCountry(country);
          }
        });
      }
      
      return marker;
    },
    
    // Spiderfy markers for a specific country
    spiderfy: function(country) {
      // Do nothing if already spiderfied for this country
      if (this.spiderfied && this.currentCountry === country) {
        return;
      }
      
      // Unspiderfy previous country if any
      if (this.spiderfied) {
        this.unspiderfy();
      }
      
      // Get markers for this country
      const markers = countryMarkers[country] || [];
      if (markers.length === 0) {
        return;
      }
      
      // Set current country and spiderfied state
      this.currentCountry = country;
      this.spiderfied = true;
      
      // Highlight country boundary
      this.highlightCountry(country);
      
      // Calculate center point
      const lats = markers.map(m => m.getLatLng().lat);
      const lngs = markers.map(m => m.getLatLng().lng);
      const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
      const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
      const center = L.latLng(centerLat, centerLng);
      
      // Calculate spoke length based on zoom
      const currentZoom = map.getZoom();
      const baseLength = 0.03; // Base spoke length at zoom level 10
      const zoomFactor = Math.pow(0.8, currentZoom - 10); // Adjust by zoom level
      const spokeLength = baseLength * zoomFactor;
      
      // Spread markers in a circle/spiral pattern
      const angleStep = (2 * Math.PI) / markers.length;
      
      markers.forEach((marker, i) => {
        // Calculate spiral position (increase radius slightly for each marker)
        const angle = i * angleStep;
        const radius = spokeLength * (1 + i * 0.2); // Spiral effect
        const newLat = center.lat + radius * Math.cos(angle);
        const newLng = center.lng + radius * Math.sin(angle);
        
        // Store original position
        marker._originalLatLng = marker.getLatLng();
        
        // Animate marker to new position
        this._animateMarkerMove(marker, newLat, newLng);
        
        // Add spiderfied class to marker
        const element = marker.getElement();
        if (element) {
          element.classList.add('spiderfied');
        }
      });
      
      // Add click handler to map to unspiderfy when clicking elsewhere
      map.once('click', () => {
        this.unspiderfy();
      });
    },
    
    // Unspiderfy all markers
    unspiderfy: function() {
      if (!this.spiderfied) {
        return;
      }
      
      // Get markers for current country
      const markers = countryMarkers[this.currentCountry] || [];
      
      // Restore original positions
      markers.forEach(marker => {
        if (marker._originalLatLng) {
          this._animateMarkerMove(marker, marker._originalLatLng.lat, marker._originalLatLng.lng);
          delete marker._originalLatLng;
        }
        
        // Remove spiderfied class
        const element = marker.getElement();
        if (element) {
          element.classList.remove('spiderfied');
        }
      });
      
      // Unhighlight country boundary
      this.unhighlightCountry(this.currentCountry);
      
      // Reset state
      this.spiderfied = false;
      this.currentCountry = null;
    },
    
    // Highlight country boundary
    highlightCountry: function(country) {
      // Check if country layer exists, load if not
      if (!countryLayers[country]) {
        this._loadCountryBoundary(country, map);
        return;
      }
      
      // Highlight country layer
      const layer = countryLayers[country];
      if (layer) {
        layer.setStyle({
          opacity: 0.8,
          fillOpacity: 0.2
        });
      }
    },
    
    // Unhighlight country boundary
    unhighlightCountry: function(country) {
      const layer = countryLayers[country];
      if (layer) {
        layer.setStyle({
          opacity: 0,
          fillOpacity: 0
        });
      }
    },
    
    // Animate marker movement
    _animateMarkerMove: function(marker, newLat, newLng) {
      // Get current position
      const startPos = marker.getLatLng();
      const endPos = L.latLng(newLat, newLng);
      
      // Set up animation
      const duration = 500; // milliseconds
      const start = performance.now();
      
      // Animation function
      function animate(timestamp) {
        // Calculate progress
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        
        // Calculate intermediate position
        const lat = startPos.lat + (endPos.lat - startPos.lat) * easedProgress;
        const lng = startPos.lng + (endPos.lng - startPos.lng) * easedProgress;
        
        // Update marker position
        marker.setLatLng([lat, lng]);
        
        // Continue animation if not complete
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      }
      
      // Start animation
      requestAnimationFrame(animate);
    },
    
    // Load country boundary from GeoJSON
    _loadCountryBoundary: function(country, map) {
      // Map country names to GeoJSON names
      const countryMapping = {
        'Kazakhstan': 'Kazakhstan',
        'Mongolia': 'Mongolia',
        'Taiwan': 'Taiwan'
        // Add more mappings as needed
      };
      
      // Get proper GeoJSON name
      const geoJsonName = countryMapping[country] || country;
      
      // Fetch GeoJSON
      fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
        .then(response => response.json())
        .then(data => {
          // Find country feature
          const feature = data.features.find(f => 
            f.properties.ADMIN === geoJsonName
          );
          
          if (feature) {
            // Create GeoJSON layer
            const layer = L.geoJSON(feature, {
              style: {
                color: '#4a6f4a',
                weight: 2,
                opacity: 0,
                fillColor: '#4a6f4a',
                fillOpacity: 0,
                dashArray: '5, 5',
                className: 'country-highlight'
              },
              interactive: false
            }).addTo(map);
            
            // Store layer
            countryLayers[country] = layer;
            
            // Highlight if this is the current country
            if (this.currentCountry === country) {
              this.highlightCountry(country);
            }
          }
        })
        .catch(error => {
          console.error(`Error loading country boundary for ${country}:`, error);
        });
    }
  };
  
  // Add "View Kazakhstan" button
  addCountryFocusButton(map, 'Kazakhstan', [43.25, 76.95], 7);
  
  return spiderfier;
}

// Function to add a button to focus on a specific country
function addCountryFocusButton(map, country, center, zoom) {
  // Create a custom control
  const countryControl = L.control({position: 'topright'});
  
  countryControl.onAdd = function() {
    // Create control container
    const container = L.DomUtil.create('div', 'leaflet-control leaflet-bar country-focus-control');
    
    // Create button with country flag emoji or icon
    const flagEmoji = getCountryFlagEmoji(country);
    container.innerHTML = `<a href="#" title="Focus on ${country}" role="button" aria-label="Focus on ${country}">${flagEmoji}</a>`;
    
    // Add click handler
    L.DomEvent.on(container, 'click', function(e) {
      L.DomEvent.stopPropagation(e);
      map.flyTo(center, zoom, {
        duration: 1.5,
        easeLinearity: 0.5
      });
      return false;
    });
    
    return container;
  };
  
  // Add control to map
  countryControl.addTo(map);
}

// Get flag emoji for a country
function getCountryFlagEmoji(country) {
  // Map countries to flag emojis
  const flagMap = {
    'Kazakhstan': '🇰🇿',
    'Mongolia': '🇲🇳',
    'Taiwan': '🇹🇼',
    // Add more as needed
  };
  
  return flagMap[country] || '🌍';
}

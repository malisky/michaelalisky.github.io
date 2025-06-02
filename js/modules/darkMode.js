/**
 * Dark mode toggle functionality
 * Handles dark/light theme preferences and transitions with proper map tile switching
 */

function initDarkMode() {
  const darkModeToggle = document.getElementById('night-toggle');
  
  // Check for saved theme preference
  const savedTheme = localStorage.getItem('darkMode');
  
  // Apply saved theme or default to system preference
  const isDarkMode = savedTheme === 'true' || 
                    (savedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    darkModeToggle.textContent = '🌗'; // Third quarter moon for dark mode
  } else {
    darkModeToggle.textContent = '🌓'; // First quarter moon for light mode
  }
  
  // Initialize map tiles for current theme
  if (window.leafletMap && window.leafletMap._loaded) {
    updateMapTiles(isDarkMode);
  }
  
  // Handle toggle click
  darkModeToggle.addEventListener('click', function() {
    // Add transitioning class for animation
    document.body.classList.add('theme-transitioning');
    
    // Change moon emoji with animation
    darkModeToggle.style.transition = 'transform 0.3s ease';
    darkModeToggle.style.transform = 'translateY(-5px)';
    
    // Toggle dark mode class
    const willBeDarkMode = !document.body.classList.contains('dark-mode');
    document.body.classList.toggle('dark-mode');
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', willBeDarkMode);
    
    // Animate the emoji change
    setTimeout(() => {
      if (willBeDarkMode) {
        darkModeToggle.textContent = '🌗'; // Third quarter moon for dark mode
      } else {
        darkModeToggle.textContent = '🌓'; // First quarter moon for light mode
      }
      
      darkModeToggle.style.transform = 'translateY(0)';
    }, 150);
    
    // Remove transitioning class after animation
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 300);
    
    // Update map tiles if map exists
    if (window.leafletMap) {
      setTimeout(() => {
        updateMapTiles(willBeDarkMode);
        window.leafletMap.invalidateSize();
      }, 300);
    }
  });
}

// Global variables to store tile layers
let lightTileLayer = null;
let darkTileLayer = null;

function updateMapTiles(isDarkMode) {
  const map = window.leafletMap;
  if (!map) return;
  
  // Initialize tile layers if they don't exist
  if (!lightTileLayer) {
    lightTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      className: 'light-tiles'
    });
  }
  
  if (!darkTileLayer) {
    darkTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      className: 'dark-tiles'
    });
  }
  
  // Remove current tile layer
  map.eachLayer(function(layer) {
    if (layer instanceof L.TileLayer) {
      map.removeLayer(layer);
    }
  });
  
  // Add appropriate tile layer
  if (isDarkMode) {
    darkTileLayer.addTo(map);
  } else {
    lightTileLayer.addTo(map);
  }
}

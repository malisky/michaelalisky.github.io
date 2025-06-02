/**
 * Dark mode toggle functionality
 * Handles dark/light theme preferences and transitions with proper map tile switching
 */
function initDarkMode() {
  console.log('Initializing dark mode...');
  
  // Wait a bit to ensure DOM is fully ready
  setTimeout(() => {
    const darkModeToggle = document.getElementById('night-toggle');
    
    if (!darkModeToggle) {
      console.error('Dark mode toggle button not found!');
      return;
    }
    
    console.log('Found toggle button:', darkModeToggle);
    
    // Get saved theme or default to light
    const savedTheme = localStorage.getItem('darkMode');
    const isDarkMode = savedTheme === 'true';
    
    console.log('Initial dark mode state:', isDarkMode);
    
    // Set initial state
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      darkModeToggle.textContent = '🌗';
    } else {
      document.body.classList.remove('dark-mode');
      darkModeToggle.textContent = '🌓';
    }
    
    // Function to toggle dark mode
    function toggleDarkMode() {
      console.log('Toggle clicked!');
      
      const isCurrentlyDark = document.body.classList.contains('dark-mode');
      const willBeDark = !isCurrentlyDark;
      
      // Toggle the class
      if (willBeDark) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      
      // Update button
      darkModeToggle.textContent = willBeDark ? '🌗' : '🌓';
      
      // Save preference
      localStorage.setItem('darkMode', willBeDark);
      
      // Update map tiles if map exists
      if (window.leafletMap) {
        updateMapTheme(willBeDark);
      }
      
      console.log('Toggled to:', willBeDark ? 'dark' : 'light');
    }
    
    // Function to update map theme
    function updateMapTheme(isDark) {
      if (!window.leafletMap) return;
      
      const tileUrl = isDark 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      
      // Remove existing tile layers
      window.leafletMap.eachLayer(layer => {
        if (layer._url && layer._url.includes('cartocdn')) {
          window.leafletMap.removeLayer(layer);
        }
      });
      
      // Add new tile layer
      L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }).addTo(window.leafletMap);
    }
    
    // Multiple ways to attach the event listener
    darkModeToggle.onclick = toggleDarkMode;
    darkModeToggle.addEventListener('click', toggleDarkMode, { passive: true });
    
    // Also try touch events for mobile
    darkModeToggle.addEventListener('touchstart', (e) => {
      e.preventDefault();
      toggleDarkMode();
    }, { passive: false });
    
    // Initial map theme
    if (window.leafletMap) {
      updateMapTheme(isDarkMode);
    }
    
    console.log('Dark mode initialization complete');
  }, 100);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDarkMode);
} else {
  initDarkMode();
}

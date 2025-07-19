/**
 * Dark mode toggle functionality
 * Handles dark/light theme preferences and transitions with proper map tile switching
 */

// Track initialization to prevent duplicates
let darkModeInitialized = false;

export function initDarkMode() {
  // Prevent duplicate initialization
  if (darkModeInitialized) {
    return;
  }
  darkModeInitialized = true;

  // Wait a bit to ensure DOM is fully ready
  setTimeout(() => {
    const darkModeToggle = document.getElementById('night-toggle');
    
    if (!darkModeToggle) {
      console.log('DarkMode.js: Toggle button not found, will retry');
      darkModeInitialized = false; // Reset for retry
      return;
    }
    
    // Prevent duplicate event listeners
    if (darkModeToggle.dataset.initialized) {
      return;
    }
    darkModeToggle.dataset.initialized = 'true';
    
    // Get saved theme or default to light
    const savedTheme = localStorage.getItem('darkMode');
    const isDarkMode = savedTheme === 'true';
    
    // Set initial state
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      darkModeToggle.textContent = '🌗';
    } else {
      document.body.classList.remove('dark-mode');
      darkModeToggle.textContent = '🌓';
    }

    // Helper to create subtle firework sparks
    function createSparks(btn, count = 10) {
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      for (let i = 0; i < count; i++) {
        const angle = (2 * Math.PI * i) / count + (Math.random() - 0.5) * 0.2; // slight random arc
        const distance = 22 + Math.random() * 10; // subtle, not too far
        const spark = document.createElement('span');
        spark.className = 'night-toggle-spark';
        // Alternate gold and orange for better visibility in both light and dark modes
        spark.style.background = i % 2 === 0 ? 'gold' : '#e0f6fa';
        // Place spark at center, then animate outward
        spark.style.left = `${centerX - 3 + window.scrollX}px`;
        spark.style.top = `${centerY - 3 + window.scrollY}px`;
        // Set custom properties for animation
        spark.style.setProperty('--spark-x', `${Math.cos(angle) * distance}px`);
        spark.style.setProperty('--spark-y', `${Math.sin(angle) * distance}px`);
        document.body.appendChild(spark);
        // Remove after animation
        setTimeout(() => spark.remove(), 900);
      }
    }

    // Function to animate toggle
    function animateToggle() {
      darkModeToggle.classList.add('night-toggle-spin');
      createSparks(darkModeToggle);
      // Add blue-tint to theme-transition overlay
      const themeTransition = document.querySelector('.theme-transition');
      if (themeTransition) {
        themeTransition.classList.add('blue-tint');
        setTimeout(() => {
          themeTransition.classList.remove('blue-tint');
        }, 300);
      }
      setTimeout(() => {
        darkModeToggle.classList.remove('night-toggle-spin');
      }, 600);
    }

    // Function to toggle dark mode
    function toggleDarkMode() {
      animateToggle();
      
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
  }, 100);
}

// Auto-initialize dark mode when the module loads
const initDarkModeWhenReady = () => {
  const button = document.getElementById('night-toggle');
  if (button) {
    initDarkMode();
  } else {
    setTimeout(initDarkModeWhenReady, 100);
  }
};

initDarkModeWhenReady();

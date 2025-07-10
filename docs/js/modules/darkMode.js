/**
 * Dark mode toggle functionality
 * Handles dark/light theme preferences and transitions with proper map tile switching
 */
export function initDarkMode() {
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
    
    // Inject CSS for spin and sparks if not already present
    if (!document.getElementById('night-toggle-anim-style')) {
      const style = document.createElement('style');
      style.id = 'night-toggle-anim-style';
      style.textContent = `
        @keyframes spin-toggle {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .night-toggle-spin {
          animation: spin-toggle 0.6s cubic-bezier(0.4,1.4,0.4,1) 1;
        }
        .night-toggle-spark {
          position: absolute;
          pointer-events: none;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: gold;
          opacity: 0.7;
          z-index: 1000;
          transform: scale(0.7);
          animation: spark-firework 0.85s cubic-bezier(0.4,0.2,0.2,1) forwards;
        }
        @keyframes spark-firework {
          0% {
            opacity: 0;
            transform: scale(0.7) translate3d(0,0,0);
          }
          15% {
            opacity: 1;
            transform: scale(1) translate3d(0,0,0);
          }
          70% {
            opacity: 0.8;
          }
          100% {
            opacity: 0;
            transform: scale(0.8) translate3d(var(--spark-x), var(--spark-y), 0);
          }
        }
      `;
      document.head.appendChild(style);
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
        // Alternate gold and white for a softer look
        spark.style.background = i % 2 === 0 ? 'gold' : 'white';
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
      setTimeout(() => {
        darkModeToggle.classList.remove('night-toggle-spin');
      }, 600);
    }

    // Function to toggle dark mode
    function toggleDarkMode() {
      animateToggle();
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

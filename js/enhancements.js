document.addEventListener('DOMContentLoaded', function() {
  // Dark mode toggle
  const darkModeToggle = document.getElementById('night-toggle');
  const newsletterMap = document.getElementById('newsletter-map');
  
  if (darkModeToggle) {
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
      if (newsletterMap && window.leafletMap) {
        setTimeout(() => {
          // Force a redraw of the map tiles
          window.leafletMap.invalidateSize();
        }, 400);
      }
    });
  }
  
  // Scroll to top button
  const scrollTopButton = document.querySelector('.scroll-top');
  
  if (scrollTopButton) {
    // Show/hide scroll button based on scroll position
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        scrollTopButton.classList.add('visible');
      } else {
        scrollTopButton.classList.remove('visible');
      }
    });
    
    // Scroll to top when button clicked
    scrollTopButton.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // Map footer layout class addition
  if (newsletterMap) {
    document.body.classList.add('map-layout');
    
    // Initialize the map
    initMap();
  }
  
  // Set active navigation link based on current page
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('nav a');
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    
    // If the link's href matches the current path or special cases
    if (linkPath === currentPath || 
        (currentPath.includes('/newsletter/') && linkPath === '/newsletter.html') ||
        (currentPath.includes('/research/') && linkPath === '/research.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
  
  // Fix line breaks after hyperlinks in newsletters
  const newsletterLinks = document.querySelectorAll('.card p a');
  newsletterLinks.forEach(link => {
    // Check if link is followed by a <br> tag
    const nextSibling = link.nextSibling;
    if (nextSibling && nextSibling.nodeType === Node.ELEMENT_NODE && nextSibling.tagName === 'BR') {
      nextSibling.remove();
    }
  });
});

// Map initialization function
function initMap() {
  // Initialize the map centered on Europe/Asia region
  const map = L.map('newsletter-map', {
    zoomControl: false, // We'll add a custom zoom control
    scrollWheelZoom: true, // Enable scroll wheel zooming
    maxZoom: 18,
    minZoom: 2,  // Allow zooming out to see the whole world
    attributionControl: false,
    doubleClickZoom: true,
    // Use flyTo for smoother animations when changing views
    flyTo: true
  }).setView([45, 60], 4);  // Centered between Europe and Asia with closer zoom level
  
  // Store map reference globally so we can access it for dark mode toggle
  window.leafletMap = map;
  
  // Add custom zoom control with better positioning
  L.control.zoom({
    position: 'topright',
    zoomInTitle: 'Zoom in - see more detail',
    zoomOutTitle: 'Zoom out - see more area'
  }).addTo(map);
  
  // Add a "fit all markers" button
  const fitAllButton = L.control({position: 'topright'});
  fitAllButton.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
    div.innerHTML = '<a class="fit-all-button" href="#" title="Fit all locations" role="button" aria-label="Fit all locations">📍</a>';
    div.onclick = function() {
      fitAllMarkers();
      return false;
    };
    return div;
  };
  fitAllButton.addTo(map);
  
  // Add custom styled tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }).addTo(map);
  
  // Add small attribution in bottom corner
  L.control.attribution({
    position: 'bottomright',
    prefix: false
  }).addTo(map);
  
  // Custom icon for markers
  const markerIcon = L.divIcon({
    className: 'custom-marker-icon',
    html: '<div class="marker-dot"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
  
  // Store for markers so we can fit all later
  let allMarkers = [];
  
  // Load newsletter data
  fetch('/newsletter/newsletters.json')
    .then(res => res.json())
    .then(data => {
      // Create markers for each newsletter
      data.forEach(entry => {
        if (entry.location) {
          // Create marker
          const marker = L.marker([entry.location.lat, entry.location.lng], { 
            icon: markerIcon
          }).addTo(map);
          
          // Add tooltip with newsletter title
          marker.bindTooltip(entry.title, {
            direction: 'top',
            offset: L.point(0, -10)
          });
          
          // Create popup with more details and "read more" link
          const popupContent = `
            <div class="map-popup">
              <h3>${entry.title}</h3>
              <p>${entry.location_name || ''}</p>
              <a href="${entry.link}" class="popup-link">Read more</a>
            </div>
          `;
          marker.bindPopup(popupContent);
          
          // Add click handler to zoom to marker
          marker.on('click', function() {
            // Use flyTo for smoother transition
            map.flyTo([entry.location.lat, entry.location.lng], 6, {
              duration: 1.5,
              easeLinearity: 0.25
            });
            this.openPopup();
          });
          
          // Make cursor change to pointer on hover
          marker.getElement().style.cursor = 'pointer';
          
          // Add to all markers array
          allMarkers.push(marker);
        }
      });
      
      // Initial fit to show all markers
      fitAllMarkers();
    })
    .catch(error => {
      console.error('Error loading newsletter data:', error);
      
      // Show error message
      const mapContainer = document.querySelector('.map-full-width');
      const errorDiv = document.createElement('div');
      errorDiv.className = 'map-error';
      errorDiv.textContent = 'Could not load newsletter locations';
      mapContainer.appendChild(errorDiv);
    });
  
  // Function to fit all markers on the map
  function fitAllMarkers() {
    if (allMarkers.length > 0) {
      // Create a bounds object
      const markerBounds = L.featureGroup(allMarkers).getBounds();
      
      // Add padding for better visibility - but don't restrict future movement
      map.flyToBounds(markerBounds, {
        padding: [50, 50],
        duration: 1.5,
        easeLinearity: 0.5
      });
    }
  }
  
  // Handle window resize
  window.addEventListener('resize', function() {
    map.invalidateSize();
  });
  
  return map;
}

// Simplified newsletter navigation script
document.addEventListener('DOMContentLoaded', function() {
  // Function to load newsletter data
  async function loadNewsletterData() {
    try {
      const response = await fetch('/newsletter/newsletters.json');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error loading newsletter data:', error);
      return null;
    }
  }

  // Set up newsletter navigation links based on chronological order
  async function setupNewsletterNavigation() {
    // Get current page URL
    const currentPath = window.location.pathname;
    
    // Extract newsletter ID from the URL
    let currentId = null;
    const pathMatch = currentPath.match(/\/newsletter\/(.+)\.html/);
    if (pathMatch && pathMatch[1]) {
      currentId = pathMatch[1];
    } else {
      // If not on a newsletter page, don't setup navigation
      return;
    }
    
    // Load newsletter data
    const newsletters = await loadNewsletterData();
    if (!newsletters || !Array.isArray(newsletters)) return;
    
    // Sort newsletters chronologically by date
    newsletters.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Find current newsletter index
    const currentIndex = newsletters.findIndex(item => item.id === currentId);
    if (currentIndex === -1) return;
    
    // Setup navigation links
    const navSection = document.querySelector('.newsletter-navigation');
    if (navSection) {
      const prevLink = navSection.querySelector('.nav-arrow.prev');
      const nextLink = navSection.querySelector('.nav-arrow.next');
      
      // Handle previous link
      if (prevLink) {
        if (currentIndex > 0) {
          const prevItem = newsletters[currentIndex - 1];
          prevLink.href = prevItem.link;
          prevLink.title = `Previous: ${prevItem.title}`;
        } else {
          prevLink.style.visibility = 'hidden';
        }
      }
      
      // Handle next link
      if (nextLink) {
        if (currentIndex < newsletters.length - 1) {
          const nextItem = newsletters[currentIndex + 1];
          nextLink.href = nextItem.link;
          nextLink.title = `Next: ${nextItem.title}`;
        } else {
          nextLink.style.visibility = 'hidden';
        }
      }
    }
  }

  // Call the setup function
  setupNewsletterNavigation();
});

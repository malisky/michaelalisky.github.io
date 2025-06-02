/**
 * Main entry point for newsletter site JavaScript
 * Conditionally initializes modules based on page type
 */

document.addEventListener('DOMContentLoaded', function() {
  // Check which functions exist before calling them
  // This way, we only need to include necessary scripts on each page

  // Dark mode - used on all pages
  if (typeof initDarkMode === 'function' && document.getElementById('night-toggle')) {
    initDarkMode();
  }
  
  // Scroll to top button - used on all pages
  if (typeof initScrollToTop === 'function' && document.querySelector('.scroll-top')) {
    initScrollToTop();
  }
  
  // Active navigation links - used on all pages
  if (typeof initActiveNavLinks === 'function') {
    initActiveNavLinks();
  }
  
  // Fix newsletter links - only needed on newsletter pages
  if (typeof fixNewsletterLinks === 'function' && 
      (document.querySelector('.card p a') || window.location.pathname.includes('/newsletter/'))) {
    fixNewsletterLinks();
  }
  
  // Map functionality - only used on map pages
  const newsletterMap = document.getElementById('newsletter-map');
  if (newsletterMap) {
    document.body.classList.add('map-layout');
    
    // Only initialize map if the function exists
    if (typeof initMap === 'function') {
      const map = initMap();
      
      // Initialize markers if the function exists
      if (map && typeof initMapMarkers === 'function') {
        initMapMarkers(map);
      }
    }
  }
  
  // Newsletter navigation - only used on newsletter pages
  if (typeof initNewsletterNavigation === 'function' && 
      window.location.pathname.match(/\/newsletter\/(.+)\.html/)) {
    initNewsletterNavigation();
  }
});

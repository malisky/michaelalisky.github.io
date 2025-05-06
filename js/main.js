/**
 * Main entry point for newsletter site JavaScript
 * Conditionally initializes modules based on page type
 */

document.addEventListener('DOMContentLoaded', function () {
  // Dark mode toggle
  if (typeof initDarkMode === 'function' && document.getElementById('night-toggle')) {
    initDarkMode();
  }

  // Scroll to top button
  if (typeof initScrollToTop === 'function' && document.querySelector('.scroll-top')) {
    initScrollToTop();
  }

  // Highlight active nav links
  if (typeof initActiveNavLinks === 'function') {
    initActiveNavLinks();
  }

  // Fix in-text newsletter links
  if (
    typeof fixNewsletterLinks === 'function' &&
    (document.querySelector('.card p a') || window.location.pathname.includes('/newsletter/'))
  ) {
    fixNewsletterLinks();
  }

  // Newsletter list (card view on /newsletter.html)
  if (
    typeof initNewsletterCards === 'function' &&
    window.location.pathname.includes('/newsletter.html')
  ) {
    initNewsletterCards();
  }

  // Map functionality
  const newsletterMap = document.getElementById('newsletter-map');
  if (newsletterMap) {
    document.body.classList.add('map-layout');

    if (typeof initMap === 'function') {
      const map = initMap();

      if (map && typeof initMapMarkers === 'function') {
        initMapMarkers(map);
      }
    }
  }

  // Per-newsletter navigation (if on a specific newsletter entry page)
  if (
    typeof initNewsletterNavigation === 'function' &&
    window.location.pathname.match(/\/newsletter\/(.+)\.html/)
  ) {
    initNewsletterNavigation();
  }
});

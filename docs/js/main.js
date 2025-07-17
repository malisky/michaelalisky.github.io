/**
 * Main entry point for newsletter site JavaScript
 * Conditionally initializes modules based on page type
 */

import { initMap } from './modules/mapInit.js';
import { initMapMarkers, addChinaPolygonOnHover, addChinaMapClickHandler } from './modules/mapMarkers.js';
import { initDarkMode } from './modules/darkMode.js';

document.addEventListener('DOMContentLoaded', () => {
  // Dark mode toggle
  if (document.getElementById('night-toggle')) {
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
    const map = initMap();
    if (map) {
      initMapMarkers(map);
      addChinaPolygonOnHover(map);
      addChinaMapClickHandler(map);
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

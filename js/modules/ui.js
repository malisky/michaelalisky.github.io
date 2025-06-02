/**
 * UI elements like scroll-to-top button and navigation elements
 * Handles UI interactions and improvements
 */

// Initialize scroll-to-top button
function initScrollToTop() {
  const scrollTopButton = document.querySelector('.scroll-top');
  
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

// Set active navigation link based on current page
function initActiveNavLinks() {
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
}

// Fix line breaks after hyperlinks in newsletters
function fixNewsletterLinks() {
  const newsletterLinks = document.querySelectorAll('.card p a');
  newsletterLinks.forEach(link => {
    // Check if link is followed by a <br> tag
    const nextSibling = link.nextSibling;
    if (nextSibling && nextSibling.nodeType === Node.ELEMENT_NODE && nextSibling.tagName === 'BR') {
      nextSibling.remove();
    }
  });
}

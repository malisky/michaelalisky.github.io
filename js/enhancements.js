document.addEventListener('DOMContentLoaded', function() {
  // Dark mode toggle
  const darkModeToggle = document.getElementById('night-toggle');
  
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
  if (document.getElementById('newsletter-map')) {
    document.body.classList.add('map-layout');
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

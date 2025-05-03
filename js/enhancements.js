document.addEventListener('DOMContentLoaded', function() {
  // Dark mode toggle
  const darkModeToggle = document.getElementById('night-toggle');
  
  if (darkModeToggle) {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('darkMode');
    
    // Apply saved theme or default to system preference
    if (savedTheme === 'true' || 
        (savedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.body.classList.add('dark-mode');
    }
    
    // Handle toggle click
    darkModeToggle.addEventListener('click', function() {
      // Add transitioning class for animation
      document.body.classList.add('theme-transitioning');
      
      // Toggle dark mode class
      document.body.classList.toggle('dark-mode');
      
      // Save preference to localStorage
      localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
      
      // Remove transitioning class after animation
      setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
      }, 500);
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
});

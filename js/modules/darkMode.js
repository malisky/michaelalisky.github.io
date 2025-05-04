/**
 * Dark mode toggle functionality
 * Handles dark/light theme preferences and transitions
 */

function initDarkMode() {
  const darkModeToggle = document.getElementById('night-toggle');
  
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
    if (window.leafletMap) {
      setTimeout(() => {
        // Force a redraw of the map tiles
        window.leafletMap.invalidateSize();
      }, 400);
    }
  });
}

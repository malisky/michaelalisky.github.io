/**
 * Newsletter head helper
 * Dynamically generates the head content for newsletter pages
 */

function createNewsletterHead() {
  const head = document.head;
  
  // Prevent duplicate execution
  if (document.querySelector('link[href="../css/style.css"]')) {
    console.log('Newsletter-head.js: Head elements already exist, skipping');
    return;
  }
  
  // Create and append all the common elements
  const elements = [
    // Meta tags
    { tag: 'meta', attrs: { charset: 'UTF-8' } },
    { tag: 'meta', attrs: { name: 'viewport', content: 'width=device-width, initial-scale=1.0' } },
    
    // CSS files
    { tag: 'link', attrs: { rel: 'stylesheet', href: '../css/style.css' } },
    { tag: 'link', attrs: { href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&display=swap', rel: 'stylesheet' } },
    
    // Favicon
    { tag: 'link', attrs: { href: '../images-optimized/favicon.svg', rel: 'icon', type: 'image/svg+xml' } }
  ];
  
  elements.forEach(({ tag, attrs }) => {
    try {
      const element = document.createElement(tag);
      Object.entries(attrs).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
      head.appendChild(element);
    } catch (error) {
      console.error(`Newsletter-head.js: Failed to create ${tag} element`, error);
    }
  });
  
  // Load and execute scripts in order
  const scripts = [
    '../js/modules/navigation.js',
    '../js/modules/darkMode.js',
    '../js/modules/ui.js',
    '../js/modules/footer.js'
  ];
  
  function loadScript(index) {
    if (index >= scripts.length) {
      return;
    }
    
    const script = document.createElement('script');
    script.type = 'module';
    script.src = scripts[index];
    script.onload = () => {
      loadScript(index + 1);
    };
    script.onerror = (error) => {
      console.error(`Newsletter-head.js: Failed to load ${scripts[index]}`, error);
      loadScript(index + 1);
    };
    head.appendChild(script);
  }
  
  loadScript(0);
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createNewsletterHead);
} else {
  createNewsletterHead();
} 
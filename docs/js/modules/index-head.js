/**
 * Index head helper
 * Dynamically generates the head content for the main index page
 */

function createIndexHead() {
  const head = document.head;
  
  // Prevent duplicate execution
  if (document.querySelector('link[href="css/style.css"]')) {
    console.log('Index-head.js: Head elements already exist, skipping');
    return;
  }
  
  // Create and append all the common elements
  const elements = [
    // Meta tags
    { tag: 'meta', attrs: { charset: 'UTF-8' } },
    { tag: 'meta', attrs: { name: 'viewport', content: 'width=device-width, initial-scale=1.0' } },
    
    // CSS files
    { tag: 'link', attrs: { rel: 'stylesheet', href: 'css/style.css' } },
    { tag: 'link', attrs: { href: 'https://unpkg.com/leaflet/dist/leaflet.css', rel: 'stylesheet' } },
    { tag: 'link', attrs: { href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&display=swap', rel: 'stylesheet' } },
    
    // Favicon
    { tag: 'link', attrs: { href: 'images-optimized/favicon.svg', rel: 'icon', type: 'image/svg+xml' } }
  ];
  
  elements.forEach(({ tag, attrs }) => {
    try {
      const element = document.createElement(tag);
      Object.entries(attrs).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
      head.appendChild(element);
    } catch (error) {
      console.error(`Index-head.js: Failed to create ${tag} element`, error);
    }
  });
  
  // Load external scripts first, then modules
  const externalScripts = [
    'https://unpkg.com/leaflet/dist/leaflet.js'
  ];
  
  const moduleScripts = [
    'js/modules/navigation.js',
    'js/modules/darkMode.js',
    'js/modules/ui.js',
    'js/modules/mapInit.js',
    'js/modules/mapMarkers.js',
    'js/modules/footer.js'
  ];
  
  function loadExternalScripts(index) {
    if (index >= externalScripts.length) {
      loadModuleScripts(0);
      return;
    }
    
    const script = document.createElement('script');
    script.src = externalScripts[index];
    script.onload = () => {
      loadExternalScripts(index + 1);
    };
    script.onerror = (error) => {
      console.error(`Index-head.js: Failed to load external script ${externalScripts[index]}`, error);
      loadExternalScripts(index + 1);
    };
    head.appendChild(script);
  }
  
  function loadModuleScripts(index) {
    if (index >= moduleScripts.length) {
      return;
    }
    
    const script = document.createElement('script');
    script.type = 'module';
    script.src = moduleScripts[index];
    script.onload = () => {
      loadModuleScripts(index + 1);
    };
    script.onerror = (error) => {
      console.error(`Index-head.js: Failed to load module ${moduleScripts[index]}`, error);
      loadModuleScripts(index + 1);
    };
    head.appendChild(script);
  }
  
  loadExternalScripts(0);
}

// Initialize immediately
createIndexHead(); 
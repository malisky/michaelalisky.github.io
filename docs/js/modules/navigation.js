/**
 * Navigation module
 * Handles the sticky navigation bar for all pages
 */

// Track initialization to prevent duplicates
let navigationInitialized = false;

// Generate and insert the sticky navigation bar
function createStickyNavigation() {
  // Prevent duplicate execution
  if (document.querySelector('nav.sticky')) {
    console.log('Navigation.js: Sticky nav already exists, skipping');
    return;
  }

  const header = document.querySelector('header');
  if (!header) {
    console.log('Navigation.js: Header not found, will retry');
    setTimeout(createStickyNavigation, 100);
    return;
  }

  // Determine page type and set appropriate paths
  const isNewsletterPage = window.location.pathname.includes('/newsletter/');
  const isKazakhstanNewsletter = window.location.pathname.includes('/kz-');
  
  // Set paths based on page type
  const homePath = isNewsletterPage ? '/' : '/';
  const researchPath = isNewsletterPage ? '../research.html' : 'research.html';

  const nav = document.createElement('nav');
  nav.className = 'sticky';
  
  let navHTML = `
    <a href="${homePath}">Home</a>
    <a href="${researchPath}">Research</a>
  `;
  
  // Add Kazakhstan back tab if it's a Kazakhstan newsletter
  if (isKazakhstanNewsletter) {
    navHTML += `
      <a href="../newsletter/kazakhstan.html" class="kz-back-tab" style="position: relative; display: flex; align-items: center; justify-content: center; min-width: 60px; text-align: center; padding: 0.2rem 0.7rem;">
        <img src="https://media.tenor.com/83thdVyblF8AAAAM/thumbs-up-borat.gif" alt="Borat Thumbs Up" class="borat-gif" style="width:72px;height:72px;max-width:72px;max-height:72px;object-fit:contain;vertical-align:middle;border-radius:3px;background:#fffbe0;border:1px solid #ffd600;display:block;padding:0;flex-shrink:0;transition: none;" />
        <span class="kz-back-overlay">Back to Kazakhstan</span>
      </a>
    `;
  }
  
  navHTML += `
    <button id="night-toggle" class="nav-toggle" title="Toggle dark mode">🌓</button>
  `;
  
  nav.innerHTML = navHTML;

  // Insert inside header
  header.appendChild(nav);
}

// Add back to map button for newsletter pages
function addBackToMapButton() {
  // Only add on newsletter pages
  if (!window.location.pathname.includes('/newsletter/')) {
    return;
  }

  // Prevent duplicate execution
  if (document.querySelector('.back-to-map')) {
    return;
  }

  const newsletterCard = document.querySelector('.newsletter-card');
  if (!newsletterCard) {
    setTimeout(addBackToMapButton, 100);
    return;
  }

  const backButton = document.createElement('a');
  backButton.href = '/';
  backButton.className = 'back-to-map';
  backButton.title = 'Back to Map';
  backButton.textContent = 'Back to Map';

  // Insert at the end of the newsletter card
  newsletterCard.appendChild(backButton);
}

// Run immediately, but only once
if (!navigationInitialized) {
  navigationInitialized = true;
  createStickyNavigation();
  addBackToMapButton();
}

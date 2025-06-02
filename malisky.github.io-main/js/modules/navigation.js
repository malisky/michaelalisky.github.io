/**
 * Newsletter navigation
 * Handles the previous/next navigation between newsletter posts
 */

// Initialize newsletter navigation
function initNewsletterNavigation() {
  // Check if we're on a newsletter page
  const currentPath = window.location.pathname;
  const pathMatch = currentPath.match(/\/newsletter\/(.+)\.html/);
  
  if (!pathMatch || !pathMatch[1]) {
    return; // Not on a newsletter page
  }
  
  // Get the navigation section
  const navSection = document.querySelector('.newsletter-navigation');
  if (!navSection) {
    return; // No navigation section found
  }
  
  // Get navigation links
  const prevLink = navSection.querySelector('.nav-arrow.prev');
  const nextLink = navSection.querySelector('.nav-arrow.next');
  
  if (!prevLink || !nextLink) {
    return; // Missing navigation links
  }
  
  // Load newsletter data and set up navigation
  loadNewsletterData()
    .then(data => setupNavigationLinks(data, pathMatch[1], prevLink, nextLink))
    .catch(error => console.error('Error setting up navigation:', error));
}

// Load newsletter data from JSON file
async function loadNewsletterData() {
  try {
    const response = await fetch('/newsletter/newsletters.json');
    return await response.json();
  } catch (error) {
    console.error('Error loading newsletter data:', error);
    throw error;
  }
}

// Set up navigation links based on chronological order
function setupNavigationLinks(newsletters, currentId, prevLink, nextLink) {
  if (!Array.isArray(newsletters)) {
    console.error('Invalid newsletter data format');
    return;
  }
  
  // Sort newsletters chronologically by date
  newsletters.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Find current newsletter index
  const currentIndex = newsletters.findIndex(item => item.id === currentId);
  if (currentIndex === -1) {
    console.warn(`Current newsletter with ID '${currentId}' not found in data`);
    return;
  }
  
  // Handle previous link
  if (currentIndex > 0) {
    const prevItem = newsletters[currentIndex - 1];
    prevLink.href = prevItem.link;
    prevLink.title = `Previous: ${prevItem.title}`;
  } else {
    prevLink.style.visibility = 'hidden';
  }
  
  // Handle next link
  if (currentIndex < newsletters.length - 1) {
    const nextItem = newsletters[currentIndex + 1];
    nextLink.href = nextItem.link;
    nextLink.title = `Next: ${nextItem.title}`;
  } else {
    nextLink.style.visibility = 'hidden';
  }
}

/**
 * Newsletter navigation
 * Handles the previous/next navigation between newsletter posts
 */

function initNewsletterNavigation() {
  const currentPath = window.location.pathname;
  const pathMatch = currentPath.match(/\/newsletter\/(.+)\.html/);

  if (!pathMatch || !pathMatch[1]) return;

  const navSection = document.querySelector('.newsletter-navigation');
  if (!navSection) return;

  const prevLink = navSection.querySelector('.nav-arrow.prev');
  const nextLink = navSection.querySelector('.nav-arrow.next');

  if (!prevLink || !nextLink) return;

  loadNewsletterData()
    .then(data => setupNavigationLinks(data, pathMatch[1], prevLink, nextLink))
    .catch(error => console.error('Error setting up navigation:', error));
}

async function loadNewsletterData() {
  try {
    const response = await fetch('/newsletter/newsletters.json');
    return await response.json();
  } catch (error) {
    console.error('Error loading newsletter data:', error);
    throw error;
  }
}

function setupNavigationLinks(newsletters, currentId, prevLink, nextLink) {
  if (!Array.isArray(newsletters)) {
    console.error('Invalid newsletter data format');
    return;
  }

  newsletters.sort((a, b) => new Date(a.date) - new Date(b.date));

  const currentIndex = newsletters.findIndex(item => item.id === currentId);
  if (currentIndex === -1) {
    console.warn(`Current newsletter with ID '${currentId}' not found in data`);
    return;
  }

  if (currentIndex > 0) {
    const prevItem = newsletters[currentIndex - 1];
    prevLink.href = prevItem.link;
    prevLink.title = `Previous: ${prevItem.title}`;
    prevLink.style.visibility = 'visible';
  } else {
    prevLink.style.visibility = 'hidden';
  }

  if (currentIndex < newsletters.length - 1) {
    const nextItem = newsletters[currentIndex + 1];
    nextLink.href = nextItem.link;
    nextLink.title = `Next: ${nextItem.title}`;
    nextLink.style.visibility = 'visible';
  } else {
    nextLink.style.visibility = 'hidden';
  }
}

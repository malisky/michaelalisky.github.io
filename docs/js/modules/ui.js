/**
 * UI elements like scroll-to-top button and navigation elements
 * Handles UI interactions and improvements
 */

function initScrollToTop() {
  const scrollTopButton = document.querySelector('.scroll-top');

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      scrollTopButton.classList.add('visible');
    } else {
      scrollTopButton.classList.remove('visible');
    }
  });

  scrollTopButton?.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

function initActiveNavLinks() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('nav a');

  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');

    if (
      linkPath === currentPath ||
      (currentPath.includes('/newsletter/') && linkPath === '/newsletter.html') ||
      (currentPath.includes('/research/') && linkPath === '/research.html')
    ) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function fixNewsletterLinks() {
  const newsletterLinks = document.querySelectorAll('.card p a');
  newsletterLinks.forEach(link => {
    const nextSibling = link.nextSibling;
    if (nextSibling && nextSibling.nodeType === Node.ELEMENT_NODE && nextSibling.tagName === 'BR') {
      nextSibling.remove();
    }
  });
}

function initCardHoverTimeout() {
  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    let hoverTimeout;

    card.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout);
      card.classList.add('hovering');
    });

    card.addEventListener('mouseleave', () => {
      hoverTimeout = setTimeout(() => {
        card.classList.remove('hovering');
      }, 1000); // Delay of 1 second
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollToTop?.();
  initActiveNavLinks?.();
  fixNewsletterLinks?.();
  initCardHoverTimeout();
});

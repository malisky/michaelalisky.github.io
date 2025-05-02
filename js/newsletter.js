
function scrollLeft() {
  const container = document.getElementById('newsletter-container');
  container.scrollBy({ left: -400, behavior: 'smooth' });
}

function scrollRight() {
  const container = document.getElementById('newsletter-container');
  container.scrollBy({ left: 400, behavior: 'smooth' });
}

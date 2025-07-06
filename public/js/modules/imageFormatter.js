// imageFormatter.js
// Automatically formats images in newsletter-card: landscape = standalone, portrait = grid

document.addEventListener('DOMContentLoaded', () => {
  const card = document.querySelector('.newsletter-card');
  if (!card) return;

  // Get all direct <img> elements inside the card (not already in .image-grid)
  const allImages = Array.from(card.querySelectorAll('img'));
  if (allImages.length === 0) return;

  // Helper: is portrait?
  function isPortrait(img) {
    return img.naturalHeight > img.naturalWidth;
  }

  // Helper: create grid wrapper
  function createGrid(images) {
    const grid = document.createElement('div');
    grid.className = 'image-grid';
    images.forEach(img => {
      const container = document.createElement('div');
      container.className = 'image-container';
      container.appendChild(img);
      grid.appendChild(container);
    });
    return grid;
  }

  // Process images: group consecutive portraits, leave landscapes standalone
  let i = 0;
  while (i < allImages.length) {
    const img = allImages[i];
    // Only process images not already in .image-container or .image-grid
    if (img.closest('.image-container, .image-grid')) {
      i++;
      continue;
    }
    if (isPortrait(img)) {
      // Start a portrait group
      const portraitGroup = [img];
      let j = i + 1;
      while (j < allImages.length && isPortrait(allImages[j]) && !allImages[j].closest('.image-container, .image-grid')) {
        portraitGroup.push(allImages[j]);
        j++;
      }
      // Replace in DOM
      const grid = createGrid(portraitGroup);
      img.parentNode.insertBefore(grid, img);
      portraitGroup.forEach(pimg => {
        if (pimg.parentNode !== grid) pimg.parentNode.removeChild(pimg);
        grid.appendChild(pimg.closest('.image-container') || pimg);
      });
      i = j;
    } else {
      // Landscape: wrap in .image-container if not already
      if (!img.parentNode.classList.contains('image-container')) {
        const container = document.createElement('div');
        container.className = 'image-container';
        img.parentNode.insertBefore(container, img);
        container.appendChild(img);
      }
      i++;
    }
  }
}); 
// Enhanced newsletter.js with GSAP animations and cursor-based scrolling
document.addEventListener("DOMContentLoaded", async function() {
  const newsletterToCoords = {
    "taiwan.html": [23.6978, 120.9605],
    "mongolia.html": [47.8864, 106.9057],
    "spain.html": [40.4168, -3.7038],
    "georgia.html": [41.7151, 44.8271],
    "slovenia.html": [46.1512, 14.9955],
    "turkey.html": [39.9208, 32.8541],
    "november.html": [48.2082, 16.3738]
  };
  
  // Improved data loading with error handling
  try {
    // Load newsletter data
    const response = await fetch("/newsletter/newsletters.json");
    if (!response.ok) {
      throw new Error(`Failed to fetch newsletters: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Sort by date (newest first)
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Get DOM elements
    const container = document.getElementById("newsletter-container");
    const wrapper = document.querySelector(".newsletter-scroll-wrapper");
    const mapFrame = document.getElementById("map-frame");
    
    if (!container || !wrapper) {
      throw new Error("Required DOM elements not found");
    }
    
    // Create newsletter cards
    data.forEach(entry => {
      const slug = entry.link.replace(/^.*\//, "");
      const coords = newsletterToCoords[slug] || [30, 10];
      
      // Create card with additional blurb element
      const card = document.createElement("div");
      card.classList.add("newsletter-entry");
      card.setAttribute("data-slug", slug);
      card.setAttribute("data-coords", JSON.stringify(coords));
      
      // Include blurb that will be revealed on hover
      card.innerHTML = `
        <div class="card-inner">
          <div class="card-front">
            <img src="${entry.image}" alt="${entry.title}" loading="lazy" />
            <h3>${entry.title}</h3>
            <p class="date">${entry.date || ''}</p>
          </div>
          <div class="card-back">
            <p class="blurb">${entry.blurb || 'Read more'}</p>
          </div>
        </div>
      `;
      
      // Set up GSAP hover animations
      if (window.gsap) {
        setupGsapAnimations(card);
      }
      
      // Click handler with improved error handling and accessibility
      card.addEventListener("click", (e) => {
        e.preventDefault();
        
        // Map integration with postMessage
        if (mapFrame && mapFrame.contentWindow) {
          try {
            mapFrame.contentWindow.postMessage(
              { 
                type: "select-location",
                slug: slug, 
                coords: coords 
              }, 
              window.location.origin
            );
          } catch (err) {
            console.warn("Map communication failed:", err);
          }
        }
        
        // Add blur effect
        document.body.classList.add("blurred");
        
        // Navigate after animation completes
        setTimeout(() => {
          window.location.href = `/newsletter/${slug}`;
        }, 1200);
      });
      
      // Add keyboard accessibility
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `Read newsletter: ${entry.title}`);
      
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.click();
        }
      });
      
      container.appendChild(card);
    });
    
    // Implement cursor-based scrolling
    setupCursorBasedScrolling(wrapper, container);
    
    // Set up manual scroll controls with arrows
    const leftArrow = document.getElementById("arrow-left");
    const rightArrow = document.getElementById("arrow-right");
    
    if (leftArrow) {
      leftArrow.onclick = () => {
        container.scrollBy({ left: -400, behavior: "smooth" });
      };
      
      // Keyboard accessibility for arrows
      leftArrow.setAttribute("tabindex", "0");
      leftArrow.setAttribute("role", "button");
      leftArrow.setAttribute("aria-label", "Scroll newsletters left");
    }
    
    if (rightArrow) {
      rightArrow.onclick = () => {
        container.scrollBy({ left: 400, behavior: "smooth" });
      };
      
      // Keyboard accessibility for arrows
      rightArrow.setAttribute("tabindex", "0");
      rightArrow.setAttribute("role", "button");
      rightArrow.setAttribute("aria-label", "Scroll newsletters right");
    }
    
  } catch (error) {
    console.error("Newsletter initialization failed:", error);
    const container = document.getElementById("newsletter-container");
    if (container) {
      container.innerHTML = `
        <div class="error-message">
          <p>Error. Please try again later.</p>
        </div>
      `;
    }
  }
});

// Sets up GSAP animations for a newsletter card
function setupGsapAnimations(card) {
  const cardInner = card.querySelector(".card-inner");
  const cardFront = card.querySelector(".card-front");
  const cardBack = card.querySelector(".card-back");
  
  if (!cardInner || !cardFront || !cardBack) return;
  
  // Initialize GSAP properties
  gsap.set(cardBack, { opacity: 0 });
  
  // Create hover animations
  const tl = gsap.timeline({ paused: true });
  
  tl.to(cardFront, {
    y: -10,
    opacity: 0.8, 
    duration: 0.3,
    ease: "power2.out"
  })
  .to(cardBack, {
    opacity: 1,
    y: 0,
    duration: 0.3,
    ease: "power2.out"
  }, "-=0.2");
  
  // Mouse events to trigger timeline
  card.addEventListener("mouseenter", () => tl.play());
  card.addEventListener("mouseleave", () => tl.reverse());
  
  // Touch device support
  card.addEventListener("touchstart", () => {
    if (tl.reversed() || !tl.isActive()) {
      tl.play();
    } else {
      tl.reverse();
    }
  });
}

// Implements cursor-based scrolling speed
function setupCursorBasedScrolling(wrapper, container) {
  if (!wrapper || !container) return;
  
  let isScrolling = true;
  let scrollSpeed = 0;
  let maxSpeed = 3;
  let centerX;
  let animationFrameId;
  
  // Calculate center point
  function updateCenter() {
    const rect = wrapper.getBoundingClientRect();
    centerX = rect.left + rect.width / 2;
  }
  
  // Update center on resize
  window.addEventListener("resize", updateCenter);
  updateCenter();
  
  // Mouse movement tracking
  wrapper.addEventListener("mousemove", (e) => {
    if (!isScrolling) return;
    
    // Calculate distance from center (as percentage of half width)
    const distanceFromCenter = (e.clientX - centerX) / (wrapper.offsetWidth / 2);
    
    // Set scroll speed based on distance from center
    scrollSpeed = distanceFromCenter * maxSpeed;
  });
  
  // Pause scrolling when mouse enters
  wrapper.addEventListener("mouseenter", () => {
    isScrolling = true;
  });
  
  // Reset scrolling when mouse leaves
  wrapper.addEventListener("mouseleave", () => {
    scrollSpeed = 0.5; // Slow default scroll
    isScrolling = true;
  });
  
  // Smooth scrolling function
  function smoothScroll() {
    if (isScrolling) {
      container.scrollLeft += scrollSpeed;
      
      // Loop back to start when reaching the end
      if (container.scrollLeft >= container.scrollWidth / 2) {
        container.scrollLeft = 0;
      } else if (container.scrollLeft <= 0 && scrollSpeed < 0) {
        container.scrollLeft = container.scrollWidth / 2 - 1;
      }
    }
    animationFrameId = requestAnimationFrame(smoothScroll);
  }
  
  // Start the animation
  smoothScroll();
  
  // Duplicate the content for continuous scrolling
  // (Only if we have enough items)
  if (container.children.length > 2) {
    container.innerHTML += container.innerHTML;
  }
  
  // Clean up function - would be called if the component unmounts
  return function cleanup() {
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener("resize", updateCenter);
  };
}

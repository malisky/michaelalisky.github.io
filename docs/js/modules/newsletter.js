// Newsletter signup functionality
class NewsletterSignup {
  constructor() {
    this.modal = null;
    this.overlay = null;
    this.form = null;
    this.emailInput = null;
    this.submitButton = null;
    this.messageDiv = null;
    this.init();
  }

  init() {
    this.createModal();
    this.bindEvents();
  }

  createModal() {
    // Create modal overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'newsletter-modal-overlay';
    
    // Create modal content
    this.modal = document.createElement('div');
    this.modal.className = 'newsletter-modal';
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'newsletter-modal-close';
    closeButton.innerHTML = '×';
    closeButton.setAttribute('aria-label', 'Close newsletter signup');
    
    // Create modal content
    this.modal.innerHTML = `
      <h3>Subscribe to da emails 🤌</h3>
      <p>You may be wondering why I didn't just host this blog on Substack, to which I would say, "I do not know." Note that I'm not sure how to make it so you can unsubscribe, so proceed at your own <b>peril.</b></p>
      <form class="newsletter-form">
        <input type="text" placeholder="Your name (optional)" class="name-input">
        <input type="email" placeholder="Enter your email address" required>
        <button type="submit">Subscribe</button>
      </form>
      <div class="newsletter-message" style="display: none;"></div>
    `;
    
    // Insert close button
    this.modal.insertBefore(closeButton, this.modal.firstChild);
    
    // Add modal to overlay
    this.overlay.appendChild(this.modal);
    
    // Add overlay to body
    document.body.appendChild(this.overlay);
    
    // Get references to form elements
    this.form = this.modal.querySelector('.newsletter-form');
    this.nameInput = this.form.querySelector('.name-input');
    this.emailInput = this.form.querySelector('input[type="email"]');
    this.submitButton = this.form.querySelector('button[type="submit"]');
    this.messageDiv = this.modal.querySelector('.newsletter-message');
  }

  bindEvents() {
    // Close button event
    const closeButton = this.modal.querySelector('.newsletter-modal-close');
    closeButton.addEventListener('click', () => this.closeModal());
    
    // Overlay click to close
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.closeModal();
      }
    });
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.closeModal();
      }
    });
    
    // Form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  openModal() {
    this.overlay.classList.add('active');
    this.emailInput.focus();
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  closeModal() {
    this.overlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
    this.clearMessage();
    this.form.reset();
  }

  isOpen() {
    return this.overlay.classList.contains('active');
  }

  showMessage(message, type = 'success') {
    this.messageDiv.textContent = message;
    this.messageDiv.className = `newsletter-message ${type}`;
    this.messageDiv.style.display = 'block';
  }

  clearMessage() {
    this.messageDiv.style.display = 'none';
    this.messageDiv.textContent = '';
  }

  setLoading(loading) {
    this.submitButton.disabled = loading;
    this.submitButton.textContent = loading ? 'Subscribing...' : 'Subscribe';
  }

  async handleSubmit() {
    const name = this.nameInput.value.trim();
    const email = this.emailInput.value.trim();
    
    if (!email) {
      this.showMessage('Please enter your email address.', 'error');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showMessage('Please enter a valid email address.', 'error');
      return;
    }
    
    this.setLoading(true);
    this.clearMessage();
    
    try {
      const response = await fetch('/api/newsletter-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        this.showMessage(data.message, 'success');
        // Close modal after 2 seconds on success
        setTimeout(() => {
          this.closeModal();
        }, 2000);
      } else {
        this.showMessage(data.message || 'An error occurred. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Newsletter signup error:', error);
      this.showMessage('Network error. Please check your connection and try again.', 'error');
    } finally {
      this.setLoading(false);
    }
  }
}

// Initialize newsletter signup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.newsletterSignup = new NewsletterSignup();
});

// Export for use in other modules
export { NewsletterSignup }; 
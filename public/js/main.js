/**
 * MixTrip Summer - Main JavaScript
 * Contains core functionality for the application
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      
      // Toggle animation for the hamburger icon
      const bars = mobileMenuToggle.querySelectorAll('.bar');
      bars.forEach(bar => bar.classList.toggle('active'));
      
      // Toggle aria-expanded attribute for accessibility
      const expanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true' || false;
      mobileMenuToggle.setAttribute('aria-expanded', !expanded);
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (event) => {
      if (!mobileMenuToggle.contains(event.target) && !mobileMenu.contains(event.target)) {
        if (mobileMenu.classList.contains('active')) {
          mobileMenu.classList.remove('active');
          
          const bars = mobileMenuToggle.querySelectorAll('.bar');
          bars.forEach(bar => bar.classList.remove('active'));
          
          mobileMenuToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }
  
  // Form validation
  const forms = document.querySelectorAll('form[data-validate="true"]');
  
  forms.forEach(form => {
    form.addEventListener('submit', (event) => {
      let isValid = true;
      
      // Get all required inputs
      const requiredInputs = form.querySelectorAll('[required]');
      
      requiredInputs.forEach(input => {
        // Remove previous error messages
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
          existingError.remove();
        }
        
        // Check if input is empty
        if (!input.value.trim()) {
          event.preventDefault();
          isValid = false;
          
          // Create error message
          const errorMessage = document.createElement('div');
          errorMessage.className = 'error-message';
          errorMessage.textContent = 'This field is required';
          
          // Add error styling
          input.classList.add('error');
          
          // Insert error message after input
          input.insertAdjacentElement('afterend', errorMessage);
        } else {
          // Remove error styling if input is valid
          input.classList.remove('error');
        }
        
        // Email validation
        if (input.type === 'email' && input.value.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(input.value.trim())) {
            event.preventDefault();
            isValid = false;
            
            // Create error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = 'Please enter a valid email address';
            
            // Add error styling
            input.classList.add('error');
            
            // Insert error message after input
            input.insertAdjacentElement('afterend', errorMessage);
          }
        }
        
        // Password validation
        if (input.type === 'password' && input.dataset.minLength) {
          const minLength = parseInt(input.dataset.minLength);
          if (input.value.length < minLength) {
            event.preventDefault();
            isValid = false;
            
            // Create error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = `Password must be at least ${minLength} characters`;
            
            // Add error styling
            input.classList.add('error');
            
            // Insert error message after input
            input.insertAdjacentElement('afterend', errorMessage);
          }
        }
      });
      
      // Check password confirmation if exists
      const passwordConfirm = form.querySelector('[data-confirm-password]');
      if (passwordConfirm) {
        const passwordField = form.querySelector('#' + passwordConfirm.dataset.confirmPassword);
        
        if (passwordField && passwordConfirm.value !== passwordField.value) {
          event.preventDefault();
          isValid = false;
          
          // Remove previous error messages
          const existingError = passwordConfirm.parentNode.querySelector('.error-message');
          if (existingError) {
            existingError.remove();
          }
          
          // Create error message
          const errorMessage = document.createElement('div');
          errorMessage.className = 'error-message';
          errorMessage.textContent = 'Passwords do not match';
          
          // Add error styling
          passwordConfirm.classList.add('error');
          
          // Insert error message after input
          passwordConfirm.insertAdjacentElement('afterend', errorMessage);
        }
      }
      
      return isValid;
    });
  });
  
  // Flash message dismissal
  const flashMessages = document.querySelectorAll('.flash-message');
  
  flashMessages.forEach(message => {
    const dismissButton = message.querySelector('.dismiss-button');
    
    if (dismissButton) {
      dismissButton.addEventListener('click', () => {
        message.classList.add('fade-out');
        
        setTimeout(() => {
          message.remove();
        }, 300);
      });
    }
    
    // Auto dismiss after 5 seconds
    if (message.dataset.autoDismiss === 'true') {
      setTimeout(() => {
        message.classList.add('fade-out');
        
        setTimeout(() => {
          message.remove();
        }, 300);
      }, 5000);
    }
  });
  
  // Initialize tooltips if any
  const tooltips = document.querySelectorAll('[data-tooltip]');
  
  tooltips.forEach(tooltip => {
    tooltip.addEventListener('mouseenter', () => {
      const tooltipText = tooltip.dataset.tooltip;
      
      // Create tooltip element
      const tooltipElement = document.createElement('div');
      tooltipElement.className = 'tooltip';
      tooltipElement.textContent = tooltipText;
      
      // Position tooltip above element
      const rect = tooltip.getBoundingClientRect();
      tooltipElement.style.bottom = `${window.innerHeight - rect.top + 10}px`;
      tooltipElement.style.left = `${rect.left + rect.width / 2}px`;
      tooltipElement.style.transform = 'translateX(-50%)';
      
      // Add tooltip to body
      document.body.appendChild(tooltipElement);
      
      // Store reference to tooltip
      tooltip.tooltipElement = tooltipElement;
    });
    
    tooltip.addEventListener('mouseleave', () => {
      // Remove tooltip
      if (tooltip.tooltipElement) {
        tooltip.tooltipElement.remove();
        tooltip.tooltipElement = null;
      }
    });
  });
  
  // Lazy loading for images
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
          
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
      }
      
      img.classList.add('loaded');
    });
  }
});

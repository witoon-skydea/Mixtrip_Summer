/**
 * MixTrip Summer - UI Module
 * Handles UI-related functionality
 */

const UI = (function() {
  // Private variables and functions
  let toastContainer = null;
  let activeModals = [];
  
  /**
   * Show a toast message
   * @param {string} message - Message text
   * @param {string} type - Message type (success, error, warning, info)
   * @param {number} duration - Duration in ms
   */
  function toast(message, type = 'info', duration = 5000) {
    // Create toast container if it doesn't exist
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastElement = document.createElement('div');
    toastElement.className = `toast toast-${type}`;
    toastElement.innerHTML = `
      <div class="toast-content">
        <span class="toast-message">${message}</span>
      </div>
      <button class="toast-close" aria-label="Close">×</button>
    `;
    
    // Add to container
    toastContainer.appendChild(toastElement);
    
    // Show animation
    setTimeout(() => {
      toastElement.classList.add('show');
    }, 10);
    
    // Set up close button
    const closeButton = toastElement.querySelector('.toast-close');
    closeButton.addEventListener('click', () => {
      closeToast(toastElement);
    });
    
    // Auto close after duration
    if (duration) {
      setTimeout(() => {
        closeToast(toastElement);
      }, duration);
    }
    
    return toastElement;
  }
  
  /**
   * Close a toast
   * @param {HTMLElement} toastElement - Toast element to close
   */
  function closeToast(toastElement) {
    toastElement.classList.remove('show');
    toastElement.classList.add('hide');
    
    setTimeout(() => {
      if (toastElement.parentNode) {
        toastElement.parentNode.removeChild(toastElement);
      }
    }, 300); // Match CSS transition duration
  }
  
  /**
   * Show an alert dialog
   * @param {string} message - Message text
   * @param {string} type - Message type (success, error, warning, info)
   * @param {Function} callback - Callback function when alert is closed
   */
  function alert(message, type = 'info', callback) {
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = `alert-modal alert-${type}`;
    modal.innerHTML = `
      <div class="alert-content">
        <div class="alert-message">${message}</div>
        <div class="alert-actions">
          <button class="btn btn-primary alert-confirm">OK</button>
        </div>
      </div>
    `;
    
    // Add to body
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
    
    // Track active modal
    activeModals.push({ modal, backdrop });
    
    // Center modal
    centerModal(modal);
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    // Set up confirm button
    const confirmButton = modal.querySelector('.alert-confirm');
    confirmButton.focus();
    
    confirmButton.addEventListener('click', () => {
      closeModal(modal, backdrop);
      if (typeof callback === 'function') {
        callback(true);
      }
    });
    
    // Close on Escape key
    const escHandler = function(event) {
      if (event.key === 'Escape') {
        closeModal(modal, backdrop);
        if (typeof callback === 'function') {
          callback(false);
        }
        document.removeEventListener('keydown', escHandler);
      }
    };
    
    document.addEventListener('keydown', escHandler);
    
    return { modal, backdrop };
  }
  
  /**
   * Show a confirm dialog
   * @param {string} message - Message text
   * @param {Function} callback - Callback function with result
   * @param {Object} options - Additional options
   */
  function confirm(message, callback, options = {}) {
    const defaults = {
      title: 'Confirm',
      confirmText: 'Yes',
      cancelText: 'No',
      type: 'question'
    };
    
    const settings = { ...defaults, ...options };
    
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = `confirm-modal confirm-${settings.type}`;
    modal.innerHTML = `
      <div class="confirm-content">
        ${settings.title ? `<div class="confirm-title">${settings.title}</div>` : ''}
        <div class="confirm-message">${message}</div>
        <div class="confirm-actions">
          <button class="btn btn-outline confirm-cancel">${settings.cancelText}</button>
          <button class="btn btn-primary confirm-ok">${settings.confirmText}</button>
        </div>
      </div>
    `;
    
    // Add to body
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
    
    // Track active modal
    activeModals.push({ modal, backdrop });
    
    // Center modal
    centerModal(modal);
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    // Set up buttons
    const okButton = modal.querySelector('.confirm-ok');
    const cancelButton = modal.querySelector('.confirm-cancel');
    
    okButton.focus();
    
    okButton.addEventListener('click', () => {
      closeModal(modal, backdrop);
      if (typeof callback === 'function') {
        callback(true);
      }
    });
    
    cancelButton.addEventListener('click', () => {
      closeModal(modal, backdrop);
      if (typeof callback === 'function') {
        callback(false);
      }
    });
    
    // Close on Escape key
    const escHandler = function(event) {
      if (event.key === 'Escape') {
        closeModal(modal, backdrop);
        if (typeof callback === 'function') {
          callback(false);
        }
        document.removeEventListener('keydown', escHandler);
      }
    };
    
    document.addEventListener('keydown', escHandler);
    
    return { modal, backdrop };
  }
  
  /**
   * Center a modal on screen
   * @param {HTMLElement} modal - Modal element
   */
  function centerModal(modal) {
    modal.style.display = 'block';
    modal.style.opacity = '0';
    
    // Give browser time to calculate modal dimensions
    setTimeout(() => {
      const modalHeight = modal.offsetHeight;
      modal.style.marginTop = `-${modalHeight / 2}px`;
      modal.style.opacity = '1';
    }, 10);
  }
  
  /**
   * Close a modal
   * @param {HTMLElement} modal - Modal element
   * @param {HTMLElement} backdrop - Backdrop element
   */
  function closeModal(modal, backdrop) {
    // Remove from active modals
    activeModals = activeModals.filter(item => item.modal !== modal);
    
    // Fade out
    modal.style.opacity = '0';
    backdrop.style.opacity = '0';
    
    // Remove after animation
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
      if (backdrop.parentNode) {
        backdrop.parentNode.removeChild(backdrop);
      }
      
      // Restore body scrolling if no more active modals
      if (activeModals.length === 0) {
        document.body.style.overflow = '';
      }
    }, 300); // Match CSS transition duration
  }
  
  /**
   * Initialize tooltips
   */
  function initTooltips() {
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
  }
  
  /**
   * Initialize dropdown menus
   */
  function initDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
      const toggle = dropdown.querySelector('.dropdown-toggle');
      const menu = dropdown.querySelector('.dropdown-menu');
      
      if (toggle && menu) {
        toggle.addEventListener('click', (event) => {
          event.preventDefault();
          menu.classList.toggle('show');
          
          // Set aria-expanded attribute
          const expanded = menu.classList.contains('show');
          toggle.setAttribute('aria-expanded', expanded);
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
          if (!dropdown.contains(event.target)) {
            menu.classList.remove('show');
            toggle.setAttribute('aria-expanded', 'false');
          }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (event) => {
          if (event.key === 'Escape' && menu.classList.contains('show')) {
            menu.classList.remove('show');
            toggle.setAttribute('aria-expanded', 'false');
          }
        });
      }
    });
  }
  
  /**
   * Initialize mobile menu
   */
  function initMobileMenu() {
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
  }
  
  // Initialize module
  function init() {
    initTooltips();
    initDropdowns();
    initMobileMenu();
  }
  
  // Public API
  return {
    init,
    toast,
    alert,
    confirm,
    closeModal
  };
})();

// Add to MixTrip namespace when it's available
if (typeof MixTrip !== 'undefined') {
  MixTrip.UI = UI;
  
  // Shorthand methods
  MixTrip.toast = UI.toast;
  MixTrip.alert = UI.alert;
  MixTrip.confirm = UI.confirm;
  
  // Initialize when document is ready
  document.addEventListener('DOMContentLoaded', function() {
    UI.init();
  });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UI;
}

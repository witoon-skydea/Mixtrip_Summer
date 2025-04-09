/**
 * MixTrip Summer - Modal Management
 * Handles modal functionality across the application
 */

class ModalManager {
  constructor() {
    this.activeModals = [];
    this.zIndexBase = 1000;
    
    // Close modals on escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.activeModals.length > 0) {
        this.closeTopModal();
      }
    });
    
    // Close modals on outside click
    document.addEventListener('click', (event) => {
      if (this.activeModals.length > 0) {
        const topModal = this.activeModals[this.activeModals.length - 1];
        if (event.target === topModal) {
          this.closeModal(topModal);
        }
      }
    });
    
    // Initialize modals on page load
    this.init();
  }
  
  /**
   * Initialize modals on page load
   */
  init() {
    // Find all modals
    const modals = document.querySelectorAll('.modal');
    
    // Set up each modal
    modals.forEach(modal => {
      // Set initial state
      modal.style.display = 'none';
      
      // Find all open triggers for this modal
      const modalId = modal.id;
      const openTriggers = document.querySelectorAll(`[data-modal="${modalId}"]`);
      
      // Attach open event to triggers
      openTriggers.forEach(trigger => {
        trigger.addEventListener('click', (event) => {
          event.preventDefault();
          this.openModal(modal);
        });
      });
      
      // Attach close events to close buttons
      const closeButtons = modal.querySelectorAll('.modal-close, .modal-cancel');
      closeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
          event.preventDefault();
          this.closeModal(modal);
        });
      });
    });
  }
  
  /**
   * Open a modal
   * @param {HTMLElement} modal - Modal element to open
   */
  openModal(modal) {
    // Set z-index based on active modals
    const zIndex = this.zIndexBase + this.activeModals.length;
    modal.style.zIndex = zIndex;
    
    // Display modal with flex
    modal.style.display = 'flex';
    
    // Add animation class
    setTimeout(() => {
      modal.classList.add('is-active');
    }, 10);
    
    // Add to active modals stack
    this.activeModals.push(modal);
    
    // Prevent body scrolling
    if (this.activeModals.length === 1) {
      document.body.style.overflow = 'hidden';
    }
    
    // Trigger event
    this.triggerEvent('modalOpened', { modal });
  }
  
  /**
   * Close a specific modal
   * @param {HTMLElement} modal - Modal element to close
   */
  closeModal(modal) {
    // Remove active class
    modal.classList.remove('is-active');
    
    // Remove from active modals stack
    const index = this.activeModals.indexOf(modal);
    if (index > -1) {
      this.activeModals.splice(index, 1);
    }
    
    // Hide after animation
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
    
    // Restore body scrolling if no more modals
    if (this.activeModals.length === 0) {
      document.body.style.overflow = '';
    }
    
    // Trigger event
    this.triggerEvent('modalClosed', { modal });
  }
  
  /**
   * Close the top-most modal
   */
  closeTopModal() {
    if (this.activeModals.length > 0) {
      const topModal = this.activeModals[this.activeModals.length - 1];
      this.closeModal(topModal);
    }
  }
  
  /**
   * Close all open modals
   */
  closeAllModals() {
    // Close modals from top to bottom
    while (this.activeModals.length > 0) {
      this.closeTopModal();
    }
  }
  
  /**
   * Trigger a custom event
   * @param {string} eventName - Name of the event
   * @param {object} detail - Event details
   */
  triggerEvent(eventName, detail) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }
  
  /**
   * Create a modal from HTML
   * @param {string} id - Modal ID
   * @param {string} title - Modal title
   * @param {string} content - Modal content
   * @param {object} options - Additional options
   * @returns {HTMLElement} - Created modal element
   */
  createModal(id, title, content, options = {}) {
    // Default options
    const defaults = {
      closable: true,
      width: 'auto',
      afterCreate: null
    };
    
    // Merge options
    const settings = { ...defaults, ...options };
    
    // Create modal element
    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'modal';
    
    // Create modal HTML
    modal.innerHTML = `
      <div class="modal-dialog" style="width: ${settings.width}">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
            ${settings.closable ? '<button class="modal-close">&times;</button>' : ''}
          </div>
          <div class="modal-body">${content}</div>
        </div>
      </div>
    `;
    
    // Add to document
    document.body.appendChild(modal);
    
    // Set up event handlers
    this.init();
    
    // Call afterCreate callback if provided
    if (typeof settings.afterCreate === 'function') {
      settings.afterCreate(modal);
    }
    
    return modal;
  }
  
  /**
   * Show an alert modal
   * @param {string} message - Alert message
   * @param {string} title - Alert title
   * @param {function} callback - Callback function after closing
   */
  alert(message, title = 'Alert', callback = null) {
    const modalId = 'modal-alert-' + Date.now();
    const content = `
      <p>${message}</p>
      <div class="modal-footer">
        <button class="btn btn-primary modal-close">OK</button>
      </div>
    `;
    
    const modal = this.createModal(modalId, title, content);
    
    // Open modal
    this.openModal(modal);
    
    // Set up callback
    if (callback) {
      document.addEventListener('modalClosed', function handler(event) {
        if (event.detail.modal === modal) {
          callback();
          document.removeEventListener('modalClosed', handler);
        }
      });
    }
  }
  
  /**
   * Show a confirm modal
   * @param {string} message - Confirm message
   * @param {string} title - Confirm title
   * @param {function} callback - Callback function with result
   */
  confirm(message, title = 'Confirm', callback = null) {
    const modalId = 'modal-confirm-' + Date.now();
    const content = `
      <p>${message}</p>
      <div class="modal-footer">
        <button class="btn btn-outline modal-cancel">Cancel</button>
        <button class="btn btn-primary" id="${modalId}-confirm">Confirm</button>
      </div>
    `;
    
    const modal = this.createModal(modalId, title, content);
    
    // Set up confirm button
    const confirmButton = document.getElementById(`${modalId}-confirm`);
    confirmButton.addEventListener('click', () => {
      this.closeModal(modal);
      if (callback) callback(true);
    });
    
    // Set up cancel button
    modal.querySelector('.modal-cancel').addEventListener('click', () => {
      if (callback) callback(false);
    });
    
    // Open modal
    this.openModal(modal);
  }
}

// Initialize modal manager on page load
document.addEventListener('DOMContentLoaded', () => {
  window.modalManager = new ModalManager();
});

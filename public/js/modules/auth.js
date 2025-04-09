/**
 * MixTrip Summer - Auth Module
 * Handles authentication related functionality
 */

const Auth = (function() {
  // Private variables and functions
  let currentUser = null;
  
  /**
   * Check if user is logged in
   * @returns {boolean} Login status
   */
  function isLoggedIn() {
    return document.body.classList.contains('user-logged-in') || Boolean(currentUser);
  }
  
  /**
   * Set current user data
   * @param {Object} userData - User data
   */
  function setCurrentUser(userData) {
    currentUser = userData;
    
    // Also store in session storage for persistence
    if (userData && MixTrip.supports.sessionStorage) {
      sessionStorage.setItem('currentUser', JSON.stringify(userData));
    }
  }
  
  /**
   * Get current user data
   * @returns {Object|null} User data or null if not logged in
   */
  function getCurrentUser() {
    // Try to get from memory first
    if (currentUser) {
      return currentUser;
    }
    
    // Try to get from session storage
    if (MixTrip.supports.sessionStorage) {
      const storedUser = sessionStorage.getItem('currentUser');
      if (storedUser) {
        try {
          currentUser = JSON.parse(storedUser);
          return currentUser;
        } catch (e) {
          console.error('Failed to parse stored user data', e);
        }
      }
    }
    
    return null;
  }
  
  /**
   * Log user out
   * @param {boolean} redirect - Whether to redirect after logout
   */
  function logout(redirect = true) {
    // Clear stored user data
    currentUser = null;
    
    if (MixTrip.supports.sessionStorage) {
      sessionStorage.removeItem('currentUser');
    }
    
    // Remove auth cookie
    MixTripUtils.deleteCookie('token');
    
    // Redirect to home page or login page
    if (redirect) {
      window.location.href = '/auth/logout';
    }
  }
  
  /**
   * Handle form validation for login and register forms
   */
  function initializeAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
      loginForm.addEventListener('submit', function(event) {
        const username = loginForm.querySelector('#username');
        const password = loginForm.querySelector('#password');
        
        if (!username.value.trim() || !password.value.trim()) {
          event.preventDefault();
          MixTrip.alert('Please fill in all required fields', 'error');
        }
      });
    }
    
    if (registerForm) {
      registerForm.addEventListener('submit', function(event) {
        const username = registerForm.querySelector('#username');
        const email = registerForm.querySelector('#email');
        const password = registerForm.querySelector('#password');
        const confirmPassword = registerForm.querySelector('#confirmPassword');
        
        if (!username.value.trim() || !email.value.trim() || !password.value.trim() || !confirmPassword.value.trim()) {
          event.preventDefault();
          MixTrip.alert('Please fill in all required fields', 'error');
          return;
        }
        
        if (!MixTripUtils.isValidEmail(email.value.trim())) {
          event.preventDefault();
          MixTrip.alert('Please enter a valid email address', 'error');
          return;
        }
        
        if (password.value !== confirmPassword.value) {
          event.preventDefault();
          MixTrip.alert('Passwords do not match', 'error');
          return;
        }
      });
    }
  }
  
  // Initialize module
  function init() {
    // Try to load user data from session storage
    if (MixTrip.supports.sessionStorage) {
      const storedUser = sessionStorage.getItem('currentUser');
      if (storedUser) {
        try {
          currentUser = JSON.parse(storedUser);
        } catch (e) {
          console.error('Failed to parse stored user data', e);
        }
      }
    }
    
    // Initialize auth forms
    initializeAuthForms();
  }
  
  // Public API
  return {
    init,
    isLoggedIn,
    getCurrentUser,
    setCurrentUser,
    logout
  };
})();

// Add to MixTrip namespace when it's available
if (typeof MixTrip !== 'undefined') {
  MixTrip.Auth = Auth;
  
  // Initialize when document is ready
  document.addEventListener('DOMContentLoaded', function() {
    Auth.init();
  });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Auth;
}

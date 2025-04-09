/**
 * MixTrip Summer - Main JavaScript
 * Core application functionality
 */

// Define app namespace
const MixTrip = {
  // App configuration
  config: {
    apiUrl: '/api',
    apiVersion: 'v1',
    debug: false
  },
  
  // Features support flags
  supports: {
    localStorage: typeof window.localStorage !== 'undefined',
    sessionStorage: typeof window.sessionStorage !== 'undefined',
    geolocation: 'geolocation' in navigator
  },
  
  // Modules references (will be filled by modules)
  UI: null,
  Auth: null,
  Theme: null,
  
  // App initialization
  init() {
    // Log initialization
    this.log('Initializing MixTrip application', 'info');
    
    // Initialize lazy loading for images
    this.initLazyLoading();
    
    // Set user agent data for styling
    this.setUserAgentData();
    
    // Log initialization complete
    this.log('MixTrip application initialized', 'info');
  },
  
  // Log debug message if debug mode is on
  log(message, type = 'log') {
    if (this.config.debug) {
      switch (type) {
        case 'error':
          console.error(`[MixTrip] ${message}`);
          break;
        case 'warn':
          console.warn(`[MixTrip] ${message}`);
          break;
        case 'info':
          console.info(`[MixTrip] ${message}`);
          break;
        default:
          console.log(`[MixTrip] ${message}`);
      }
    }
  },
  
  // Initialize lazy loading for images
  initLazyLoading() {
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
  },
  
  // Set user agent data for CSS adjustments
  setUserAgentData() {
    const html = document.documentElement;
    
    // Check if mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      html.classList.add('is-mobile');
    }
    
    // Check for specific browsers
    if (/firefox/i.test(navigator.userAgent)) {
      html.classList.add('is-firefox');
    } else if (/chrome/i.test(navigator.userAgent)) {
      html.classList.add('is-chrome');
    } else if (/safari/i.test(navigator.userAgent)) {
      html.classList.add('is-safari');
    } else if (/edge/i.test(navigator.userAgent)) {
      html.classList.add('is-edge');
    }
    
    // Check for iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
      html.classList.add('is-ios');
    }
    
    // Check for Android
    const isAndroid = /Android/.test(navigator.userAgent);
    if (isAndroid) {
      html.classList.add('is-android');
    }
  },
  
  // API request helper (returns promise)
  async apiRequest(endpoint, options = {}) {
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const requestOptions = { ...defaultOptions, ...options };
    
    if (requestOptions.body && typeof requestOptions.body === 'object') {
      requestOptions.body = JSON.stringify(requestOptions.body);
    }
    
    try {
      const response = await fetch(`${this.config.apiUrl}/${this.config.apiVersion}/${endpoint}`, requestOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      this.log(`API Error: ${error.message}`, 'error');
      throw error;
    }
  }
};

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the app
  MixTrip.init();
});

// Expose MixTrip to global scope
window.MixTrip = MixTrip;

/**
 * MixTrip Summer - Utility Functions
 * Common utility functions used across the application
 */

const MixTripUtils = {
  /**
   * Format a date string
   * @param {string|Date} date - Date to format
   * @param {string} format - Format style ('short', 'medium', 'long')
   * @returns {string} Formatted date string
   */
  formatDate(date, format = 'medium') {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    switch (format) {
      case 'short':
        return dateObj.toLocaleDateString();
      case 'long':
        return dateObj.toLocaleDateString(undefined, { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'relative':
        return this.getRelativeTimeString(dateObj);
      case 'medium':
      default:
        return dateObj.toLocaleDateString(undefined, { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
    }
  },
  
  /**
   * Get relative time string (e.g., "2 days ago")
   * @param {Date} date - Date to convert
   * @returns {string} Relative time string
   */
  getRelativeTimeString(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    if (diffSecs < 60) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 30) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else if (diffMonths < 12) {
      return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    } else {
      return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
    }
  },
  
  /**
   * Format file size
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size string
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  /**
   * Truncate text to specified length
   * @param {string} text - Text to truncate
   * @param {number} length - Maximum length
   * @param {string} suffix - Suffix to add (default: '...')
   * @returns {string} Truncated text
   */
  truncateText(text, length = 100, suffix = '...') {
    if (!text) return '';
    
    if (text.length <= length) {
      return text;
    }
    
    return text.substring(0, length).trim() + suffix;
  },
  
  /**
   * Convert string to slug
   * @param {string} text - Text to convert
   * @returns {string} Slug
   */
  slugify(text) {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  },
  
  /**
   * Get URL query parameters as object
   * @returns {object} Query parameters
   */
  getQueryParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    
    if (!queryString) {
      return params;
    }
    
    const pairs = queryString.split('&');
    
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
    
    return params;
  },
  
  /**
   * Set cookie
   * @param {string} name - Cookie name
   * @param {string} value - Cookie value
   * @param {number} days - Expiration days
   */
  setCookie(name, value, days = 7) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
  },
  
  /**
   * Get cookie by name
   * @param {string} name - Cookie name
   * @returns {string} Cookie value
   */
  getCookie(name) {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length);
      }
    }
    
    return null;
  },
  
  /**
   * Delete cookie
   * @param {string} name - Cookie name
   */
  deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  },
  
  /**
   * Format a duration in days
   * @param {number} days - Number of days
   * @returns {string} Formatted duration
   */
  formatDuration(days) {
    if (!days) return '';
    
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const remainingDays = days % 30;
    
    let result = '';
    
    if (years > 0) {
      result += `${years} ${years === 1 ? 'year' : 'years'}`;
    }
    
    if (months > 0) {
      result += result ? ', ' : '';
      result += `${months} ${months === 1 ? 'month' : 'months'}`;
    }
    
    if (remainingDays > 0 || (!years && !months)) {
      result += result ? ', ' : '';
      result += `${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`;
    }
    
    return result;
  },
  
  /**
   * Calculate trip duration between two dates
   * @param {string|Date} startDate - Start date
   * @param {string|Date} endDate - End date
   * @returns {number} Duration in days
   */
  calculateTripDuration(startDate, endDate) {
    if (!startDate || !endDate) return null;
    
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return null;
    }
    
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include start day
  },
  
  /**
   * Format a number with commas for thousands
   * @param {number} number - Number to format
   * @returns {string} Formatted number
   */
  formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },
  
  /**
   * Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, wait = 300) {
    let timeout;
    
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} Success status
   */
  async copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        // For modern browsers
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
      }
    } catch (error) {
      console.error('Failed to copy: ', error);
      return false;
    }
  },
  
  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Is valid
   */
  isValidEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  },
  
  /**
   * Generate a random ID
   * @param {number} length - ID length (default: 10)
   * @returns {string} Random ID
   */
  generateId(length = 10) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }
};

// Make utils available globally
window.MixTripUtils = MixTripUtils;

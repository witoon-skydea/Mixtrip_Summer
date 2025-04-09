/**
 * MixTrip Summer - Theme Module
 * Handles theme switching and persistence
 */

const Theme = (function() {
  // Private variables
  let currentTheme = 'default';
  const THEME_STORAGE_KEY = 'mixtrip_theme';
  const AVAILABLE_THEMES = ['default', 'dark'];
  
  /**
   * Set theme
   * @param {string} theme - Theme name
   */
  function setTheme(theme) {
    // Check if theme is valid
    if (!AVAILABLE_THEMES.includes(theme)) {
      console.error(`Invalid theme: ${theme}. Available themes: ${AVAILABLE_THEMES.join(', ')}`);
      return;
    }
    
    // Remove current theme
    document.querySelector('link[href*="/css/themes/"]')?.remove();
    
    // Add new theme
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/css/themes/${theme}.css`;
    document.head.appendChild(link);
    
    // Store current theme
    currentTheme = theme;
    
    // Store in local storage for persistence
    if (MixTrip.supports.localStorage) {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
    
    // Add theme class to body
    document.body.classList.remove(...AVAILABLE_THEMES.map(t => `theme-${t}`));
    document.body.classList.add(`theme-${theme}`);
    
    // Dispatch custom event
    document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }
  
  /**
   * Get current theme
   * @returns {string} Current theme name
   */
  function getTheme() {
    return currentTheme;
  }
  
  /**
   * Toggle between dark and default themes
   */
  function toggleDarkMode() {
    const newTheme = currentTheme === 'dark' ? 'default' : 'dark';
    setTheme(newTheme);
    return newTheme;
  }
  
  /**
   * Check if dark mode is active
   * @returns {boolean} Is dark mode active
   */
  function isDarkMode() {
    return currentTheme === 'dark';
  }
  
  /**
   * Get all available themes
   * @returns {string[]} Available themes
   */
  function getAvailableThemes() {
    return [...AVAILABLE_THEMES];
  }
  
  /**
   * Initialize theme module
   */
  function init() {
    // Try to load theme from local storage
    if (MixTrip.supports.localStorage) {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme && AVAILABLE_THEMES.includes(storedTheme)) {
        setTheme(storedTheme);
      } else {
        // Try to detect user preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          setTheme('dark');
        }
      }
    }
    
    // Watch for system theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        // Only change theme if user hasn't explicitly chosen a theme
        if (!localStorage.getItem(THEME_STORAGE_KEY)) {
          setTheme(event.matches ? 'dark' : 'default');
        }
      });
    }
    
    // Add theme toggle button event listeners
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const newTheme = toggleDarkMode();
        
        // Update button text/icon if necessary
        if (btn.querySelector('.theme-toggle-text')) {
          btn.querySelector('.theme-toggle-text').textContent = 
            newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
        }
        
        if (btn.querySelector('.theme-toggle-icon')) {
          btn.querySelector('.theme-toggle-icon').innerHTML = 
            newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
      });
    });
  }
  
  // Public API
  return {
    init,
    setTheme,
    getTheme,
    toggleDarkMode,
    isDarkMode,
    getAvailableThemes
  };
})();

// Add to MixTrip namespace when it's available
if (typeof MixTrip !== 'undefined') {
  MixTrip.Theme = Theme;
  
  // Initialize when document is ready
  document.addEventListener('DOMContentLoaded', function() {
    Theme.init();
  });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Theme;
}

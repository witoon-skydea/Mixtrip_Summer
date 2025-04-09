/**
 * MixTrip Summer - Assets Configuration
 * Configuration for managing client-side assets
 */

const path = require('path');

const assetsConfig = {
  // Base paths
  paths: {
    public: path.join(__dirname, '../../public'),
    css: path.join(__dirname, '../../public/css'),
    js: path.join(__dirname, '../../public/js'),
    images: path.join(__dirname, '../../public/images'),
    uploads: path.join(__dirname, '../../public/uploads')
  },
  
  // CSS structure
  css: {
    // Core CSS files always loaded
    core: [
      'reset.css',
      'main.css',
      'utilities.css'
    ],
    
    // Component CSS files
    components: [
      'buttons.css',
      'forms.css',
      'alerts.css',
      'modals.css',
      'cards.css',
      'navigation.css'
    ],
    
    // Available themes
    themes: [
      'default.css',
      'dark.css'
    ],
    
    // CSS always loaded last
    last: [
      'responsive.css'
    ]
  },
  
  // JavaScript structure
  js: {
    // Core JS files always loaded
    core: [
      'utils.js',
      'main.js'
    ],
    
    // Module JS files
    modules: [
      'auth.js',
      'ui.js'
    ],
    
    // Component JS files available to load on demand
    components: [
      'map.js',
      'calendar.js',
      'modal.js',
      'upload.js',
      'search.js'
    ]
  },
  
  // Media uploads configuration
  uploads: {
    profiles: {
      path: path.join(__dirname, '../../public/uploads/profiles'),
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    },
    trips: {
      path: path.join(__dirname, '../../public/uploads/trips'),
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    },
    locations: {
      path: path.join(__dirname, '../../public/uploads/locations'),
      maxSize: 3 * 1024 * 1024, // 3MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    }
  },
  
  // File extension mappings
  mimeTypes: {
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  }
};

module.exports = assetsConfig;

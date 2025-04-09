/**
 * Asset Management Middleware
 * Handles asset loading, caching, and theme management
 */

const assetsConfig = require('../config/assets');
const path = require('path');
const fs = require('fs');
const appConfig = require('../config/app');

/**
 * Set up default assets for views
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.setupAssets = (req, res, next) => {
  // Set default values
  res.locals.pageCss = [];
  res.locals.pageJs = [];
  res.locals.requiredComponents = [];
  
  // Handle theme selection
  const availableThemes = assetsConfig.css.themes.map(t => path.parse(t).name);
  
  // Check if theme is set in request (query param or cookie)
  let theme = req.query.theme || req.cookies.theme || null;
  
  // Validate theme if set
  if (theme && !availableThemes.includes(theme)) {
    theme = null;
  }
  
  // Save theme preference to cookie if changed
  if (req.query.theme && req.query.theme !== req.cookies.theme) {
    res.cookie('theme', theme, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true }); // 30 days
  }
  
  res.locals.theme = theme;
  
  next();
};

/**
 * Generate asset fingerprint for cache busting
 * @param {string} filePath - Path to asset file
 * @returns {string} Fingerprint hash
 */
exports.generateFingerprint = (filePath) => {
  try {
    const fullPath = path.join(assetsConfig.paths.public, filePath);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      return `${stats.mtime.getTime().toString(16)}`;
    }
  } catch (error) {
    console.error(`Error generating fingerprint for ${filePath}:`, error);
  }
  
  return Date.now().toString(16);
};

/**
 * Middleware to ensure upload directories exist
 */
exports.ensureUploadDirs = () => {
  // Create upload directories if they don't exist
  Object.values(assetsConfig.uploads).forEach(upload => {
    if (!fs.existsSync(upload.path)) {
      fs.mkdirSync(upload.path, { recursive: true });
    }
  });
};

/**
 * Cache control middleware
 * @param {number} maxAge - Cache max age in seconds
 * @returns {Function} Express middleware
 */
exports.cacheControl = (maxAge) => {
  return (req, res, next) => {
    // Don't cache in development
    if (appConfig.isDevelopment) {
      res.setHeader('Cache-Control', 'no-store');
    } else {
      res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
    }
    next();
  };
};

/**
 * Add cache busting parameters to static assets
 * @param {string} url - Asset URL
 * @returns {string} URL with cache busting parameter
 */
exports.assetUrl = (url) => {
  if (appConfig.isDevelopment) {
    // In development, add timestamp to bust cache
    return `${url}?v=${Date.now()}`;
  } else {
    // In production, use file fingerprint
    const fingerprint = exports.generateFingerprint(url);
    return `${url}?v=${fingerprint}`;
  }
};

// Make assetUrl available in templates
exports.assetHelpers = (req, res, next) => {
  res.locals.assetUrl = exports.assetUrl;
  next();
};

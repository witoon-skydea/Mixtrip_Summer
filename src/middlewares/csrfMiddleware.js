/**
 * CSRF Protection Middleware
 */
const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * Generate a random CSRF token
 * @returns {string} CSRF token
 */
const generateToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * CSRF protection middleware
 * Generates a CSRF token for forms and checks it on POST, PUT, DELETE requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const csrfProtection = (req, res, next) => {
  // Skip CSRF check for API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Generate CSRF token if not exists in session
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateToken();
  }
  
  // Add CSRF token to res.locals for templates
  res.locals.csrfToken = req.session.csrfToken;
  
  // Check token on POST, PUT, DELETE requests
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const token = req.body._csrf || req.headers['x-csrf-token'];
    
    if (!token || token !== req.session.csrfToken) {
      // Log potential CSRF attempt
      logger.warn(`CSRF check failed for ${req.method} ${req.path}`);
      
      // For AJAX requests
      if (req.xhr || req.headers.accept.includes('application/json')) {
        return res.status(403).json({
          success: false,
          message: 'CSRF token validation failed'
        });
      }
      
      // For form submissions
      return res.status(403).render('error', {
        title: 'Invalid Request',
        message: 'Your request could not be processed. Please try again.',
        error: { status: 403 }
      });
    }
  }
  
  // Generate new token for each request for enhanced security
  req.session.csrfToken = generateToken();
  
  next();
};

module.exports = {
  csrfProtection,
  generateToken
};

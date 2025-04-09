/**
 * Rate Limiting Middleware
 * Protects against brute force attacks and API abuse
 */
const logger = require('../utils/logger');

// In-memory store for rate limiting
// In production, use Redis or other distributed storage
const store = new Map();

/**
 * Clean up expired rate limit entries
 * @param {number} windowMs - Time window in milliseconds
 */
const cleanupStore = (windowMs) => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now > value.resetTime) {
      store.delete(key);
    }
  }
};

/**
 * Rate limiting middleware
 * @param {Object} options - Rate limiting options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.maxRequests - Maximum number of requests allowed in the time window
 * @param {string} options.message - Error message to return when rate limit is exceeded
 * @param {boolean} options.skipSuccessfulRequests - Whether to skip counting successful requests
 * @returns {Function} Express middleware
 */
const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes by default
    maxRequests = 100, // 100 requests per windowMs by default
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false
  } = options;
  
  // Run cleanup periodically
  setInterval(() => cleanupStore(windowMs), windowMs);
  
  return (req, res, next) => {
    // Skip rate limiting for trusted IPs or admin users
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    
    // Get client IP
    const ip = req.ip || req.socket.remoteAddress || req.connection.remoteAddress;
    
    // Get identifier (can be IP, user ID if logged in, or combination)
    const identifier = req.user ? `${ip}-${req.user.id}` : ip;
    
    // Get current count
    const now = Date.now();
    const resetTime = now + windowMs;
    
    if (!store.has(identifier)) {
      store.set(identifier, {
        count: 1,
        resetTime
      });
      return next();
    }
    
    const current = store.get(identifier);
    
    if (now > current.resetTime) {
      // Reset if time window has passed
      store.set(identifier, {
        count: 1,
        resetTime
      });
      return next();
    }
    
    // Check if rate limit exceeded
    if (current.count >= maxRequests) {
      // Log rate limit hit
      logger.warn(`Rate limit exceeded for ${identifier} at ${req.method} ${req.originalUrl}`);
      
      // Set rate limit headers
      res.setHeader('Retry-After', Math.ceil((current.resetTime - now) / 1000));
      
      // For AJAX requests
      if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
        return res.status(429).json({
          success: false,
          message
        });
      }
      
      // For regular requests
      return res.status(429).render('error', {
        title: 'Rate Limit Exceeded',
        message,
        error: { status: 429 }
      });
    }
    
    // Increment count
    current.count += 1;
    store.set(identifier, current);
    
    // Store the original end function
    const originalEnd = res.end;
    
    // Override the end function
    res.end = function(chunk, encoding) {
      // Call the original end function
      originalEnd.call(this, chunk, encoding);
      
      // Skip counting if the request was successful and skipSuccessfulRequests is true
      if (skipSuccessfulRequests && res.statusCode >= 200 && res.statusCode < 300) {
        if (current.count > 0) {
          current.count -= 1;
          store.set(identifier, current);
        }
      }
    };
    
    next();
  };
};

/**
 * Specific rate limiters
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per windowMs
  message: 'Too many API requests, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 login/register attempts per hour
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true // Don't count successful logins
});

module.exports = {
  rateLimit,
  apiLimiter,
  authLimiter
};

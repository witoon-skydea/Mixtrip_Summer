const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to check if user is authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.isAuthenticated = (req, res, next) => {
  // Check if user is authenticated via session
  if (req.session && req.session.user && req.session.user.isLoggedIn) {
    return next();
  }
  
  // If not authenticated via session, check JWT token
  try {
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.redirect('/auth/login?redirect=' + encodeURIComponent(req.originalUrl));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    res.redirect('/auth/login?redirect=' + encodeURIComponent(req.originalUrl));
  }
};

/**
 * Middleware to check if user is an admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.isAdmin = async (req, res, next) => {
  try {
    // First ensure the user is authenticated
    if (!req.session.user && !req.user) {
      return res.redirect('/auth/login?redirect=' + encodeURIComponent(req.originalUrl));
    }
    
    const userId = req.session.user?.id || req.user?.id;
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to access this resource',
        error: { status: 403 }
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user owns a resource or is an admin
 * @param {Function} getResourceOwnerId - Function to get owner ID from the request
 * @returns {Function} Express middleware
 */
exports.isOwnerOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      // First ensure the user is authenticated
      if (!req.session.user && !req.user) {
        return res.redirect('/auth/login?redirect=' + encodeURIComponent(req.originalUrl));
      }
      
      const userId = req.session.user?.id || req.user?.id;
      const user = await User.findById(userId);
      
      // Allow if user is admin
      if (user && user.role === 'admin') {
        return next();
      }
      
      // Get the owner ID of the resource using the provided function
      const ownerId = await getResourceOwnerId(req);
      
      // Check if the current user is the owner
      if (ownerId && ownerId.toString() === userId.toString()) {
        return next();
      }
      
      // If not the owner or admin, deny access
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to access this resource',
        error: { status: 403 }
      });
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has verified email
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.hasVerifiedEmail = async (req, res, next) => {
  try {
    // First ensure the user is authenticated
    if (!req.session.user && !req.user) {
      return res.redirect('/auth/login?redirect=' + encodeURIComponent(req.originalUrl));
    }
    
    const userId = req.session.user?.id || req.user?.id;
    const user = await User.findById(userId);
    
    if (!user || !user.isEmailVerified) {
      return res.redirect('/auth/verify-email?redirect=' + encodeURIComponent(req.originalUrl));
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to attach user object to request if authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.attachUser = async (req, res, next) => {
  try {
    // Check for session
    if (req.session && req.session.user) {
      const user = await User.findById(req.session.user.id);
      req.user = user;
    } else {
      // Check for JWT token
      const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
      
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        req.user = user;
        
        // Update session if token is valid
        if (user) {
          req.session.user = {
            id: user._id,
            username: user.username,
            role: user.role,
            isLoggedIn: true
          };
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue even if there's an error
    req.user = null;
    next();
  }
};

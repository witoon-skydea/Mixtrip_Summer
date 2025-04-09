const logger = require('../utils/logger');

/**
 * Custom Error class for API errors with status code and errors array
 */
class ApiError extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = this.constructor.name;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found (404) middleware for handling undefined routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFound = (req, res, next) => {
  const error = new ApiError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';
  let errors = err.errors || [];
  
  // Log error
  if (statusCode >= 500) {
    logger.error(`[${statusCode}] ${err.message}`, { stack: err.stack });
  } else {
    logger.warn(`[${statusCode}] ${err.message}`);
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  
  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message
    }));
    message = 'Validation Error';
  }
  
  // Handle mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }
  
  // Handle mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    
    errors = [{
      field,
      message
    }];
  }
  
  // Check if request is for API or web view
  const isApiRequest = req.originalUrl.startsWith('/api/') || 
                       req.header('accept')?.includes('application/json');
  
  if (isApiRequest) {
    // API response with JSON
    return res.status(statusCode).json({
      success: false,
      message,
      errors: errors.length > 0 ? errors : undefined,
      status: statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  } else {
    // Web view response with rendered error page
    if (statusCode === 404) {
      return res.status(404).render('error', {
        title: 'Page Not Found',
        message: 'The page you are looking for does not exist',
        error: { status: 404 }
      });
    } else if (statusCode === 403) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: message || 'You do not have permission to access this resource',
        error: { status: 403 }
      });
    } else if (statusCode === 401) {
      return res.redirect(`/auth/login?redirect=${encodeURIComponent(req.originalUrl)}`);
    } else {
      return res.status(statusCode).render('error', {
        title: `Error ${statusCode}`,
        message: message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : { status: statusCode }
      });
    }
  }
};

/**
 * Mongoose validation error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validationErrorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    // Extract validation error messages
    const messages = Object.values(err.errors).map(error => error.message);
    
    // Create new error with validation messages
    const error = new ApiError(messages.join(', '), 400);
    
    return next(error);
  }
  
  next(err);
};

/**
 * Mongoose duplicate key error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const duplicateKeyErrorHandler = (err, req, res, next) => {
  if (err.code === 11000) {
    // Extract field name from error message
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    
    // Create new error with duplicate key message
    const error = new ApiError(`Duplicate value: ${field} with value '${value}' already exists`, 400);
    
    return next(error);
  }
  
  next(err);
};

// Combined middleware for handling all types of errors
const combineErrorHandlers = [
  validationErrorHandler,
  duplicateKeyErrorHandler,
  errorHandler
];

module.exports = {
  ApiError,
  notFound,
  errorHandler,
  validationErrorHandler,
  duplicateKeyErrorHandler,
  combineErrorHandlers
};

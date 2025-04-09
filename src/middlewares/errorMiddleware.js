const logger = require('../utils/logger');

/**
 * Custom Error class for API errors with status code
 */
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
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
  // Get status code
  const statusCode = err.statusCode || 500;
  
  // Log error
  if (statusCode === 500) {
    logger.error(`[${statusCode}] ${err.message}`, { stack: err.stack });
  } else {
    logger.warn(`[${statusCode}] ${err.message}`);
  }
  
  // Check if request is for API or web view
  const isApiRequest = req.originalUrl.startsWith('/api/') || 
                      req.headers.accept === 'application/json';
  
  if (isApiRequest) {
    // API response with JSON
    return res.status(statusCode).json({
      success: false,
      error: {
        message: err.message,
        status: statusCode,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      }
    });
  } else {
    // Web view response with rendered error page
    return res.status(statusCode).render('error', {
      title: `Error ${statusCode}`,
      message: err.message || 'Something went wrong!',
      error: process.env.NODE_ENV === 'development' ? err : { status: statusCode }
    });
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

module.exports = {
  ApiError,
  notFound,
  errorHandler,
  validationErrorHandler,
  duplicateKeyErrorHandler
};

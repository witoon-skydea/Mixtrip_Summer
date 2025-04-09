/**
 * API Routes Index
 * Main entry point for all API routes
 */
const express = require('express');
const router = express.Router();
const userRoutes = require('./user');
const tripRoutes = require('./trip');
const locationRoutes = require('./location');
const authRoutes = require('./auth');
const { apiLimiter } = require('../../middlewares/rateLimitMiddleware');

// Apply rate limiting to all API routes
router.use(apiLimiter);

// Add API version to responses
router.use((req, res, next) => {
  res.setHeader('X-API-Version', '1.0.0');
  next();
});

// Welcome route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to MixTrip Summer API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      trips: '/api/trips',
      locations: '/api/locations'
    }
  });
});

// Mount API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/trips', tripRoutes);
router.use('/locations', locationRoutes);

// 404 handler for API routes
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

module.exports = router;

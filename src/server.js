const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const ejsLayouts = require('express-ejs-layouts');
const logger = require('./utils/logger');
const { connectDB } = require('./config/database');
const appConfig = require('./config/app');
const { 
  notFound, 
  errorHandler,
  validationErrorHandler,
  duplicateKeyErrorHandler
} = require('./middlewares/errorMiddleware');
const { attachUser } = require('./middlewares/authMiddleware');
require('dotenv').config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set up EJS Layouts - make sure it's after view engine config
app.use(ejsLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Enable debugging for templates in development
if (process.env.NODE_ENV !== 'production') {
  app.locals.pretty = true;
  app.locals.debug = true;
}

// Log view directories for debugging
logger.info(`View engine: ${app.get('view engine')}`);
logger.info(`Views directory: ${app.get('views')}`);
logger.info(`Layout: ${app.get('layout')}`);

// Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://maps.googleapis.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://maps.googleapis.com", "https://via.placeholder.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://maps.googleapis.com"]
    }
  }
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'mixtrip_summer_default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Connect to MongoDB
connectDB()
  .then(() => {
    logger.info(`Connected to MongoDB: ${process.env.DB_NAME}`);
  })
  .catch((err) => {
    logger.error(`Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  });

// Import routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const tripRoutes = require('./routes/trip');
const locationRoutes = require('./routes/location');
const apiRoutes = require('./routes/api/index');
const testRoutes = require('./routes/test'); // Add test routes

// Apply CSRF protection (if needed later)
// const { csrfProtection } = require('./middlewares/csrfMiddleware');
// app.use(csrfProtection);

// User middleware - gets the user data from session/token
app.use(attachUser);

// Global variables middleware - MUST come before routes
app.use((req, res, next) => {
  // Basic app info
  res.locals.appName = appConfig.name;
  res.locals.appVersion = appConfig.version;
  res.locals.currentYear = new Date().getFullYear();
  
  // User authentication info
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = Boolean(req.session.user);
  
  // Flash messages (if flash middleware is available)
  res.locals.error = req.flash ? req.flash('error') : null;
  res.locals.success = req.flash ? req.flash('success') : null;
  
  // Default page-specific resources
  res.locals.pageCss = [];
  res.locals.pageJs = [];
  res.locals.requiredComponents = []; 
  
  next();
});

// Web routes - register in specific order (more specific first, root last)
app.use('/test', testRoutes); // Test routes first
app.use('/auth', authRoutes);
app.use('/profile', userRoutes);
app.use('/trips', tripRoutes);
app.use('/locations', locationRoutes);
app.use('/api', apiRoutes); // API routes
app.use('/', indexRoutes); // Root routes always last

// Debug middleware to log all requests
app.use((req, res, next) => {
  logger.info(`[${req.method}] ${req.url}`);
  next();
});

// Add 404 error handler for pages not found
app.use(function(req, res, next) {
  // Skip to the next middleware if this is not a 404
  if (!res.headersSent) {
    logger.warn(`404 Not Found: ${req.originalUrl}`);
    // Render the error view with appropriate status
    res.status(404).render('error', {
      title: '404 - Page Not Found',
      message: 'The page you are looking for does not exist',
      error: {
        status: 404,
        stack: process.env.NODE_ENV === 'development' ? 'Page not found' : ''
      }
    });
  } else {
    next();
  }
});

// Error handling middlewares
app.use((err, req, res, next) => {
  logger.error(`Error processing request: ${err.message}`);
  logger.error(err.stack);
  
  // If headers already sent, just log the error
  if (res.headersSent) {
    return next(err);
  }
  
  // Render the error page
  res.status(err.status || 500).render('error', {
    title: `${err.status || 500} - Error`,
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Other error handling middlewares (for specific types of errors)
app.use(validationErrorHandler);
app.use(duplicateKeyErrorHandler);
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Application: ${appConfig.name} v${appConfig.version}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Don't crash the server but log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // For critical errors, it's often better to exit and let the process manager restart
  process.exit(1);
});

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

// Set up EJS Layouts
app.use(ejsLayouts);
app.set('layout', 'layouts/main');

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

// Static files
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

// Apply CSRF protection (if needed later)
// const { csrfProtection } = require('./middlewares/csrfMiddleware');
// app.use(csrfProtection);

// Web routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/profile', userRoutes);
app.use('/trips', tripRoutes);
app.use('/locations', locationRoutes);

// API routes
app.use('/api', apiRoutes);

// User middleware
app.use(attachUser);

// Global variables middleware
app.use((req, res, next) => {
  res.locals.appName = appConfig.name;
  res.locals.appVersion = appConfig.version;
  res.locals.currentYear = new Date().getFullYear();
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = req.session.user ? true : false;
  res.locals.error = req.flash ? req.flash('error') : null;
  res.locals.success = req.flash ? req.flash('success') : null;
  next();
});

// Error handling middlewares
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

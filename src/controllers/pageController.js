const User = require('../models/User');
const Trip = require('../models/Trip');
const appConfig = require('../config/app');

/**
 * Render home page
 * @route GET /
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.renderHomePage = async (req, res) => {
  try {
    // Get featured trips
    const featuredTrips = await Trip.find({ privacy: 'public' })
      .sort({ views: -1 })
      .limit(3)
      .populate('creator', 'username name profileImage');
    
    res.render('index', {
      title: 'Home',
      featuredTrips,
      theme: req.query.theme || null, // Support theme switching via query param
      pageCss: ['home'], // Page specific CSS
      pageJs: ['home'], // Page specific JS
      requiredComponents: [] // Required component JS files
    });
  } catch (error) {
    console.error('Error rendering home page:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load homepage',
      error: { status: 500 }
    });
  }
};

/**
 * Render about page
 * @route GET /about
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.renderAboutPage = (req, res) => {
  res.render('about', {
    title: 'About Us',
    theme: req.query.theme || null,
    pageCss: ['about'],
    pageJs: null,
    requiredComponents: []
  });
};

/**
 * Render contact page
 * @route GET /contact
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.renderContactPage = (req, res) => {
  res.render('contact', {
    title: 'Contact Us',
    theme: req.query.theme || null,
    pageCss: ['contact'],
    pageJs: ['contact'],
    requiredComponents: []
  });
};

/**
 * Render terms of service page
 * @route GET /terms
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.renderTermsPage = (req, res) => {
  res.render('terms', {
    title: 'Terms of Service',
    theme: req.query.theme || null,
    pageCss: [],
    pageJs: null,
    requiredComponents: []
  });
};

/**
 * Render privacy policy page
 * @route GET /privacy
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.renderPrivacyPage = (req, res) => {
  res.render('privacy', {
    title: 'Privacy Policy',
    theme: req.query.theme || null,
    pageCss: [],
    pageJs: null,
    requiredComponents: []
  });
};

/**
 * Render custom error page
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} error - Error object
 */
exports.renderErrorPage = (req, res, statusCode, message, error) => {
  res.status(statusCode).render('error', {
    title: `Error ${statusCode}`,
    message: message || 'An error occurred',
    error: error || { status: statusCode },
    theme: req.query.theme || null,
    pageCss: [],
    pageJs: null,
    requiredComponents: []
  });
};

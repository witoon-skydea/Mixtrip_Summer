const express = require('express');
const router = express.Router();
const path = require('path');
const logger = require('../utils/logger');

/**
 * @route   GET /
 * @desc    Root route that handles direct EJS rendering
 * @access  Public
 */
router.get('/', (req, res) => {
  logger.info('Rendering main home view');
  // Set a cookie to indicate the user has visited
  res.cookie('visited', 'true', { maxAge: 24 * 60 * 60 * 1000 }); // 24 hours
  
  return res.render('home', { 
    title: 'MixTrip Summer',
    message: 'Your travel planning companion',
    user: req.session.user || null,
    pageCss: ['main', 'utilities']
  });
});

/**
 * @route   GET /home
 * @desc    Home page alias
 * @access  Public
 */
router.get('/home', (req, res) => {
  logger.info('Redirecting /home to root');
  return res.redirect('/');
});

/**
 * @route   GET /index
 * @desc    Index page alias
 * @access  Public
 */
router.get('/index', (req, res) => {
  logger.info('Redirecting /index to root');
  return res.redirect('/');
});

/**
 * @route   GET /about
 * @desc    About page route
 * @access  Public
 */
router.get('/about', (req, res) => {
  res.render('about', { 
    title: 'About MixTrip Summer',
    user: req.session.user || null
  });
});

/**
 * @route   GET /contact
 * @desc    Contact page route
 * @access  Public
 */
router.get('/contact', (req, res) => {
  res.render('contact', { 
    title: 'Contact Us',
    user: req.session.user || null
  });
});

/**
 * @route   POST /contact
 * @desc    Submit contact form
 * @access  Public
 */
router.post('/contact', (req, res) => {
  // TODO: Implement contact form submission logic
  res.redirect('/contact?success=true');
});

/**
 * @route   GET /privacy
 * @desc    Privacy policy page
 * @access  Public
 */
router.get('/privacy', (req, res) => {
  res.render('privacy', { 
    title: 'Privacy Policy',
    user: req.session.user || null
  });
});

/**
 * @route   GET /terms
 * @desc    Terms of service page
 * @access  Public
 */
router.get('/terms', (req, res) => {
  res.render('terms', { 
    title: 'Terms of Service',
    user: req.session.user || null
  });
});

/**
 * @route   GET /faq
 * @desc    FAQ page
 * @access  Public
 */
router.get('/faq', (req, res) => {
  res.render('faq', { 
    title: 'Frequently Asked Questions',
    user: req.session.user || null
  });
});

module.exports = router;

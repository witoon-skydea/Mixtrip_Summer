const express = require('express');
const router = express.Router();

/**
 * @route   GET /
 * @desc    Home page route (redirects to public/index.html for first-time loading)
 * @access  Public
 */
router.get('/', (req, res) => {
  // Static HTML page in public folder will handle the initial loading
  res.sendFile('index.html', { root: 'public' });
});

/**
 * @route   GET /home
 * @desc    Main application home page
 * @access  Public
 */
router.get('/home', (req, res) => {
  res.render('index', { 
    title: 'MixTrip Summer',
    message: 'Your travel planning companion',
    user: req.session.user || null
  });
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

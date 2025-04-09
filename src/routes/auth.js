const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
// const authController = require('../controllers/authController');
// const authMiddleware = require('../middlewares/authMiddleware');

// Temporary controller placeholders until we create the actual controllers
const tempAuthController = {
  register: (req, res) => {
    res.render('auth/register-success', {
      title: 'Registration Successful',
      message: 'Registration functionality will be implemented in Phase 2'
    });
  },
  login: (req, res) => {
    // Simulate login (will be replaced with actual implementation)
    req.session.user = {
      username: req.body.username,
      isLoggedIn: true
    };
    res.redirect('/');
  },
  logout: (req, res) => {
    req.session.destroy();
    res.redirect('/');
  },
  forgotPassword: (req, res) => {
    res.render('auth/forgot-password-success', {
      title: 'Password Reset Email Sent',
      message: 'Password reset functionality will be implemented in Phase 2'
    });
  },
  resetPassword: (req, res) => {
    res.render('auth/reset-password-success', {
      title: 'Password Reset Successful',
      message: 'Password reset functionality will be implemented in Phase 2'
    });
  }
};

/**
 * @route   GET /auth/register
 * @desc    Show registration form
 * @access  Public
 */
router.get('/register', (req, res) => {
  res.render('auth/register', {
    title: 'Register',
    user: null
  });
});

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', [
  body('username').trim().isLength({ min: 3 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], tempAuthController.register);

/**
 * @route   GET /auth/login
 * @desc    Show login form
 * @access  Public
 */
router.get('/login', (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    user: null
  });
});

/**
 * @route   POST /auth/login
 * @desc    Authenticate user
 * @access  Public
 */
router.post('/login', [
  body('username').trim().escape(),
  body('password').isLength({ min: 1 })
], tempAuthController.login);

/**
 * @route   GET /auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.get('/logout', tempAuthController.logout);

/**
 * @route   GET /auth/forgot-password
 * @desc    Show forgot password form
 * @access  Public
 */
router.get('/forgot-password', (req, res) => {
  res.render('auth/forgot-password', {
    title: 'Forgot Password',
    user: null
  });
});

/**
 * @route   POST /auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], tempAuthController.forgotPassword);

/**
 * @route   GET /auth/reset-password/:token
 * @desc    Show reset password form
 * @access  Public
 */
router.get('/reset-password/:token', (req, res) => {
  res.render('auth/reset-password', {
    title: 'Reset Password',
    token: req.params.token,
    user: null
  });
});

/**
 * @route   POST /auth/reset-password/:token
 * @desc    Reset password
 * @access  Public
 */
router.post('/reset-password/:token', [
  body('password').isLength({ min: 8 }),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], tempAuthController.resetPassword);

module.exports = router;

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

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
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores')
    .escape(),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], authController.register);

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
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username or email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], authController.login);

/**
 * @route   GET /auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.get('/logout', isAuthenticated, authController.logout);

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
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
], authController.forgotPassword);

/**
 * @route   GET /auth/reset-password/:token
 * @desc    Show reset password form
 * @access  Public
 */
router.get('/reset-password/:token', authController.resetPasswordForm);

/**
 * @route   POST /auth/reset-password/:token
 * @desc    Reset password
 * @access  Public
 */
router.post('/reset-password/:token', [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], authController.resetPassword);

/**
 * @route   GET /auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', isAuthenticated, authController.getMe);

module.exports = router;

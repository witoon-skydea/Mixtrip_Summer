/**
 * API Routes for User
 */
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { isAuthenticated } = require('../../middlewares/authMiddleware');
const userController = require('../../controllers/userController');
const authController = require('../../controllers/authController');
const { handleUpload, profileUpload } = require('../../utils/fileUpload');

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', isAuthenticated, authController.getMe);

/**
 * @route   GET /api/users/:username
 * @desc    Get user by username
 * @access  Public
 */
router.get('/:username', userController.getUserProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', 
  isAuthenticated,
  [
    body('name').optional().trim().isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
    body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters')
  ],
  userController.updateProfile
);

/**
 * @route   POST /api/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', 
  isAuthenticated,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
  ],
  userController.changePassword
);

/**
 * @route   POST /api/users/upload-image
 * @desc    Upload profile image
 * @access  Private
 */
router.post('/upload-image', 
  isAuthenticated,
  handleUpload(profileUpload, 'profileImage'),
  userController.uploadProfileImage
);

/**
 * @route   PUT /api/users/settings
 * @desc    Update user settings
 * @access  Private
 */
router.put('/settings', 
  isAuthenticated,
  [
    body('email').optional().isEmail().withMessage('Invalid email address')
  ],
  userController.updateSettings
);

/**
 * @route   POST /api/users/deactivate
 * @desc    Deactivate user account
 * @access  Private
 */
router.post('/deactivate', 
  isAuthenticated,
  [
    body('password').notEmpty().withMessage('Password is required to deactivate account')
  ],
  userController.deactivateAccount
);

/**
 * @route   GET /api/users/:username/trips
 * @desc    Get user's public trips
 * @access  Public
 */
router.get('/:username/trips', (req, res) => {
  // This route will be implemented later
  res.status(501).json({
    success: false,
    message: 'This endpoint is not implemented yet'
  });
});

module.exports = router;

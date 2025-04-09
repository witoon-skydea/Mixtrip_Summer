const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Set up multer for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/images/profiles'));
  },
  filename: (req, file, cb) => {
    // Generate a unique filename
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    cb(null, `profile-${Date.now()}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

/**
 * @route   GET /profile/:username
 * @desc    Get user profile by username
 * @access  Public
 */
router.get('/:username', userController.getUserProfile);

/**
 * @route   GET /profile/edit
 * @desc    Get profile edit form
 * @access  Private
 */
router.get('/edit', isAuthenticated, userController.getEditProfileForm);

/**
 * @route   POST /profile/edit
 * @desc    Update user profile
 * @access  Private
 */
router.post('/edit', 
  isAuthenticated,
  [
    body('name').optional().trim().isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
    body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters')
  ],
  userController.updateProfile
);

/**
 * @route   GET /profile/change-password
 * @desc    Get password change form
 * @access  Private
 */
router.get('/change-password', isAuthenticated, userController.getChangePasswordForm);

/**
 * @route   POST /profile/change-password
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
 * @route   POST /profile/upload-image
 * @desc    Upload profile image
 * @access  Private
 */
router.post('/upload-image', 
  isAuthenticated,
  upload.single('profileImage'),
  userController.uploadProfileImage
);

/**
 * @route   GET /profile/settings
 * @desc    Get user settings form
 * @access  Private
 */
router.get('/settings', isAuthenticated, userController.getSettingsForm);

/**
 * @route   POST /profile/settings
 * @desc    Update user settings
 * @access  Private
 */
router.post('/settings', 
  isAuthenticated,
  [
    body('email').optional().isEmail().withMessage('Invalid email address')
  ],
  userController.updateSettings
);

/**
 * @route   POST /profile/deactivate
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

module.exports = router;

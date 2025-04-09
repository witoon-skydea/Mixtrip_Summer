const User = require('../models/User');
const { validationResult } = require('express-validator');
const { ApiError } = require('../middlewares/errorMiddleware');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

/**
 * Get user profile by username
 * @route GET /profile/:username
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getUserProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    
    // Find user by username and exclude sensitive fields
    const user = await User.findOne({ username })
      .select('-password -emailVerificationToken -emailVerificationExpires -resetPasswordToken -resetPasswordExpires');
    
    // Check if user exists
    if (!user) {
      return res.status(404).render('error', {
        title: 'User Not Found',
        message: `The user "${username}" was not found`,
        error: { status: 404 }
      });
    }
    
    // Determine if the profile belongs to the currently logged in user
    const isOwnProfile = req.user && req.user.id && user._id.toString() === req.user.id.toString();
    
    // Render profile page
    return res.render('users/profile', {
      title: `${user.name || user.username}'s Profile`,
      profileUser: user,
      isOwnProfile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get profile edit form
 * @route GET /profile/edit
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getEditProfileForm = async (req, res, next) => {
  try {
    // Find user by ID (user should be attached to req by auth middleware)
    const user = await User.findById(req.user.id)
      .select('-password -emailVerificationToken -emailVerificationExpires -resetPasswordToken -resetPasswordExpires');
    
    // Check if user exists
    if (!user) {
      return res.status(404).render('error', {
        title: 'User Not Found',
        message: 'Unable to find your profile',
        error: { status: 404 }
      });
    }
    
    // Render edit profile form
    return res.render('users/edit-profile', {
      title: 'Edit Profile',
      profileUser: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * @route POST /profile/edit
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.updateProfile = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Get user data to re-render form with errors
      const user = await User.findById(req.user.id);
      
      return res.status(400).render('users/edit-profile', {
        title: 'Edit Profile',
        profileUser: user,
        errors: errors.array(),
        formData: req.body
      });
    }
    
    // Extract fields to update
    const { name, bio } = req.body;
    
    // Find user by ID
    const user = await User.findById(req.user.id);
    
    // Check if user exists
    if (!user) {
      return res.status(404).render('error', {
        title: 'User Not Found',
        message: 'Unable to find your profile',
        error: { status: 404 }
      });
    }
    
    // Update user fields
    user.name = name || user.name;
    user.bio = bio || user.bio;
    
    // Handle privacy settings
    if (req.body.showEmail !== undefined) {
      user.preferences.privacySettings.showEmail = req.body.showEmail === 'true';
    }
    
    if (req.body.showTrips !== undefined) {
      user.preferences.privacySettings.showTrips = req.body.showTrips === 'true';
    }
    
    // Handle notification settings
    if (req.body.emailNotifications !== undefined) {
      user.preferences.notificationSettings.emailNotifications = req.body.emailNotifications === 'true';
    }
    
    if (req.body.tripComments !== undefined) {
      user.preferences.notificationSettings.tripComments = req.body.tripComments === 'true';
    }
    
    if (req.body.tripRemixes !== undefined) {
      user.preferences.notificationSettings.tripRemixes = req.body.tripRemixes === 'true';
    }
    
    if (req.body.newFollowers !== undefined) {
      user.preferences.notificationSettings.newFollowers = req.body.newFollowers === 'true';
    }
    
    // Save updated user
    await user.save();
    
    // Log profile update
    logger.info(`User profile updated: ${user.username}`);
    
    // Add flash message (if flash middleware is configured)
    if (req.flash) {
      req.flash('success', 'Profile updated successfully');
    }
    
    // Redirect to profile page
    return res.redirect(`/profile/${user.username}`);
  } catch (error) {
    next(error);
  }
};

/**
 * Get password change form
 * @route GET /profile/change-password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getChangePasswordForm = (req, res) => {
  return res.render('users/change-password', {
    title: 'Change Password'
  });
};

/**
 * Change user password
 * @route POST /profile/change-password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.changePassword = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('users/change-password', {
        title: 'Change Password',
        errors: errors.array()
      });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    // Find user by ID with password
    const user = await User.findById(req.user.id).select('+password');
    
    // Check if user exists
    if (!user) {
      return res.status(404).render('error', {
        title: 'User Not Found',
        message: 'Unable to find your profile',
        error: { status: 404 }
      });
    }
    
    // Check if current password is correct
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).render('users/change-password', {
        title: 'Change Password',
        errors: [{ msg: 'Current password is incorrect' }]
      });
    }
    
    // Update password
    user.password = newPassword;
    
    // Save user
    await user.save();
    
    // Log password change
    logger.info(`User password changed: ${user.username}`);
    
    // Add flash message (if flash middleware is configured)
    if (req.flash) {
      req.flash('success', 'Password changed successfully');
    }
    
    // Redirect to profile page
    return res.redirect(`/profile/${user.username}`);
  } catch (error) {
    next(error);
  }
};

/**
 * Upload profile image
 * @route POST /profile/upload-image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.uploadProfileImage = async (req, res, next) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Find user by ID
    const user = await User.findById(req.user.id);
    
    // Check if user exists
    if (!user) {
      // Remove uploaded file
      fs.unlinkSync(req.file.path);
      
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Remove old profile image if not default
    if (user.profileImage !== 'default-profile.png') {
      const oldImagePath = path.join(__dirname, '../../public/images/profiles', user.profileImage);
      
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    
    // Update user profile image
    user.profileImage = req.file.filename;
    
    // Save user
    await user.save();
    
    // Log profile image update
    logger.info(`User profile image updated: ${user.username}`);
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      data: {
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    // Remove uploaded file if there was an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    next(error);
  }
};

/**
 * Get user settings form
 * @route GET /profile/settings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getSettingsForm = async (req, res, next) => {
  try {
    // Find user by ID
    const user = await User.findById(req.user.id);
    
    // Check if user exists
    if (!user) {
      return res.status(404).render('error', {
        title: 'User Not Found',
        message: 'Unable to find your profile',
        error: { status: 404 }
      });
    }
    
    // Render settings form
    return res.render('users/settings', {
      title: 'Account Settings',
      profileUser: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user settings
 * @route POST /profile/settings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.updateSettings = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Get user data to re-render form with errors
      const user = await User.findById(req.user.id);
      
      return res.status(400).render('users/settings', {
        title: 'Account Settings',
        profileUser: user,
        errors: errors.array(),
        formData: req.body
      });
    }
    
    // Extract fields to update
    const { email } = req.body;
    
    // Find user by ID
    const user = await User.findById(req.user.id);
    
    // Check if user exists
    if (!user) {
      return res.status(404).render('error', {
        title: 'User Not Found',
        message: 'Unable to find your profile',
        error: { status: 404 }
      });
    }
    
    // Check if email is being changed
    if (email && email !== user.email) {
      // Check if email already exists
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        return res.status(400).render('users/settings', {
          title: 'Account Settings',
          profileUser: user,
          errors: [{ msg: 'Email already exists' }],
          formData: req.body
        });
      }
      
      // Update email
      user.email = email;
      
      // Reset email verification
      user.isEmailVerified = false;
      
      // Generate new verification token
      const verificationToken = user.generateEmailVerificationToken();
      
      // In a real application, send verification email
      // For now, just log it
      logger.info(`Email verification token for ${email}: ${verificationToken}`);
    }
    
    // Save updated user
    await user.save();
    
    // Log settings update
    logger.info(`User settings updated: ${user.username}`);
    
    // Add flash message (if flash middleware is configured)
    if (req.flash) {
      req.flash('success', 'Settings updated successfully');
    }
    
    // Redirect to settings page
    return res.redirect('/profile/settings');
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate user account
 * @route POST /profile/deactivate
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.deactivateAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    
    // Find user by ID with password
    const user = await User.findById(req.user.id).select('+password');
    
    // Check if user exists
    if (!user) {
      return res.status(404).render('error', {
        title: 'User Not Found',
        message: 'Unable to find your profile',
        error: { status: 404 }
      });
    }
    
    // Check if password is correct
    if (!(await user.matchPassword(password))) {
      return res.status(400).render('users/settings', {
        title: 'Account Settings',
        profileUser: user,
        errors: [{ msg: 'Password is incorrect' }],
        section: 'deactivate'
      });
    }
    
    // Deactivate account
    user.isActive = false;
    
    // Save user
    await user.save();
    
    // Log account deactivation
    logger.info(`User account deactivated: ${user.username}`);
    
    // Logout user
    req.session.destroy();
    res.clearCookie('token');
    
    // Render deactivation success page
    return res.render('users/deactivated', {
      title: 'Account Deactivated',
      message: 'Your account has been deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const User = require('../models/User');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { ApiError } = require('../middlewares/errorMiddleware');
const crypto = require('crypto');

/**
 * Register a new user
 * @route POST /auth/register
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.register = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('auth/register', {
        title: 'Register',
        errors: errors.array(),
        formData: req.body,
        user: null
      });
    }
    
    const { username, email, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(400).render('auth/register', {
        title: 'Register',
        errors: [{ msg: `${field === 'email' ? 'Email' : 'Username'} already exists` }],
        formData: req.body,
        user: null
      });
    }
    
    // Create new user
    const newUser = new User({
      username,
      email,
      password, // Will be hashed by pre-save middleware
      name: name || username
    });
    
    // Generate email verification token
    const verificationToken = newUser.generateEmailVerificationToken();
    
    // Save user
    await newUser.save();
    
    // Log user creation
    logger.info(`New user registered: ${username} (${email})`);
    
    // Create JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Set session
    req.session.user = {
      id: newUser._id,
      username: newUser.username,
      role: newUser.role,
      isLoggedIn: true
    };
    
    // Determine redirect URL
    const redirectUrl = req.query.redirect || '/';
    
    // Send success response
    if (req.header('accept')?.includes('application/json')) {
      // API response
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role
        },
        redirect: redirectUrl
      });
    } else {
      // Web response
      return res.redirect(redirectUrl);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * @route POST /auth/login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.login = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('auth/login', {
        title: 'Login',
        errors: errors.array(),
        formData: req.body,
        user: null
      });
    }
    
    const { username, password } = req.body;
    
    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username },
        { email: username } // Allow login with email
      ]
    }).select('+password'); // Include password field which is normally excluded
    
    // Check if user exists and password is correct
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).render('auth/login', {
        title: 'Login',
        errors: [{ msg: 'Invalid username or password' }],
        formData: { username },
        user: null
      });
    }
    
    // Update last login time
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });
    
    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Set session
    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role,
      isLoggedIn: true
    };
    
    // Log user login
    logger.info(`User logged in: ${username}`);
    
    // Determine redirect URL
    const redirectUrl = req.query.redirect || '/';
    
    // Send success response
    if (req.header('accept')?.includes('application/json')) {
      // API response
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        redirect: redirectUrl
      });
    } else {
      // Web response
      return res.redirect(redirectUrl);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * @route GET /auth/logout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.logout = (req, res) => {
  // Clear session
  req.session.destroy();
  
  // Clear cookie
  res.clearCookie('token');
  
  // Determine redirect URL
  const redirectUrl = req.query.redirect || '/';
  
  // Redirect to home page
  res.redirect(redirectUrl);
};

/**
 * Forgot password
 * @route POST /auth/forgot-password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('auth/forgot-password', {
        title: 'Forgot Password',
        errors: errors.array(),
        formData: req.body,
        user: null
      });
    }
    
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    // Skip if user not found (for security)
    if (!user) {
      return res.render('auth/forgot-password-success', {
        title: 'Password Reset Email Sent',
        message: 'If your email exists in our database, you will receive a password reset link shortly.'
      });
    }
    
    // Generate password reset token
    const resetToken = user.generateResetPasswordToken();
    
    // Save user with reset token
    await user.save({ validateBeforeSave: false });
    
    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password/${resetToken}`;
    
    // In a real application, send email with reset token
    // For now, just log it
    logger.info(`Password reset token for ${email}: ${resetToken}`);
    logger.info(`Reset URL: ${resetUrl}`);
    
    // Respond with success
    return res.render('auth/forgot-password-success', {
      title: 'Password Reset Email Sent',
      message: 'If your email exists in our database, you will receive a password reset link shortly.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password form
 * @route GET /auth/reset-password/:token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.resetPasswordForm = async (req, res, next) => {
  try {
    const { token } = req.params;
    
    // Hash token to match stored token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    // Check if token is valid
    if (!user) {
      return res.status(400).render('error', {
        title: 'Invalid Token',
        message: 'Password reset token is invalid or has expired',
        error: { status: 400 }
      });
    }
    
    // Render reset password form
    return res.render('auth/reset-password', {
      title: 'Reset Password',
      token,
      user: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 * @route POST /auth/reset-password/:token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('auth/reset-password', {
        title: 'Reset Password',
        errors: errors.array(),
        token,
        user: null
      });
    }
    
    // Hash token to match stored token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    // Check if token is valid
    if (!user) {
      return res.status(400).render('error', {
        title: 'Invalid Token',
        message: 'Password reset token is invalid or has expired',
        error: { status: 400 }
      });
    }
    
    // Update password
    user.password = password;
    
    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    // Save user
    await user.save();
    
    // Log password reset
    logger.info(`Password reset successful for user: ${user.username}`);
    
    // Render success page
    return res.render('auth/reset-password-success', {
      title: 'Password Reset Successful',
      message: 'Your password has been reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * @route GET /auth/me
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getMe = async (req, res, next) => {
  try {
    // Get user from database
    const user = await User.findById(req.user.id);
    
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    
    // Send user data
    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
        bio: user.bio,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

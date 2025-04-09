const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const tripController = require('../controllers/tripController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/images/trips'));
  },
  filename: (req, file, cb) => {
    // Generate a unique filename
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    cb(null, `trip-${Date.now()}-${uniqueSuffix}${path.extname(file.originalname)}`);
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
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * @route   GET /trips/create
 * @desc    Get create trip form
 * @access  Private
 */
router.get('/create', isAuthenticated, tripController.getCreateTripForm);

/**
 * @route   POST /trips/create
 * @desc    Create a new trip
 * @access  Private
 */
router.post('/create', 
  isAuthenticated, 
  [
    body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
    body('startDate').optional().isDate().withMessage('Invalid start date'),
    body('endDate').optional().isDate().withMessage('Invalid end date')
      .custom((value, { req }) => {
        if (req.body.startDate && value && new Date(value) < new Date(req.body.startDate)) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
    body('privacy').optional().isIn(['public', 'private', 'followers', 'link']).withMessage('Invalid privacy setting')
  ],
  tripController.createTrip
);

/**
 * @route   GET /trips/:id
 * @desc    Get trip details
 * @access  Public/Private (depends on privacy)
 */
router.get('/:id', tripController.getTripDetails);

/**
 * @route   GET /trips/:id/edit
 * @desc    Get edit trip form
 * @access  Private
 */
router.get('/:id/edit', isAuthenticated, tripController.getEditTripForm);

/**
 * @route   POST /trips/:id/edit
 * @desc    Update trip
 * @access  Private
 */
router.post('/:id/edit', 
  isAuthenticated, 
  [
    body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
    body('startDate').optional().isDate().withMessage('Invalid start date'),
    body('endDate').optional().isDate().withMessage('Invalid end date')
      .custom((value, { req }) => {
        if (req.body.startDate && value && new Date(value) < new Date(req.body.startDate)) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
    body('privacy').optional().isIn(['public', 'private', 'followers', 'link']).withMessage('Invalid privacy setting'),
    body('status').optional().isIn(['planning', 'completed', 'in-progress', 'cancelled']).withMessage('Invalid status')
  ],
  tripController.updateTrip
);

/**
 * @route   POST /trips/:id/delete
 * @desc    Delete trip
 * @access  Private
 */
router.post('/:id/delete', isAuthenticated, tripController.deleteTrip);

/**
 * @route   GET /trips/my-trips
 * @desc    Get user's trips
 * @access  Private
 */
router.get('/my-trips', isAuthenticated, tripController.getUserTrips);

/**
 * @route   POST /trips/:id/like
 * @desc    Like or unlike a trip
 * @access  Private
 */
router.post('/:id/like', isAuthenticated, tripController.toggleLike);

/**
 * @route   GET /trips/explore
 * @desc    Explore trips
 * @access  Public
 */
router.get('/explore', tripController.exploreTrips);

/**
 * @route   POST /trips/:id/upload-cover
 * @desc    Upload trip cover image
 * @access  Private
 */
router.post('/:id/upload-cover', 
  isAuthenticated, 
  upload.single('coverImage'),
  tripController.uploadCoverImage
);

module.exports = router;

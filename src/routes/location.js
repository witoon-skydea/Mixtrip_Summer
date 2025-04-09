const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const locationController = require('../controllers/locationController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

/**
 * @route   POST /locations/create
 * @desc    Create a new location
 * @access  Private
 */
router.post('/create', 
  isAuthenticated,
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
    body('coordinates.lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
    body('coordinates.lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
    body('types').optional().isArray().withMessage('Types must be an array'),
    body('types.*').optional().isIn([
      'accommodation', 'restaurant', 'cafe', 'bar', 'attraction', 
      'museum', 'park', 'beach', 'shopping', 'entertainment',
      'temple', 'landmark', 'transportation', 'viewpoint', 'other'
    ]).withMessage('Invalid location type'),
    body('website').optional().isURL().withMessage('Invalid website URL'),
    body('contactInfo.email').optional().isEmail().withMessage('Invalid email'),
    body('contactInfo.phone').optional().isString().withMessage('Invalid phone number')
  ],
  locationController.createLocation
);

/**
 * @route   GET /locations/:id
 * @desc    Get location details
 * @access  Public
 */
router.get('/:id', locationController.getLocationDetails);

/**
 * @route   PUT /locations/:id
 * @desc    Update location
 * @access  Private
 */
router.put('/:id', 
  isAuthenticated,
  [
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
    body('coordinates.lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
    body('coordinates.lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
    body('types').optional().isArray().withMessage('Types must be an array'),
    body('types.*').optional().isIn([
      'accommodation', 'restaurant', 'cafe', 'bar', 'attraction', 
      'museum', 'park', 'beach', 'shopping', 'entertainment',
      'temple', 'landmark', 'transportation', 'viewpoint', 'other'
    ]).withMessage('Invalid location type'),
    body('website').optional().isURL().withMessage('Invalid website URL'),
    body('contactInfo.email').optional().isEmail().withMessage('Invalid email'),
    body('contactInfo.phone').optional().isString().withMessage('Invalid phone number')
  ],
  locationController.updateLocation
);

/**
 * @route   DELETE /locations/:id
 * @desc    Delete location
 * @access  Private
 */
router.delete('/:id', isAuthenticated, locationController.deleteLocation);

/**
 * @route   GET /locations/search-page
 * @desc    Show location search page
 * @access  Public
 */
router.get('/search-page', locationController.getSearchPage);

/**
 * @route   GET /locations/search
 * @desc    Search locations API
 * @access  Public
 */
router.get('/search', locationController.searchLocations);

/**
 * @route   GET /locations/nearby
 * @desc    Get locations near coordinates
 * @access  Public
 */
router.get('/nearby', locationController.getNearbyLocations);

/**
 * @route   POST /locations/:locationId/add-to-trip/:tripId
 * @desc    Add location to trip
 * @access  Private
 */
router.post('/:locationId/add-to-trip/:tripId', isAuthenticated, locationController.addLocationToTrip);

/**
 * @route   DELETE /locations/:locationId/remove-from-trip/:tripId
 * @desc    Remove location from trip
 * @access  Private
 */
router.delete('/:locationId/remove-from-trip/:tripId', isAuthenticated, locationController.removeLocationFromTrip);

module.exports = router;

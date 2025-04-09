const Location = require('../models/Location');
const Trip = require('../models/Trip');
const { validationResult } = require('express-validator');
const { ApiError } = require('../middlewares/errorMiddleware');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

/**
 * Create a new location
 * @route POST /locations/create
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.createLocation = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const {
      name,
      description,
      address,
      coordinates,
      types,
      placeId,
      website,
      contactInfo,
      tripId
    } = req.body;
    
    // Validate required fields
    if (!name || !coordinates || !coordinates.lat || !coordinates.lng) {
      return res.status(400).json({
        success: false,
        message: 'Name and coordinates are required'
      });
    }
    
    // Create new location
    const newLocation = new Location({
      name,
      description,
      address: {
        street: address?.street || '',
        city: address?.city || '',
        state: address?.state || '',
        country: address?.country || '',
        postalCode: address?.postalCode || '',
        formattedAddress: address?.formattedAddress || ''
      },
      coordinates: {
        lat: coordinates.lat,
        lng: coordinates.lng
      },
      placeId,
      types: types || ['other'],
      creator: req.user.id,
      website,
      contactInfo: {
        phone: contactInfo?.phone || '',
        email: contactInfo?.email || ''
      },
      source: placeId ? 'google' : 'user'
    });
    
    // Save location
    await newLocation.save();
    
    // Log location creation
    logger.info(`New location created: ${name} by user ${req.user.id}`);
    
    // If tripId is provided, add location to trip
    if (tripId && mongoose.Types.ObjectId.isValid(tripId)) {
      const trip = await Trip.findById(tripId);
      
      if (trip && trip.creator.toString() === req.user.id) {
        trip.locations.push(newLocation._id);
        await trip.save();
        
        logger.info(`Location ${name} added to trip ${trip.title}`);
      }
    }
    
    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Location created successfully',
      data: {
        location: newLocation
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Show search page for locations
 * @route GET /locations/search-page
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getSearchPage = async (req, res, next) => {
  try {
    const { tripId } = req.query;
    
    // If tripId is provided, fetch the trip to get existing locations
    let existingLocations = [];
    
    if (tripId && mongoose.Types.ObjectId.isValid(tripId)) {
      const trip = await Trip.findById(tripId)
        .populate('locations');
      
      if (trip) {
        existingLocations = trip.locations || [];
      }
    }
    
    // Render search page
    res.render('locations/search', {
      title: tripId ? 'Add Locations to Trip' : 'Search Locations',
      tripId,
      existingLocations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get location details
 * @route GET /locations/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getLocationDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).render('error', {
        title: 'Invalid ID',
        message: 'The provided location ID is invalid',
        error: { status: 400 }
      });
    }
    
    // Find location by ID
    const location = await Location.findById(id)
      .populate('creator', 'username name profileImage');
    
    // Check if location exists
    if (!location) {
      return res.status(404).render('error', {
        title: 'Location Not Found',
        message: 'The requested location was not found',
        error: { status: 404 }
      });
    }
    
    // Find trips that include this location
    const relatedTrips = await Trip.find({
      locations: location._id,
      privacy: 'public'
    })
      .limit(5)
      .populate('creator', 'username name profileImage');
    
    // Render location details page
    res.render('locations/detail', {
      title: location.name,
      location,
      relatedTrips,
      isOwner: req.user && location.creator && location.creator._id.toString() === req.user.id
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update location
 * @route PUT /locations/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid location ID'
      });
    }
    
    // Find location by ID
    const location = await Location.findById(id);
    
    // Check if location exists
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }
    
    // Check if user is the creator or if location has no creator (system created)
    if (location.creator && location.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this location'
      });
    }
    
    const {
      name,
      description,
      address,
      coordinates,
      types,
      website,
      contactInfo
    } = req.body;
    
    // Update location fields
    if (name) location.name = name;
    if (description !== undefined) location.description = description;
    
    // Update address if provided
    if (address) {
      location.address = {
        street: address.street || location.address.street,
        city: address.city || location.address.city,
        state: address.state || location.address.state,
        country: address.country || location.address.country,
        postalCode: address.postalCode || location.address.postalCode,
        formattedAddress: address.formattedAddress || location.address.formattedAddress
      };
    }
    
    // Update coordinates if provided
    if (coordinates && coordinates.lat && coordinates.lng) {
      location.coordinates = {
        lat: coordinates.lat,
        lng: coordinates.lng
      };
    }
    
    // Update types if provided
    if (types && Array.isArray(types)) {
      location.types = types;
    }
    
    // Update website if provided
    if (website !== undefined) {
      location.website = website;
    }
    
    // Update contact info if provided
    if (contactInfo) {
      location.contactInfo = {
        phone: contactInfo.phone || location.contactInfo.phone,
        email: contactInfo.email || location.contactInfo.email
      };
    }
    
    // Save updated location
    await location.save();
    
    // Log location update
    logger.info(`Location updated: ${location.name} by user ${req.user.id}`);
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: {
        location
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete location
 * @route DELETE /locations/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.deleteLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid location ID'
      });
    }
    
    // Find location by ID
    const location = await Location.findById(id);
    
    // Check if location exists
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }
    
    // Check if user is the creator or if location has no creator (system created)
    if (location.creator && location.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this location'
      });
    }
    
    // Check if location is used in any trips
    const trips = await Trip.find({ locations: id });
    
    if (trips.length > 0) {
      // Remove location from trips instead of deleting
      await Promise.all(trips.map(async (trip) => {
        trip.locations = trip.locations.filter(loc => loc.toString() !== id);
        
        // Also remove from itinerary activities
        trip.itinerary.forEach(day => {
          day.activities = day.activities.filter(activity => {
            return !activity.location || activity.location.toString() !== id;
          });
        });
        
        await trip.save();
      }));
      
      logger.info(`Location ${location.name} removed from ${trips.length} trips`);
    }
    
    // Delete location
    await Location.findByIdAndDelete(id);
    
    // Log location deletion
    logger.info(`Location deleted: ${location.name} by user ${req.user.id}`);
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search locations
 * @route GET /locations/search
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.searchLocations = async (req, res, next) => {
  try {
    const { query, type, limit } = req.query;
    
    // Set up query options
    const queryOptions = {};
    
    // Add search by name
    if (query) {
      queryOptions.$or = [
        { name: { $regex: query, $options: 'i' } },
        { 'address.city': { $regex: query, $options: 'i' } },
        { 'address.country': { $regex: query, $options: 'i' } }
      ];
    }
    
    // Add filter by type
    if (type && type !== 'all') {
      queryOptions.types = { $in: [type] };
    }
    
    // Set limit
    const resultLimit = parseInt(limit) || 10;
    
    // Find locations matching query
    const locations = await Location.find(queryOptions)
      .limit(resultLimit)
      .populate('creator', 'username name');
    
    // Return results
    return res.status(200).json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get locations near coordinates
 * @route GET /locations/nearby
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getNearbyLocations = async (req, res, next) => {
  try {
    const { lat, lng, distance, type } = req.query;
    
    // Validate coordinates
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    // Convert coordinates to numbers
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    // Validate coordinate values
    if (isNaN(latitude) || isNaN(longitude) || 
        latitude < -90 || latitude > 90 || 
        longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }
    
    // Set max distance in meters (default: 5km)
    const maxDistance = parseInt(distance) || 5000;
    
    // Set up query options
    const queryOptions = {
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance
        }
      }
    };
    
    // Add filter by type
    if (type && type !== 'all') {
      queryOptions.types = { $in: [type] };
    }
    
    // Find nearby locations
    const locations = await Location.find(queryOptions)
      .limit(20)
      .populate('creator', 'username name');
    
    // Return results
    return res.status(200).json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add location to trip
 * @route POST /locations/:locationId/add-to-trip/:tripId
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.addLocationToTrip = async (req, res, next) => {
  try {
    const { locationId, tripId } = req.params;
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(locationId) || !mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid location or trip ID'
      });
    }
    
    // Find location by ID
    const location = await Location.findById(locationId);
    
    // Check if location exists
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }
    
    // Find trip by ID
    const trip = await Trip.findById(tripId);
    
    // Check if trip exists
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }
    
    // Check if user is the creator of the trip
    if (trip.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this trip'
      });
    }
    
    // Check if location is already in trip
    if (trip.locations.includes(locationId)) {
      return res.status(400).json({
        success: false,
        message: 'Location is already added to this trip'
      });
    }
    
    // Add location to trip
    trip.locations.push(locationId);
    
    // Save trip
    await trip.save();
    
    // Log location addition
    logger.info(`Location ${location.name} added to trip ${trip.title}`);
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Location added to trip successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove location from trip
 * @route DELETE /locations/:locationId/remove-from-trip/:tripId
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.removeLocationFromTrip = async (req, res, next) => {
  try {
    const { locationId, tripId } = req.params;
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(locationId) || !mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid location or trip ID'
      });
    }
    
    // Find trip by ID
    const trip = await Trip.findById(tripId);
    
    // Check if trip exists
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }
    
    // Check if user is the creator of the trip
    if (trip.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this trip'
      });
    }
    
    // Check if location is in trip
    if (!trip.locations.includes(locationId)) {
      return res.status(400).json({
        success: false,
        message: 'Location is not in this trip'
      });
    }
    
    // Remove location from trip
    trip.locations = trip.locations.filter(loc => loc.toString() !== locationId);
    
    // Also remove from itinerary activities
    trip.itinerary.forEach(day => {
      day.activities = day.activities.filter(activity => {
        return !activity.location || activity.location.toString() !== locationId;
      });
    });
    
    // Save trip
    await trip.save();
    
    // Log location removal
    logger.info(`Location removed from trip ${trip.title}`);
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Location removed from trip successfully'
    });
  } catch (error) {
    next(error);
  }
};

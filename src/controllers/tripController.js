const Trip = require('../models/Trip');
const Location = require('../models/Location');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { ApiError } = require('../middlewares/errorMiddleware');
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

/**
 * Get create trip form
 * @route GET /trips/create
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getCreateTripForm = (req, res) => {
  res.render('trips/create', {
    title: 'Create New Trip'
  });
};

/**
 * Create a new trip
 * @route POST /trips/create
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.createTrip = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('trips/create', {
        title: 'Create New Trip',
        errors: errors.array(),
        formData: req.body
      });
    }
    
    const {
      title,
      description,
      startDate,
      endDate,
      privacy,
      tags
    } = req.body;
    
    // Parse tags if provided as string
    let tagArray = [];
    if (tags) {
      if (typeof tags === 'string') {
        tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else if (Array.isArray(tags)) {
        tagArray = tags;
      }
    }
    
    // Calculate duration based on dates if provided
    let duration = null;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include start day
    }
    
    // Create new trip
    const newTrip = new Trip({
      title,
      description,
      creator: req.user.id,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      duration,
      privacy: privacy || 'public',
      tags: tagArray,
      status: 'planning'
    });
    
    // Save trip
    await newTrip.save();
    
    // Log trip creation
    logger.info(`New trip created: ${title} by user ${req.user.id}`);
    
    // Redirect to trip detail page
    res.redirect(`/trips/${newTrip._id}`);
  } catch (error) {
    next(error);
  }
};

/**
 * Get trip details
 * @route GET /trips/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getTripDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).render('error', {
        title: 'Invalid ID',
        message: 'The provided trip ID is invalid',
        error: { status: 400 }
      });
    }
    
    // Find trip by ID with populated fields
    const trip = await Trip.findById(id)
      .populate('creator', 'username name profileImage')
      .populate('locations')
      .populate({
        path: 'itinerary.activities.location',
        model: 'Location'
      });
    
    // Check if trip exists
    if (!trip) {
      return res.status(404).render('error', {
        title: 'Trip Not Found',
        message: 'The requested trip was not found',
        error: { status: 404 }
      });
    }
    
    // Check privacy settings
    if (trip.privacy !== 'public') {
      // If user is not logged in and trip is not public
      if (!req.user) {
        return res.status(403).render('error', {
          title: 'Access Denied',
          message: 'This trip is private',
          error: { status: 403 }
        });
      }
      
      // If trip is private and user is not the creator
      if (trip.privacy === 'private' && trip.creator._id.toString() !== req.user.id) {
        return res.status(403).render('error', {
          title: 'Access Denied',
          message: 'This trip is private',
          error: { status: 403 }
        });
      }
      
      // If trip is for followers only
      // (In future we'll implement follower check here)
    }
    
    // Check if user has liked the trip
    let userHasLiked = false;
    if (req.user) {
      userHasLiked = trip.likes.some(like => like.toString() === req.user.id);
    }
    
    // Increment view count if not the owner
    if (!req.user || trip.creator._id.toString() !== req.user.id) {
      trip.views += 1;
      await trip.save();
    }
    
    // Render trip details page
    res.render('trips/detail', {
      title: trip.title,
      trip,
      userHasLiked,
      isOwner: req.user && trip.creator._id.toString() === req.user.id
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get edit trip form
 * @route GET /trips/:id/edit
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getEditTripForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).render('error', {
        title: 'Invalid ID',
        message: 'The provided trip ID is invalid',
        error: { status: 400 }
      });
    }
    
    // Find trip by ID
    const trip = await Trip.findById(id);
    
    // Check if trip exists
    if (!trip) {
      return res.status(404).render('error', {
        title: 'Trip Not Found',
        message: 'The requested trip was not found',
        error: { status: 404 }
      });
    }
    
    // Check if user is the creator
    if (trip.creator.toString() !== req.user.id) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to edit this trip',
        error: { status: 403 }
      });
    }
    
    // Format dates for the form
    const formattedTrip = {
      ...trip.toObject(),
      startDate: trip.startDate ? trip.startDate.toISOString().split('T')[0] : '',
      endDate: trip.endDate ? trip.endDate.toISOString().split('T')[0] : '',
      tags: trip.tags.join(', ')
    };
    
    // Render edit trip form
    res.render('trips/edit', {
      title: `Edit Trip: ${trip.title}`,
      trip: formattedTrip
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update trip
 * @route POST /trips/:id/edit
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.updateTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('trips/edit', {
        title: 'Edit Trip',
        errors: errors.array(),
        trip: { _id: id, ...req.body }
      });
    }
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).render('error', {
        title: 'Invalid ID',
        message: 'The provided trip ID is invalid',
        error: { status: 400 }
      });
    }
    
    // Find trip by ID
    const trip = await Trip.findById(id);
    
    // Check if trip exists
    if (!trip) {
      return res.status(404).render('error', {
        title: 'Trip Not Found',
        message: 'The requested trip was not found',
        error: { status: 404 }
      });
    }
    
    // Check if user is the creator
    if (trip.creator.toString() !== req.user.id) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to edit this trip',
        error: { status: 403 }
      });
    }
    
    const {
      title,
      description,
      startDate,
      endDate,
      privacy,
      tags,
      status
    } = req.body;
    
    // Parse tags if provided as string
    let tagArray = [];
    if (tags) {
      if (typeof tags === 'string') {
        tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else if (Array.isArray(tags)) {
        tagArray = tags;
      }
    }
    
    // Calculate duration based on dates if provided
    let duration = null;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include start day
    }
    
    // Update trip fields
    trip.title = title || trip.title;
    trip.description = description !== undefined ? description : trip.description;
    trip.startDate = startDate ? new Date(startDate) : trip.startDate;
    trip.endDate = endDate ? new Date(endDate) : trip.endDate;
    trip.duration = duration || trip.duration;
    trip.privacy = privacy || trip.privacy;
    trip.tags = tagArray.length > 0 ? tagArray : trip.tags;
    trip.status = status || trip.status;
    
    // Save updated trip
    await trip.save();
    
    // Log trip update
    logger.info(`Trip updated: ${trip.title} by user ${req.user.id}`);
    
    // Redirect to trip detail page
    res.redirect(`/trips/${trip._id}`);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete trip
 * @route POST /trips/:id/delete
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.deleteTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).render('error', {
        title: 'Invalid ID',
        message: 'The provided trip ID is invalid',
        error: { status: 400 }
      });
    }
    
    // Find trip by ID
    const trip = await Trip.findById(id);
    
    // Check if trip exists
    if (!trip) {
      return res.status(404).render('error', {
        title: 'Trip Not Found',
        message: 'The requested trip was not found',
        error: { status: 404 }
      });
    }
    
    // Check if user is the creator
    if (trip.creator.toString() !== req.user.id) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to delete this trip',
        error: { status: 403 }
      });
    }
    
    // Delete trip
    await Trip.findByIdAndDelete(id);
    
    // Log trip deletion
    logger.info(`Trip deleted: ${trip.title} by user ${req.user.id}`);
    
    // Redirect to user's trips page
    res.redirect('/trips/my-trips');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's trips
 * @route GET /trips/my-trips
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getUserTrips = async (req, res, next) => {
  try {
    // Define filter options
    const filterOptions = { creator: req.user.id };
    
    // Get status filter from query parameter
    const { status, sort } = req.query;
    
    if (status && ['planning', 'completed', 'in-progress', 'cancelled'].includes(status)) {
      filterOptions.status = status;
    }
    
    // Define sort options
    let sortOptions = { createdAt: -1 }; // Default: newest first
    
    if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'title-asc') {
      sortOptions = { title: 1 };
    } else if (sort === 'title-desc') {
      sortOptions = { title: -1 };
    } else if (sort === 'start-date') {
      sortOptions = { startDate: 1 };
    } else if (sort === 'popularity') {
      sortOptions = { views: -1 };
    }
    
    // Find user's trips
    const trips = await Trip.find(filterOptions)
      .sort(sortOptions)
      .populate('creator', 'username name profileImage');
    
    // Render user's trips page
    res.render('trips/my-trips', {
      title: 'My Trips',
      trips,
      filters: {
        status,
        sort: sort || 'newest'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Like or unlike a trip
 * @route POST /trips/:id/like
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID'
      });
    }
    
    // Find trip by ID
    const trip = await Trip.findById(id);
    
    // Check if trip exists
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }
    
    // Check if user has already liked the trip
    const likeIndex = trip.likes.indexOf(req.user.id);
    
    if (likeIndex === -1) {
      // Like the trip
      trip.likes.push(req.user.id);
      await trip.save();
      
      return res.status(200).json({
        success: true,
        message: 'Trip liked successfully',
        liked: true,
        likeCount: trip.likes.length
      });
    } else {
      // Unlike the trip
      trip.likes.splice(likeIndex, 1);
      await trip.save();
      
      return res.status(200).json({
        success: true,
        message: 'Trip unliked successfully',
        liked: false,
        likeCount: trip.likes.length
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Explore trips
 * @route GET /trips/explore
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.exploreTrips = async (req, res, next) => {
  try {
    // Set up pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 12; // Trips per page
    const skip = (page - 1) * limit;
    
    // Set up filter options
    const filterOptions = { privacy: 'public' };
    
    // Additional filters from query parameters
    const { search, tag, location, duration } = req.query;
    
    if (search) {
      filterOptions.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (tag) {
      filterOptions.tags = { $in: [tag] };
    }
    
    if (location) {
      // Find locations that match the query
      const locations = await Location.find({
        $or: [
          { name: { $regex: location, $options: 'i' } },
          { 'address.city': { $regex: location, $options: 'i' } },
          { 'address.country': { $regex: location, $options: 'i' } }
        ]
      });
      
      const locationIds = locations.map(loc => loc._id);
      
      // Find trips that include these locations
      filterOptions.locations = { $in: locationIds };
    }
    
    if (duration) {
      // Parse duration filter
      const [min, max] = duration.split('-').map(Number);
      
      if (!isNaN(min) && !isNaN(max)) {
        filterOptions.duration = { $gte: min, $lte: max };
      } else if (!isNaN(min)) {
        filterOptions.duration = { $gte: min };
      } else if (!isNaN(max)) {
        filterOptions.duration = { $lte: max };
      }
    }
    
    // Set up sort options
    let sortOptions = { createdAt: -1 }; // Default: newest first
    
    const { sort } = req.query;
    
    if (sort === 'popular') {
      sortOptions = { views: -1 };
    } else if (sort === 'liked') {
      sortOptions = { 'likes.length': -1 };
    } else if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    }
    
    // Get total count for pagination
    const totalTrips = await Trip.countDocuments(filterOptions);
    
    // Get trips
    const trips = await Trip.find(filterOptions)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('creator', 'username name profileImage')
      .populate('locations', 'name coordinates');
    
    // Calculate total pages
    const totalPages = Math.ceil(totalTrips / limit);
    
    // Render explore page
    res.render('trips/explore', {
      title: 'Explore Trips',
      trips,
      pagination: {
        page,
        totalPages,
        totalTrips,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        search,
        tag,
        location,
        duration,
        sort: sort || 'newest'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload trip cover image
 * @route POST /trips/:id/upload-cover
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.uploadCoverImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      // Remove uploaded file
      fs.unlinkSync(req.file.path);
      
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID'
      });
    }
    
    // Find trip by ID
    const trip = await Trip.findById(id);
    
    // Check if trip exists
    if (!trip) {
      // Remove uploaded file
      fs.unlinkSync(req.file.path);
      
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }
    
    // Check if user is the creator
    if (trip.creator.toString() !== req.user.id) {
      // Remove uploaded file
      fs.unlinkSync(req.file.path);
      
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this trip'
      });
    }
    
    // Remove old cover image if not default
    if (trip.coverImage !== 'default-trip-cover.jpg') {
      const oldImagePath = path.join(__dirname, '../../public/images/trips', trip.coverImage);
      
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    
    // Update trip cover image
    trip.coverImage = req.file.filename;
    
    // Save trip
    await trip.save();
    
    // Log cover image update
    logger.info(`Trip cover image updated: ${trip.title} by user ${req.user.id}`);
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Cover image updated successfully',
      data: {
        coverImage: trip.coverImage
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

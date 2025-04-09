/**
 * Initialize database and create indexes
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Trip = require('../models/Trip');
const Location = require('../models/Location');
const { connectDB } = require('../config/database');
const logger = require('./logger');
require('dotenv').config();

const initializeDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('Connected to MongoDB');
    
    // Create text indexes for searching
    logger.info('Creating indexes...');
    
    // User indexes
    await User.collection.createIndex({ username: 1 }, { unique: true });
    await User.collection.createIndex({ email: 1 }, { unique: true });
    logger.info('User indexes created');
    
    // Trip indexes
    await Trip.collection.createIndex({ title: 'text', description: 'text', tags: 'text' });
    await Trip.collection.createIndex({ creator: 1 });
    await Trip.collection.createIndex({ privacy: 1 });
    await Trip.collection.createIndex({ status: 1 });
    await Trip.collection.createIndex({ createdAt: -1 });
    await Trip.collection.createIndex({ views: -1 });
    logger.info('Trip indexes created');
    
    // Location indexes
    await Location.collection.createIndex({ name: 'text', description: 'text', tags: 'text', 'address.city': 'text', 'address.country': 'text' });
    await Location.collection.createIndex({ 'coordinates': '2dsphere' });
    await Location.collection.createIndex({ types: 1 });
    logger.info('Location indexes created');
    
    logger.info('Database initialization completed successfully');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
    
    process.exit(0);
  } catch (error) {
    logger.error(`Error initializing database: ${error.message}`);
    process.exit(1);
  }
};

// Run initialization
initializeDatabase();

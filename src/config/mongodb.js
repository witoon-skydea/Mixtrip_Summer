/**
 * MongoDB Atlas configuration
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');
require('dotenv').config();

const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: process.env.DB_NAME || 'mixtrip_summer_db',
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
};

const uri = process.env.MONGODB_URI;

// Fallback connection for local development
const localUri = 'mongodb://localhost:27017/mixtrip_summer_db';

/**
 * Connect to MongoDB Atlas
 * @returns {Promise} MongoDB connection
 */
const connectToAtlas = async () => {
  try {
    const conn = await mongoose.connect(uri, mongoOptions);
    logger.info(`MongoDB Atlas connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB Atlas connection error: ${error.message}`);
    logger.info('Attempting to connect to local MongoDB instance...');
    
    try {
      const localConn = await mongoose.connect(localUri, mongoOptions);
      logger.info(`Local MongoDB connected: ${localConn.connection.host}`);
      return localConn;
    } catch (localError) {
      logger.error(`Local MongoDB connection error: ${localError.message}`);
      throw new Error('Failed to connect to any MongoDB instance');
    }
  }
};

module.exports = {
  connectToAtlas,
  mongoOptions,
  uri
};

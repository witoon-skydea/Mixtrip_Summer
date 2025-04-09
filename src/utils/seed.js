/**
 * Seed script for populating database with sample data
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Trip = require('../models/Trip');
const Location = require('../models/Location');
const { connectDB } = require('../config/database');
const logger = require('./logger');
require('dotenv').config();

// Sample user data
const users = [
  {
    username: 'admin',
    email: 'admin@mixtrip.com',
    password: 'password123',
    name: 'Admin User',
    profileImage: 'default-profile.png',
    bio: 'MixTrip administrator and travel enthusiast',
    role: 'admin',
    isEmailVerified: true
  },
  {
    username: 'traveler1',
    email: 'traveler1@example.com',
    password: 'password123',
    name: 'Travel Explorer',
    profileImage: 'default-profile.png',
    bio: 'I love exploring new places and sharing my experiences',
    role: 'user',
    isEmailVerified: true
  },
  {
    username: 'traveler2',
    email: 'traveler2@example.com',
    password: 'password123',
    name: 'Adventure Seeker',
    profileImage: 'default-profile.png',
    bio: 'Adventure enthusiast and photography lover',
    role: 'user',
    isEmailVerified: true
  }
];

// Sample location data
const locations = [
  {
    name: 'Grand Palace',
    description: 'The Grand Palace is a complex of buildings at the heart of Bangkok, Thailand. It has been the official residence of the Kings of Siam since 1782.',
    address: {
      street: 'Na Phra Lan Road',
      city: 'Bangkok',
      country: 'Thailand',
      formattedAddress: 'Grand Palace, Na Phra Lan Road, Bangkok, Thailand'
    },
    coordinates: {
      lat: 13.7500,
      lng: 100.4914
    },
    types: ['attraction', 'landmark'],
    images: [{
      url: 'default-location.jpg',
      caption: 'Grand Palace',
      isMain: true
    }]
  },
  {
    name: 'Wat Phra That Doi Suthep',
    description: 'A Buddhist temple in Chiang Mai, Thailand. The temple is often referred to as "Doi Suthep" although this is actually the name of the mountain where it\'s located.',
    address: {
      city: 'Chiang Mai',
      country: 'Thailand',
      formattedAddress: 'Wat Phra That Doi Suthep, Chiang Mai, Thailand'
    },
    coordinates: {
      lat: 18.8048,
      lng: 98.9212
    },
    types: ['temple', 'attraction'],
    images: [{
      url: 'default-location.jpg',
      caption: 'Doi Suthep Temple',
      isMain: true
    }]
  },
  {
    name: 'Patong Beach',
    description: 'Patong Beach is one of the most popular beaches in Phuket, with a wide variety of activities, restaurants, and nightlife.',
    address: {
      city: 'Patong',
      state: 'Phuket',
      country: 'Thailand',
      formattedAddress: 'Patong Beach, Patong, Phuket, Thailand'
    },
    coordinates: {
      lat: 7.9034,
      lng: 98.2968
    },
    types: ['beach', 'entertainment'],
    images: [{
      url: 'default-location.jpg',
      caption: 'Patong Beach',
      isMain: true
    }]
  },
  {
    name: 'Railay Beach',
    description: 'Railay Beach is a small peninsula between the city of Krabi and Ao Nang in Thailand. It\'s accessible only by boat due to the high limestone cliffs cutting off mainland access.',
    address: {
      city: 'Krabi',
      country: 'Thailand',
      formattedAddress: 'Railay Beach, Krabi, Thailand'
    },
    coordinates: {
      lat: 8.0154,
      lng: 98.8347
    },
    types: ['beach', 'viewpoint'],
    images: [{
      url: 'default-location.jpg',
      caption: 'Railay Beach',
      isMain: true
    }]
  }
];

// Sample trip data (to be populated after users and locations are created)
const tripTemplates = [
  {
    title: 'Bangkok Weekend Getaway',
    description: 'A quick weekend trip to explore Bangkok\'s cultural highlights and amazing food.',
    startDate: new Date('2025-05-01'),
    endDate: new Date('2025-05-03'),
    coverImage: 'bangkok-weekend.jpg',
    privacy: 'public',
    tags: ['weekend', 'culture', 'food', 'bangkok'],
    status: 'planning'
  },
  {
    title: 'Chiang Mai Adventure',
    description: 'Explore the mountains, temples, and culture of Chiang Mai in northern Thailand.',
    startDate: new Date('2025-06-15'),
    endDate: new Date('2025-06-20'),
    coverImage: 'chiang-mai-adventure.jpg',
    privacy: 'public',
    tags: ['adventure', 'nature', 'temple', 'chiangmai'],
    status: 'planning'
  },
  {
    title: 'Phuket Beach Hopping',
    description: 'Discover the most beautiful beaches in Phuket with this island-hopping itinerary.',
    startDate: new Date('2025-07-10'),
    endDate: new Date('2025-07-17'),
    coverImage: 'phuket-beaches.jpg',
    privacy: 'public',
    tags: ['beach', 'island', 'swimming', 'phuket'],
    status: 'planning'
  }
];

// Seed data function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    await Trip.deleteMany({});
    await Location.deleteMany({});
    
    logger.info('Database cleared');
    
    // Create users
    const createdUsers = [];
    
    for (const user of users) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      // Create user with hashed password
      const newUser = await User.create({
        ...user,
        password: hashedPassword
      });
      
      createdUsers.push(newUser);
      logger.info(`Created user: ${newUser.username}`);
    }
    
    // Create locations
    const createdLocations = [];
    
    for (const location of locations) {
      // Assign a random creator from the users
      const creator = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      
      const newLocation = await Location.create({
        ...location,
        creator: creator._id
      });
      
      createdLocations.push(newLocation);
      logger.info(`Created location: ${newLocation.name}`);
    }
    
    // Create trips
    for (let i = 0; i < tripTemplates.length; i++) {
      const tripTemplate = tripTemplates[i];
      // Assign a user and locations to the trip
      const creator = createdUsers[i % createdUsers.length];
      
      // Select some locations for this trip
      const tripLocations = createdLocations.filter(location => {
        // Logic to match locations with trips (simplified for sample data)
        if (i === 0 && location.address.city === 'Bangkok') return true;
        if (i === 1 && location.address.city === 'Chiang Mai') return true;
        if (i === 2 && (location.address.state === 'Phuket' || location.address.city === 'Patong')) return true;
        return false;
      }).map(location => location._id);
      
      // Create trip
      const newTrip = await Trip.create({
        ...tripTemplate,
        creator: creator._id,
        locations: tripLocations
      });
      
      logger.info(`Created trip: ${newTrip.title}`);
    }
    
    logger.info('Database seeded successfully');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
    
    process.exit(0);
  } catch (error) {
    logger.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

// Run seed function
seedDatabase();

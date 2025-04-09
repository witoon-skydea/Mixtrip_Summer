/**
 * Seeder for MixTrip Summer
 * This script populates the database with sample data for development
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Trip = require('../models/Trip');
const Location = require('../models/Location');
const { connectDB } = require('../config/database');
require('dotenv').config();

// Sample data
const users = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'password123',
    name: 'Admin User',
    bio: 'Platform administrator and travel enthusiast',
    role: 'admin',
    isEmailVerified: true,
    isActive: true,
    profileImage: 'default-profile.png'
  },
  {
    username: 'johndoe',
    email: 'john.doe@example.com',
    password: 'password123',
    name: 'John Doe',
    bio: 'Adventure seeker and foodie. Love exploring new places and cultures.',
    role: 'user',
    isEmailVerified: true,
    isActive: true,
    profileImage: 'default-profile.png'
  },
  {
    username: 'janedoe',
    email: 'jane.doe@example.com',
    password: 'password123',
    name: 'Jane Doe',
    bio: 'Nature lover and photographer. Always looking for the perfect shot.',
    role: 'user',
    isEmailVerified: true,
    isActive: true,
    profileImage: 'default-profile.png'
  }
];

const locations = [
  {
    name: 'Grand Palace',
    description: 'The Grand Palace is a complex of buildings at the heart of Bangkok, Thailand. The palace has been the official residence of the Kings of Siam since 1782.',
    address: {
      street: 'Na Phra Lan Road',
      city: 'Bangkok',
      state: '',
      country: 'Thailand',
      postalCode: '10200',
      formattedAddress: 'Na Phra Lan Road, Bangkok 10200, Thailand'
    },
    coordinates: {
      lat: 13.7500,
      lng: 100.4914
    },
    types: ['attraction', 'landmark', 'temple'],
    isVerified: true,
    source: 'system'
  },
  {
    name: 'Wat Arun',
    description: 'Wat Arun is a Buddhist temple in Bangkok Yai district of Bangkok, Thailand, on the Thonburi west bank of the Chao Phraya River.',
    address: {
      street: '158 Thanon Wang Doem',
      city: 'Bangkok',
      state: '',
      country: 'Thailand',
      postalCode: '10600',
      formattedAddress: '158 Thanon Wang Doem, Bangkok 10600, Thailand'
    },
    coordinates: {
      lat: 13.7437,
      lng: 100.4888
    },
    types: ['attraction', 'temple'],
    isVerified: true,
    source: 'system'
  },
  {
    name: 'Chatuchak Weekend Market',
    description: 'Chatuchak Weekend Market, on Kamphaengphet 2 Road, Chatuchak, Bangkok, is the largest market in Thailand.',
    address: {
      street: 'Kamphaengphet 2 Road',
      city: 'Bangkok',
      state: '',
      country: 'Thailand',
      postalCode: '10900',
      formattedAddress: 'Kamphaengphet 2 Road, Bangkok 10900, Thailand'
    },
    coordinates: {
      lat: 13.7999,
      lng: 100.5500
    },
    types: ['shopping'],
    isVerified: true,
    source: 'system'
  },
  {
    name: 'Khao San Road',
    description: 'Famous backpacker street with numerous bars, restaurants, and shops.',
    address: {
      street: 'Khao San Road',
      city: 'Bangkok',
      state: '',
      country: 'Thailand',
      postalCode: '10200',
      formattedAddress: 'Khao San Road, Bangkok 10200, Thailand'
    },
    coordinates: {
      lat: 13.7582,
      lng: 100.4971
    },
    types: ['entertainment', 'restaurant', 'shopping'],
    isVerified: true,
    source: 'system'
  },
  {
    name: 'Siam Paragon',
    description: 'One of the biggest shopping centers in Asia, with a wide range of luxury and international brands.',
    address: {
      street: '991 Rama I Road',
      city: 'Bangkok',
      state: '',
      country: 'Thailand',
      postalCode: '10330',
      formattedAddress: '991 Rama I Road, Bangkok 10330, Thailand'
    },
    coordinates: {
      lat: 13.7465,
      lng: 100.5347
    },
    types: ['shopping', 'entertainment'],
    isVerified: true,
    source: 'system'
  }
];

const trips = [
  {
    title: 'Bangkok Weekend Getaway',
    description: 'A quick weekend trip exploring the highlights of Bangkok. Perfect for first-time visitors.',
    startDate: new Date('2025-05-01'),
    endDate: new Date('2025-05-03'),
    privacy: 'public',
    status: 'planning',
    tags: ['Bangkok', 'weekend', 'city', 'food', 'culture'],
    coverImage: 'default-trip-cover.jpg'
  },
  {
    title: 'Shopping Spree in Bangkok',
    description: 'A dedicated shopping tour of Bangkok\'s best malls, markets, and boutiques.',
    startDate: new Date('2025-06-10'),
    endDate: new Date('2025-06-13'),
    privacy: 'public',
    status: 'planning',
    tags: ['Bangkok', 'shopping', 'fashion', 'markets'],
    coverImage: 'default-trip-cover.jpg'
  }
];

// Function to seed the database
const seedDB = async () => {
  try {
    // Connect to the database
    await connectDB();
    
    // Ask for confirmation
    console.log('This will delete all existing data and populate the database with sample data.');
    console.log('Are you sure you want to continue? (y/n)');
    
    process.stdin.once('data', async (data) => {
      const answer = data.toString().trim().toLowerCase();
      
      if (answer === 'y') {
        console.log('Starting seeding process...');
        
        // Clear existing data
        await User.deleteMany({});
        await Trip.deleteMany({});
        await Location.deleteMany({});
        
        console.log('Existing data cleared successfully');
        
        // Create users
        const createdUsers = [];
        for (const user of users) {
          // Hash password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(user.password, salt);
          
          // Create user
          const newUser = await User.create({
            ...user,
            password: hashedPassword
          });
          
          createdUsers.push(newUser);
          console.log(`User created: ${newUser.username}`);
        }
        
        // Create locations
        const createdLocations = [];
        for (const location of locations) {
          const newLocation = await Location.create({
            ...location,
            creator: createdUsers[0]._id // Admin user as creator
          });
          
          createdLocations.push(newLocation);
          console.log(`Location created: ${newLocation.name}`);
        }
        
        // Create trips
        for (let i = 0; i < trips.length; i++) {
          const tripLocations = createdLocations.slice(0, 3); // First 3 locations for each trip
          
          // Create trip with user reference
          const newTrip = await Trip.create({
            ...trips[i],
            creator: createdUsers[i + 1]._id, // Different users for each trip
            locations: tripLocations.map(loc => loc._id),
            itinerary: [
              {
                day: 1,
                date: new Date(trips[i].startDate),
                activities: [
                  {
                    location: tripLocations[0]._id,
                    title: `Visit ${tripLocations[0].name}`,
                    description: `Exploring ${tripLocations[0].name}`,
                    startTime: '09:00',
                    endTime: '12:00',
                    order: 1
                  },
                  {
                    location: tripLocations[1]._id,
                    title: `Visit ${tripLocations[1].name}`,
                    description: `Exploring ${tripLocations[1].name}`,
                    startTime: '14:00',
                    endTime: '17:00',
                    order: 2
                  }
                ]
              },
              {
                day: 2,
                date: new Date(new Date(trips[i].startDate).setDate(new Date(trips[i].startDate).getDate() + 1)),
                activities: [
                  {
                    location: tripLocations[2]._id,
                    title: `Visit ${tripLocations[2].name}`,
                    description: `Exploring ${tripLocations[2].name}`,
                    startTime: '10:00',
                    endTime: '13:00',
                    order: 1
                  }
                ]
              }
            ]
          });
          
          console.log(`Trip created: ${newTrip.title}`);
        }
        
        console.log('Database seeded successfully!');
        process.exit(0);
      } else {
        console.log('Seeding canceled');
        process.exit(0);
      }
    });
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDB();

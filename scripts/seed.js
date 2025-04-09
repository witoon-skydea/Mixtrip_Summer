/**
 * Database Seeder for MixTrip Summer
 * This script populates the database with initial demo data for testing
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Import models
const User = require('../src/models/User');
const Trip = require('../src/models/Trip');
const Location = require('../src/models/Location');

// Configure MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'mixtrip_summer_db'
    });
    console.log('Connected to MongoDB for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed Users
const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      username: 'admin',
      email: 'admin@mixtrip.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date()
    });
    await admin.save();
    
    // Create regular users
    const password = await bcrypt.hash('password123', 10);
    
    const john = new User({
      username: 'john_traveler',
      email: 'john@example.com',
      password: password,
      name: 'John Smith',
      bio: 'Adventure seeker and nature lover. Always looking for the next destination!',
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    });
    await john.save();
    
    const sarah = new User({
      username: 'sarah_explorer',
      email: 'sarah@example.com',
      password: password,
      name: 'Sarah Johnson',
      bio: 'Food enthusiast and city explorer. I travel to eat and discover local cuisine!',
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
    });
    await sarah.save();
    
    const michael = new User({
      username: 'michael_backpacker',
      email: 'michael@example.com',
      password: password,
      name: 'Michael Brown',
      bio: 'Budget backpacker and hostel hopper. Traveling the world one country at a time!',
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
    });
    await michael.save();
    
    console.log('Created 4 users');
    return { admin, john, sarah, michael };
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

// Seed Locations
const seedLocations = async (users) => {
  try {
    // Clear existing locations
    await Location.deleteMany({});
    console.log('Cleared existing locations');
    
    // Create locations
    const locations = [
      // Bangkok locations
      new Location({
        name: 'Grand Palace',
        description: 'Former residence of the Kings of Thailand, featuring stunning architecture and sacred temples.',
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
        creator: users.admin._id,
        isVerified: true,
        website: 'https://www.royalgrandpalace.th',
        contactInfo: {
          phone: '+66 2 623 5500'
        },
        source: 'system'
      }),
      
      new Location({
        name: 'Wat Arun',
        description: 'Temple of Dawn featuring a distinctive spire decorated with colorful porcelain.',
        address: {
          street: '158 Thanon Wang Doem',
          city: 'Bangkok',
          state: '',
          country: 'Thailand',
          postalCode: '10600',
          formattedAddress: '158 Thanon Wang Doem, Bangkok 10600, Thailand'
        },
        coordinates: {
          lat: 13.7430,
          lng: 100.4893
        },
        types: ['attraction', 'temple'],
        creator: users.admin._id,
        isVerified: true,
        website: 'https://www.watarun.org',
        source: 'system'
      }),
      
      new Location({
        name: 'Chatuchak Weekend Market',
        description: 'One of the world\'s largest weekend markets with over 8,000 stalls selling everything imaginable.',
        address: {
          city: 'Bangkok',
          country: 'Thailand',
          formattedAddress: 'Kamphaeng Phet 2 Rd, Bangkok, Thailand'
        },
        coordinates: {
          lat: 13.7999,
          lng: 100.5500
        },
        types: ['shopping', 'attraction'],
        creator: users.john._id,
        source: 'user'
      }),
      
      // Chiang Mai locations
      new Location({
        name: 'Doi Suthep',
        description: 'Sacred mountain temple offering panoramic views of Chiang Mai.',
        address: {
          city: 'Chiang Mai',
          country: 'Thailand',
          formattedAddress: 'Doi Suthep, Chiang Mai, Thailand'
        },
        coordinates: {
          lat: 18.8048,
          lng: 98.9212
        },
        types: ['attraction', 'temple', 'viewpoint'],
        creator: users.admin._id,
        isVerified: true,
        source: 'system'
      }),
      
      new Location({
        name: 'Chiang Mai Night Bazaar',
        description: 'Famous night market with local handicrafts, clothing, and delicious street food.',
        address: {
          street: 'Chang Khlan Road',
          city: 'Chiang Mai',
          country: 'Thailand',
          formattedAddress: 'Chang Khlan Road, Chiang Mai, Thailand'
        },
        coordinates: {
          lat: 18.7873,
          lng: 98.9936
        },
        types: ['shopping', 'entertainment'],
        creator: users.sarah._id,
        source: 'user'
      }),
      
      // Phuket locations
      new Location({
        name: 'Patong Beach',
        description: 'Lively beach with water activities, restaurants, and vibrant nightlife.',
        address: {
          city: 'Phuket',
          country: 'Thailand',
          formattedAddress: 'Patong Beach, Phuket, Thailand'
        },
        coordinates: {
          lat: 7.9037,
          lng: 98.2970
        },
        types: ['beach', 'entertainment'],
        creator: users.admin._id,
        isVerified: true,
        source: 'system'
      }),
      
      new Location({
        name: 'Big Buddha Phuket',
        description: 'Massive 45-meter tall marble Buddha statue overlooking the island.',
        address: {
          city: 'Phuket',
          country: 'Thailand',
          formattedAddress: 'Big Buddha, Phuket, Thailand'
        },
        coordinates: {
          lat: 7.8276,
          lng: 98.3116
        },
        types: ['attraction', 'landmark', 'viewpoint'],
        creator: users.michael._id,
        source: 'user'
      })
    ];
    
    for (const location of locations) {
      await location.save();
    }
    
    console.log(`Created ${locations.length} locations`);
    return locations;
  } catch (error) {
    console.error('Error seeding locations:', error);
    throw error;
  }
};

// Seed Trips
const seedTrips = async (users, locations) => {
  try {
    // Clear existing trips
    await Trip.deleteMany({});
    console.log('Cleared existing trips');
    
    // Create trips
    const bangkokWeekend = new Trip({
      title: 'Bangkok Weekend Getaway',
      description: 'Experience the best of Bangkok in a weekend—explore temples, markets, and amazing food.',
      creator: users.john._id,
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000), // 16 days from now
      duration: 3,
      locations: [
        locations[0]._id, // Grand Palace
        locations[1]._id, // Wat Arun
        locations[2]._id  // Chatuchak
      ],
      itinerary: [
        {
          day: 1,
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          activities: [
            {
              title: 'Visit Grand Palace',
              description: 'Explore the magnificent palace complex and Wat Phra Kaew (Temple of the Emerald Buddha).',
              location: locations[0]._id,
              startTime: '09:00',
              endTime: '12:00',
              order: 1
            },
            {
              title: 'Lunch at local restaurant',
              description: 'Try authentic Thai cuisine near the palace.',
              startTime: '12:30',
              endTime: '13:30',
              order: 2
            },
            {
              title: 'Visit Wat Arun',
              description: 'Take a boat across the river and explore the Temple of Dawn.',
              location: locations[1]._id,
              startTime: '14:00',
              endTime: '16:00',
              order: 3
            }
          ]
        },
        {
          day: 2,
          date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          activities: [
            {
              title: 'Chatuchak Weekend Market',
              description: 'Shop until you drop at one of the world\'s largest weekend markets.',
              location: locations[2]._id,
              startTime: '10:00',
              endTime: '15:00',
              order: 1
            }
          ]
        },
        {
          day: 3,
          date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
          activities: [
            {
              title: 'Free day for exploring',
              description: 'Visit any places you missed or do some last-minute shopping.',
              startTime: '10:00',
              endTime: '16:00',
              order: 1
            }
          ]
        }
      ],
      privacy: 'public',
      tags: ['weekend', 'city', 'culture', 'shopping'],
      status: 'planning',
      views: 245,
      likes: [users.sarah._id, users.michael._id],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    });
    await bangkokWeekend.save();
    
    const chiangMaiAdventure = new Trip({
      title: 'Chiang Mai Adventure',
      description: 'Discover Chiang Mai\'s ancient temples, mountain views, and unique cultural experiences.',
      creator: users.sarah._id,
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      endDate: new Date(Date.now() + 34 * 24 * 60 * 60 * 1000), // 34 days from now
      duration: 5,
      locations: [
        locations[3]._id, // Doi Suthep
        locations[4]._id  // Night Bazaar
      ],
      itinerary: [
        {
          day: 1,
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          activities: [
            {
              title: 'Arrival and check-in',
              description: 'Arrive in Chiang Mai and settle into accommodation.',
              startTime: '14:00',
              endTime: '16:00',
              order: 1
            },
            {
              title: 'Visit Night Bazaar',
              description: 'Explore the famous night market and enjoy dinner from street vendors.',
              location: locations[4]._id,
              startTime: '18:00',
              endTime: '21:00',
              order: 2
            }
          ]
        },
        {
          day: 2,
          date: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
          activities: [
            {
              title: 'Doi Suthep Temple',
              description: 'Visit the sacred mountain temple and enjoy panoramic views of the city.',
              location: locations[3]._id,
              startTime: '09:00',
              endTime: '13:00',
              order: 1
            }
          ]
        }
        // Additional days would be added here
      ],
      privacy: 'public',
      tags: ['adventure', 'culture', 'nature', 'temples'],
      status: 'planning',
      views: 187,
      likes: [users.john._id],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
    });
    await chiangMaiAdventure.save();
    
    const phuketBeaches = new Trip({
      title: 'Phuket Beach Hopping',
      description: 'Explore the most beautiful beaches in Phuket with this comprehensive itinerary.',
      creator: users.michael._id,
      startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      endDate: new Date(Date.now() + 66 * 24 * 60 * 60 * 1000), // 66 days from now
      duration: 7,
      locations: [
        locations[5]._id, // Patong Beach
        locations[6]._id  // Big Buddha
      ],
      itinerary: [
        {
          day: 1,
          date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          activities: [
            {
              title: 'Arrival and beach time',
              description: 'Check in to accommodation and relax on Patong Beach.',
              location: locations[5]._id,
              startTime: '14:00',
              endTime: '18:00',
              order: 1
            }
          ]
        },
        {
          day: 2,
          date: new Date(Date.now() + 61 * 24 * 60 * 60 * 1000),
          activities: [
            {
              title: 'Visit Big Buddha',
              description: 'Enjoy the spectacular views and impressive Buddha statue.',
              location: locations[6]._id,
              startTime: '10:00',
              endTime: '13:00',
              order: 1
            }
          ]
        }
        // Additional days would be added here
      ],
      privacy: 'public',
      tags: ['beach', 'relaxation', 'island', 'summer'],
      status: 'planning',
      views: 312,
      likes: [users.john._id, users.sarah._id, users.admin._id],
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
    });
    await phuketBeaches.save();
    
    console.log('Created 3 trips');
  } catch (error) {
    console.error('Error seeding trips:', error);
    throw error;
  }
};

// Main function to run all seeders
const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Run seeders
    const users = await seedUsers();
    const locations = await seedLocations(users);
    await seedTrips(users, locations);
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();

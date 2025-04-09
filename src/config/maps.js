/**
 * Maps Configuration
 * Contains configuration for maps functionality
 */

const mapsConfig = {
  provider: process.env.MAP_PROVIDER || 'google',
  
  // Google Maps API configuration
  google: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
    defaultCenter: {
      lat: 13.7563,
      lng: 100.5018
    },
    defaultZoom: 13
  },
  
  // OpenStreetMap configuration (fallback)
  osm: {
    tileServer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    defaultCenter: {
      lat: 13.7563,
      lng: 100.5018
    },
    defaultZoom: 13
  }
};

module.exports = mapsConfig;
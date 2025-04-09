/**
 * Application configuration settings
 */
const appConfig = {
  // Application settings
  name: 'MixTrip Summer',
  description: 'A web application for planning and sharing trip itineraries',
  version: '1.0.0',
  
  // Environment settings
  environment: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Server settings
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  
  // Security settings
  jwtSecret: process.env.JWT_SECRET || 'mixtrip_summer_default_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  sessionSecret: process.env.SESSION_SECRET || 'mixtrip_summer_default_session_secret',
  
  // File upload settings
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB
  
  // Pagination defaults
  defaultPageSize: 10,
  maxPageSize: 100,
  
  // External API keys (to be added later)
  // googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  
  // Feature flags
  features: {
    enableEmailVerification: false,
    enableGoogleMaps: false,
    enableSocialSharing: false,
    enableRemixing: false,
    enableNotifications: false,
    enableComments: false
  }
};

module.exports = appConfig;

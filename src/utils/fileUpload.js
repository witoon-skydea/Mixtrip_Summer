/**
 * File Upload Utility
 * Handles file uploads with multer and provides utility functions
 */
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const logger = require('./logger');

/**
 * Get upload directory path based on type
 * @param {string} type - Type of upload (profile, trip, etc.)
 * @returns {string} Directory path
 */
const getUploadDir = (type) => {
  const baseDir = path.join(__dirname, '../../public/images');
  
  switch (type) {
    case 'profile':
      return path.join(baseDir, 'profiles');
    case 'trip':
      return path.join(baseDir, 'trips');
    case 'location':
      return path.join(baseDir, 'locations');
    default:
      return path.join(__dirname, '../../public/uploads');
  }
};

/**
 * Create multer storage for specific type
 * @param {string} type - Type of upload (profile, trip, etc.)
 * @returns {Object} Multer storage configuration
 */
const createStorage = (type) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = getUploadDir(type);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = crypto.randomBytes(8).toString('hex');
      const fileExt = path.extname(file.originalname).toLowerCase();
      
      cb(null, `${type}-${Date.now()}-${uniqueSuffix}${fileExt}`);
    }
  });
};

/**
 * Create file filter based on allowed types
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @returns {Function} Multer file filter
 */
const createFileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Only ${allowedTypes.join(', ')} files are allowed`), false);
    }
  };
};

/**
 * Get default file path based on type
 * @param {string} type - Type of upload (profile, trip, etc.)
 * @returns {string} Default file path
 */
const getDefaultFile = (type) => {
  switch (type) {
    case 'profile':
      return 'default-profile.png';
    case 'trip':
      return 'default-trip-cover.jpg';
    case 'location':
      return 'default-location.jpg';
    default:
      return '';
  }
};

/**
 * Delete file if it exists and is not a default file
 * @param {string} type - Type of upload (profile, trip, etc.)
 * @param {string} filename - Filename to delete
 * @returns {boolean} Success status
 */
const deleteFile = (type, filename) => {
  // Don't delete default files
  if (filename === getDefaultFile(type)) {
    return false;
  }
  
  const filePath = path.join(getUploadDir(type), filename);
  
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`Deleted file: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    logger.error(`Error deleting file ${filePath}: ${error.message}`);
    return false;
  }
};

/**
 * Create multer upload for profiles
 */
const profileUpload = multer({
  storage: createStorage('profile'),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: createFileFilter(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
});

/**
 * Create multer upload for trips
 */
const tripUpload = multer({
  storage: createStorage('trip'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: createFileFilter(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
});

/**
 * Create multer upload for locations
 */
const locationUpload = multer({
  storage: createStorage('location'),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: createFileFilter(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
});

/**
 * Generic upload handler that works with any multer upload
 * @param {Object} upload - Multer upload instance
 * @param {string} fieldName - Field name in the form
 * @returns {Function} Express middleware
 */
const handleUpload = (upload, fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer error (file size, etc.)
        return res.status(400).json({
          success: false,
          message: err.message
        });
      } else if (err) {
        // Other error
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }
      
      // No file uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      next();
    });
  };
};

module.exports = {
  profileUpload,
  tripUpload,
  locationUpload,
  handleUpload,
  deleteFile,
  getDefaultFile,
  getUploadDir
};

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a location name'],
    trim: true,
    maxlength: [100, 'Location name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Location description cannot exceed 1000 characters']
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    formattedAddress: String
  },
  coordinates: {
    lat: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: -180,
      max: 180
    }
  },
  placeId: {
    type: String // For Google Places API integration
  },
  types: [{
    type: String,
    enum: [
      'accommodation', 'restaurant', 'cafe', 'bar', 'attraction', 
      'museum', 'park', 'beach', 'shopping', 'entertainment',
      'temple', 'landmark', 'transportation', 'viewpoint', 'other'
    ]
  }],
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  images: [{
    url: String,
    caption: String,
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  website: {
    type: String,
    match: [
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/,
      'Please provide a valid website URL'
    ]
  },
  contactInfo: {
    phone: String,
    email: String
  },
  operatingHours: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    openTime: String,
    closeTime: String,
    isClosed: {
      type: Boolean,
      default: false
    }
  }],
  priceLevel: {
    type: Number,
    min: 1,
    max: 5
  },
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'Review'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  source: {
    type: String,
    enum: ['user', 'google', 'system'],
    default: 'user'
  },
  meta: {
    popularity: {
      type: Number,
      default: 0
    },
    usageCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for location URL
locationSchema.virtual('url').get(function() {
  return `/location/${this._id}`;
});

// Virtual for main image
locationSchema.virtual('mainImage').get(function() {
  const mainImage = this.images.find(img => img.isMain);
  if (mainImage) return mainImage.url;
  if (this.images.length > 0) return this.images[0].url;
  return 'default-location.jpg';
});

// Index for searching and geospatial queries
locationSchema.index({ name: 'text', description: 'text', tags: 'text' });
locationSchema.index({ 'coordinates': '2dsphere' });

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;

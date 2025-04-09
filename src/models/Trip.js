const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tripSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Please provide a trip title'],
    trim: true,
    minlength: [3, 'Trip title must be at least 3 characters long'],
    maxlength: [100, 'Trip title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Trip description cannot exceed 1000 characters']
  },
  coverImage: {
    type: String,
    default: 'default-trip-cover.jpg'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  duration: {
    type: Number, // Number of days
    min: [1, 'Trip duration must be at least 1 day']
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  locations: [{
    type: Schema.Types.ObjectId,
    ref: 'Location'
  }],
  itinerary: [{
    day: {
      type: Number,
      required: true,
      min: 1
    },
    date: {
      type: Date
    },
    activities: [{
      location: {
        type: Schema.Types.ObjectId,
        ref: 'Location'
      },
      title: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      startTime: {
        type: String, // Format: "HH:MM"
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please provide a valid start time (HH:MM)']
      },
      endTime: {
        type: String, // Format: "HH:MM"
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please provide a valid end time (HH:MM)']
      },
      notes: {
        type: String,
        trim: true
      },
      order: {
        type: Number,
        default: 0
      }
    }]
  }],
  privacy: {
    type: String,
    enum: ['public', 'private', 'followers', 'link'],
    default: 'public'
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['planning', 'completed', 'in-progress', 'cancelled'],
    default: 'planning'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  remixedFrom: {
    type: Schema.Types.ObjectId,
    ref: 'Trip'
  },
  remixCount: {
    type: Number,
    default: 0
  },
  shareableLink: {
    type: String,
    unique: true,
    sparse: true
  },
  // Additional information to be added in later phases
  budget: {
    currency: {
      type: String,
      default: 'THB'
    },
    total: {
      type: Number,
      default: 0
    },
    items: [{
      category: {
        type: String,
        enum: ['accommodation', 'transportation', 'food', 'activities', 'shopping', 'other'],
        required: true
      },
      name: {
        type: String,
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      notes: String
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for trip URL
tripSchema.virtual('url').get(function() {
  return `/trip/${this._id}`;
});

// Virtual for trip duration
tripSchema.virtual('durationDays').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include start day
  }
  return this.duration || 0;
});

// Pre-save hook to set duration based on dates
tripSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    this.duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include start day
  }
  next();
});

// Index for searching
tripSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;

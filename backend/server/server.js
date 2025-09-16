const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require("multer");
const { uploadPhotoBuffer } = require('./services/fileStorage');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL || 'mongodb://admin:password@localhost:27017/mapmark?authSource=admin';
// tes
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage });

// MongoDB Schema - Flexible schema with only required fields
const locationSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  images: { type: [String], required: false },
  createdAt: { type: Date, default: Date.now },
  // Add GeoJSON location field for geospatial queries
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  }
}, {
  strict: false, // Allow additional fields not defined in schema
  versionKey: false // Disable __v field
});

// Create 2dsphere index for geospatial queries
locationSchema.index({ location: '2dsphere' });

// Pre-save middleware to automatically set GeoJSON location from lat/lng
locationSchema.pre('save', function(next) {
  if (this.lat && this.lng) {
    this.location = {
      type: 'Point',
      coordinates: [this.lng, this.lat] // GeoJSON uses [lng, lat] order
    };
  }
  next();
});

const Location = mongoose.model('Location', locationSchema);

// Connect to MongoDB
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB successfully');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'MapMark API Server is running!',
    version: '1.0.0',
    endpoints: {
      locations: '/api/locations',
      nearby: '/api/locations/nearby?lat=40.7128&lng=-74.0060&radius=1000',
      createAd: 'POST /api/ad',
      health: '/api/health'
    }
  });
});

// Get all locations
app.get('/api/locations', async (req, res) => {
  try {
    const locations = await Location.find({});
    
    // Transform the data to include all fields (flexible schema)
    const transformedLocations = locations.map(loc => ({
      id: loc._id,
      lat: loc.lat,
      lng: loc.lng,
      images: loc.images,
      createdAt: loc.createdAt,
      // Include all other fields dynamically
      ...loc.toObject()
    }));

    res.json({
      success: true,
      count: transformedLocations.length,
      data: transformedLocations
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching locations',
      error: error.message
    });
  }
});

app.post('/api/ad', upload.array('images', 3), async (req, res) => {
  try {
    const { lat, lng, ...additionalFields } = req.body;
    let imageKeys = [];

    // Validate required fields
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Upload images if provided
    if (req.files && req.files.length > 0) {
      imageKeys = await Promise.all(
        req.files.map(image => 
          uploadPhotoBuffer(image.buffer, `images/${uuidv4()}-${image.originalname}`, image.mimetype)
        )
      );
    }

    // Create location document with flexible additional fields
    const locationData = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      images: imageKeys,
      ...additionalFields // Include any additional fields from the request
    };

    const location = new Location(locationData);
    const savedLocation = await location.save();

    res.status(201).json({ 
      success: true, 
      data: savedLocation 
    });
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating ad',
      error: error.message
    });
  }
});

// Search locations by radius
app.get('/api/locations/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 1000, limit = 50 } = req.query;
    
    // Validate required parameters
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusInMeters = parseInt(radius);
    const limitCount = parseInt(limit);

    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude values'
      });
    }

    // Find locations within radius using $geoWithin and $centerSphere
    const locations = await Location.find({
      location: {
        $geoWithin: {
          $centerSphere: [
            [longitude, latitude], // [lng, lat] for GeoJSON
            radiusInMeters / 6371000 // Convert meters to radians (Earth's radius in meters)
          ]
        }
      }
    }).limit(limitCount);

    // Transform the data to include all fields and add distance
    const transformedLocations = locations.map(loc => ({
      id: loc._id,
      lat: loc.lat,
      lng: loc.lng,
      images: loc.images,
      createdAt: loc.createdAt,
      // Include all other fields dynamically
      ...loc.toObject()
    }));

    res.json({
      success: true,
      count: transformedLocations.length,
      searchCenter: { lat: latitude, lng: longitude },
      radius: radiusInMeters,
      data: transformedLocations
    });
  } catch (error) {
    console.error('Error searching nearby locations:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching nearby locations',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Locations API: http://localhost:${PORT}/api/locations`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

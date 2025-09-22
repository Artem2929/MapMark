const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require("multer");
const { createReviewHandler, getReviewsHandler, getReviewsByLocationHandler, getPhotoHandler, deleteReviewHandler, deletePhotoHandler } = require('./services/ReviewService');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL || 'mongodb://admin:password@localhost:27017/mapmark?authSource=admin';
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage });

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
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'MapMark API Server is running!',
    version: '1.0.0',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      createReview: 'POST /api/review',
      reviews: '/api/reviews',
      nearbyReviews: '/api/reviews/nearby?lat=40.7128&lng=-74.0060&radius=1000',
      deleteReview: 'DELETE /api/review/:reviewId',
      deletePhoto: 'DELETE /api/review/:reviewId/photo/:photoId',
      health: '/api/health'
    }
  });
});

// Create a review with photos
app.post('/api/review', upload.array('photos', 3), createReviewHandler);
// Get all reviews
app.get('/api/reviews', getReviewsHandler);
// Search reviews by radius
app.get('/api/reviews/nearby', getReviewsByLocationHandler);
// Delete a review by ID
app.delete('/api/review/:reviewId', deleteReviewHandler);
// Delete a photo from a review
app.delete('/api/review/:reviewId/photo/:photoId', deletePhotoHandler);
// Get a single photo as base64
app.get('/api/photo/:photoId', getPhotoHandler);

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

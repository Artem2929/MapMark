const mongoose = require('mongoose');

// Review Schema
const reviewSchema = new mongoose.Schema({
  lng: { type: Number, required: true },
  lat: { type: Number, required: true },
  review: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  username: { type: String, required: true, trim: true, maxlength: 50 },
  photoIds: { type: [String], default: [] },
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
      required: false // Will be set by pre-save middleware
    }
  }
}, {
  strict: false, // Allow additional fields not defined in schema
  versionKey: false // Disable __v field
});

// Create 2dsphere index for geospatial queries
reviewSchema.index({ location: '2dsphere' });

// Custom validation to ensure location.coordinates is set
reviewSchema.pre('validate', function(next) {
  // If location.coordinates is not set, try to set it from lat/lng
  if (!this.location || !this.location.coordinates) {
    if (this.lat && this.lng) {
      this.location = {
        type: 'Point',
        coordinates: [this.lng, this.lat]
      };
    } else {
      return next(new Error('Either lat/lng or location.coordinates must be provided'));
    }
  }
  next();
});

const Review = mongoose.model('Review', reviewSchema);

async function createReview({
    lng,
    lat,
    review,
    rating,
    username,
    photoIds = []
  }) {
  return Review.create({
    lng,
    lat,
    review,
    rating,
    username,
    photoIds  
  });
}

function getReviews() {
  return Review.find({}).sort({ createdAt: -1 });
}

function getReviewsByLocation(lat, lng, radius, limit) {
  return Review.find({ location: { $geoWithin: { $centerSphere: [[lng, lat], radius / 6371000] } } }).limit(limit);
}

async function deleteReview(reviewId) {
  return Review.findByIdAndDelete(reviewId);
}

async function getReviewById(reviewId) {
  return Review.findById(reviewId);
}

async function deletePhotoFromReview(reviewId, photoId) {
  return Review.findByIdAndUpdate(
    reviewId,
    { $pull: { photoIds: photoId } },
    { new: true }
  );
}

module.exports = {
  createReview,
  getReviews,
  getReviewsByLocation,
  deleteReview,
  getReviewById,
  deletePhotoFromReview
};
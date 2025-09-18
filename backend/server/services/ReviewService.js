const { createReview, getReviews, getReviewsByLocation } = require('../Repositories/ReviewRepository');

const { uploadPhotoBuffer } = require('./fileStorage');
const { v4: uuidv4 } = require('uuid');

async function createReviewHandler(req, res) {
  try {
    const { lng, lat, review, rating } = req.body;
    let photoIds = [];

    // Validate required fields
    if (!lng || !lat || !review || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Longitude, latitude, review, and rating are required'
      });
    }

    // Validate rating range
    const ratingNum = parseFloat(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5'
      });
    }

    // Validate coordinates
    const longitude = parseFloat(lng);
    const latitude = parseFloat(lat);
    if (isNaN(longitude) || isNaN(latitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude values'
      });
    }

    // Upload photos if provided
    if (req.files && req.files.length > 0) {
      photoIds = await Promise.all(
        req.files.map(photo => 
          uploadPhotoBuffer(photo.buffer, `reviews/${uuidv4()}-${photo.originalname}`, photo.mimetype)
        )
      );
    }

    // Create review document
    const reviewData = {
      lng: longitude,
      lat: latitude,
      review: review.trim(),
      rating: ratingNum,
      photoIds: photoIds
    };

    const savedReview = await createReview(reviewData);

    res.status(201).json({ 
      success: true, 
      data: savedReview 
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
};

async function getReviewsHandler(req, res) {
  try {
    const reviews = await getReviews();
    
    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
}

async function getReviewsByLocationHandler(req, res) {
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

    // Find reviews within radius using $geoWithin and $centerSphere
    const reviews = await getReviewsByLocation(latitude, longitude, radiusInMeters, limitCount);

    res.json({
      success: true,
      count: reviews.length,
      searchCenter: { lat: latitude, lng: longitude },
      radius: radiusInMeters,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching nearby reviews',
      error: error.message
    });
  }
}

module.exports = { createReviewHandler, getReviewsHandler, getReviewsByLocationHandler };
const { createReview, getReviews, getReviewsByLocation, deleteReview, getReviewById, deletePhotoFromReview } = require('../Repositories/ReviewRepository');


const { uploadPhotoBuffer, downloadPhotosAsBase64, deletePhotos } = require('./fileStorage');
const { v4: uuidv4 } = require('uuid');

async function createReviewHandler(req, res) {
  try {
    const { lng, lat, review, rating, username } = req.body;
    console.log('Received data:', { lng, lat, review, rating, username });
    let photoIds = [];

    // Validate required fields
    if (!lng || !lat || !review || !rating || !username) {
      return res.status(400).json({
        success: false,
        message: 'Longitude, latitude, review, rating, and username are required'
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
      username: username.trim(),
      photoIds: photoIds
    };

    console.log('Creating review with data:', reviewData);
    const savedReview = await createReview(reviewData);
    console.log('Saved review:', JSON.stringify(savedReview, null, 2));
    console.log('Username in saved review:', savedReview.username);

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
    
    // Return reviews without photos for faster loading
    const reviewsData = reviews.map(review => {
      const reviewObj = review.toObject();
      // Keep photoIds but don't load actual photos
      reviewObj.photos = [];
      reviewObj.hasPhotos = reviewObj.photoIds && reviewObj.photoIds.length > 0;
      return reviewObj;
    });
    
    res.json({
      success: true,
      count: reviewsData.length,
      data: reviewsData
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
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

    // Process each review to include base64 photos
    const reviewsWithPhotos = await Promise.all(
      reviews.map(async (review) => {
        const reviewObj = review.toObject();
        
        // Download photos as base64 if they exist
        if (reviewObj.photoIds && reviewObj.photoIds.length > 0) {
          const base64Photos = await downloadPhotosAsBase64(reviewObj.photoIds);
          reviewObj.photos = base64Photos;
        } else {
          reviewObj.photos = [];
        }
        
        // Remove photoIds as we now have photos with base64 data
        delete reviewObj.photoIds;
        
        return reviewObj;
      })
    );

    res.json({
      success: true,
      count: reviewsWithPhotos.length,
      searchCenter: { lat: latitude, lng: longitude },
      radius: radiusInMeters,
      data: reviewsWithPhotos
    });
  } catch (error) {
    console.error('Error searching nearby reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching nearby reviews',
      error: error.message
    });
  }
}

// Get a single photo as base64
async function getPhotoHandler(req, res) {
  try {
    const { photoId } = req.params;
    
    if (!photoId) {
      return res.status(400).json({
        success: false,
        message: 'Photo ID is required'
      });
    }

    const base64Photo = await downloadPhotoAsBase64(photoId);
    
    if (!base64Photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    res.json({
      success: true,
      data: {
        photoId,
        base64: base64Photo
      }
    });
  } catch (error) {
    console.error('Error fetching photo:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching photo',
      error: error.message
    });
  }
}

async function deleteReviewHandler(req, res) {
  try {
    const { reviewId } = req.params;
    
    // Validate review ID
    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: 'Review ID is required'
      });
    }

    // Check if review exists
    const existingReview = await getReviewById(reviewId);
    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Delete associated photos from R2 if they exist
    if (existingReview.photoIds && existingReview.photoIds.length > 0) {
      try {
        const deleteResults = await deletePhotos(existingReview.photoIds);
        console.log('Photo deletion results:', deleteResults);
      } catch (photoError) {
        console.error('Error deleting photos:', photoError);
        // Continue with review deletion even if photo deletion fails
      }
    }

    // Delete the review from database
    const deletedReview = await deleteReview(reviewId);
    
    if (!deletedReview) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or already deleted'
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully',
      data: {
        reviewId: deletedReview._id,
        deletedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
}

async function deletePhotoHandler(req, res) {
  try {
    const { reviewId, photoId } = req.params;
    
    // Validate required parameters
    if (!reviewId || !photoId) {
      return res.status(400).json({
        success: false,
        message: 'Review ID and Photo ID are required'
      });
    }

    // Check if review exists
    const existingReview = await getReviewById(reviewId);
    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if photo exists in the review
    if (!existingReview.photoIds || !existingReview.photoIds.includes(photoId)) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found in this review'
      });
    }

    // Delete photo from R2 storage
    try {
      await deletePhotos([photoId]);
      console.log('Photo deleted from R2 storage:', photoId);
    } catch (photoError) {
      console.error('Error deleting photo from R2:', photoError);
      // Continue with database update even if photo deletion fails
    }

    // Remove photo from review in database
    const updatedReview = await deletePhotoFromReview(reviewId, photoId);
    
    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or photo not removed'
      });
    }

    res.json({
      success: true,
      message: 'Photo deleted successfully',
      data: {
        reviewId: updatedReview._id,
        photoId: photoId,
        remainingPhotos: updatedReview.photoIds.length,
        deletedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting photo',
      error: error.message
    });
  }
}

async function getUserStatsHandler(req, res) {
  try {
    const reviews = await getReviews();
    const reviewCount = reviews.length;
    
    res.json({
      success: true,
      data: {
        reviewCount,
        level: Math.floor(reviewCount / 10) + 1,
        progress: Math.min(reviewCount * 10, 100)
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user stats',
      error: error.message
    });
  }
}

async function likeReviewHandler(req, res) {
  try {
    const { reviewId } = req.params;
    
    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: 'Review ID is required'
      });
    }

    const review = await getReviewById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Update likes count
    review.likes = (review.likes || 0) + 1;
    await review.save();

    res.json({
      success: true,
      data: {
        reviewId,
        likes: review.likes
      }
    });
  } catch (error) {
    console.error('Error liking review:', error);
    res.status(500).json({
      success: false,
      message: 'Error liking review',
      error: error.message
    });
  }
}

async function dislikeReviewHandler(req, res) {
  try {
    const { reviewId } = req.params;
    
    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: 'Review ID is required'
      });
    }

    const review = await getReviewById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Update dislikes count
    review.dislikes = (review.dislikes || 0) + 1;
    await review.save();

    res.json({
      success: true,
      data: {
        reviewId,
        dislikes: review.dislikes
      }
    });
  } catch (error) {
    console.error('Error disliking review:', error);
    res.status(500).json({
      success: false,
      message: 'Error disliking review',
      error: error.message
    });
  }
}

async function addCommentHandler(req, res) {
  try {
    const { reviewId } = req.params;
    const { comment } = req.body;
    
    if (!reviewId || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Review ID and comment are required'
      });
    }

    const review = await getReviewById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const newComment = {
      text: comment.trim(),
      username: 'Anonymous', // TODO: Get from auth
      createdAt: new Date()
    };

    if (!review.comments) {
      review.comments = [];
    }
    review.comments.push(newComment);
    await review.save();

    res.json({
      success: true,
      data: newComment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
}

module.exports = { createReviewHandler, getReviewsHandler, getReviewsByLocationHandler, getPhotoHandler, deleteReviewHandler, deletePhotoHandler, getUserStatsHandler, likeReviewHandler, dislikeReviewHandler, addCommentHandler };
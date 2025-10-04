import { API_ENDPOINTS } from '../constants';

/**
 * Review Service for MapMark - Handle review operations with backend API
 */
class ReviewService {
  /**
   * Create a new review
   * @param {Object} reviewData - Review data
   * @param {number} reviewData.lng - Longitude
   * @param {number} reviewData.lat - Latitude
   * @param {string} reviewData.review - Review text
   * @param {number} reviewData.rating - Rating (1-5)
   * @param {string} reviewData.username - Username
   * @param {File[]} reviewData.photos - Array of photo files
   * @returns {Promise<Object>} Created review data
   */
  static async createReview({ lng, lat, review, rating, username, photos = [] }) {
    try {
      const formData = new FormData();
      
      // Add required fields
      formData.append('lng', lng.toString());
      formData.append('lat', lat.toString());
      formData.append('review', review);
      formData.append('rating', rating.toString());
      formData.append('username', username);
      
      // Add photos if provided
      photos.forEach(photo => {
        formData.append('photos', photo);
      });

      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/reviews`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw new Error(`Failed to create review: ${error.message}`);
    }
  }

  /**
   * Get all reviews
   * @returns {Promise<Array>} Array of reviews
   */
  static async getAllReviews() {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/reviews`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw new Error(`Failed to fetch reviews: ${error.message}`);
    }
  }

  /**
   * Get reviews near a specific location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Search radius in meters (default: 1000)
   * @param {number} limit - Maximum number of results (default: 50)
   * @returns {Promise<Array>} Array of nearby reviews
   */
  static async getNearbyReviews(lat, lng, radius = 1000, limit = 50) {
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius: radius.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/reviews/nearby?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching nearby reviews:', error);
      throw new Error(`Failed to fetch nearby reviews: ${error.message}`);
    }
  }

  /**
   * Delete a review by ID
   * @param {string} reviewId - Review ID to delete
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteReview(reviewId) {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw new Error(`Failed to delete review: ${error.message}`);
    }
  }

  /**
   * Calculate level and progress based on review count
   * @param {number} reviewCount - Total number of reviews
   * @returns {Object} Level progression data
   */
  static calculateLevelProgress(reviewCount) {
    const levelRequirements = [
      { level: 1, reviews: 5, progressPerReview: 20 },
      { level: 2, reviews: 15, progressPerReview: 10 },
      { level: 3, reviews: 35, progressPerReview: 5 },
      { level: 4, reviews: 135, progressPerReview: 1 },
      { level: 5, reviews: 235, progressPerReview: 1 },
      { level: 6, reviews: 335, progressPerReview: 1 },
      { level: 7, reviews: 435, progressPerReview: 1 },
      { level: 8, reviews: 535, progressPerReview: 1 },
      { level: 9, reviews: 635, progressPerReview: 1 },
      { level: 10, reviews: 735, progressPerReview: 1 }
    ];
    
    let currentLevel = 1;
    let previousLevelReviews = 0;
    
    for (let i = 0; i < levelRequirements.length; i++) {
      if (reviewCount >= levelRequirements[i].reviews) {
        currentLevel = levelRequirements[i].level + 1;
        previousLevelReviews = levelRequirements[i].reviews;
      } else {
        break;
      }
    }
    
    if (currentLevel > 10) {
      return {
        level: 10,
        progress: 100,
        reviewsForNextLevel: 0
      };
    }
    
    const currentLevelData = levelRequirements[currentLevel - 1];
    const reviewsInLevel = reviewCount - previousLevelReviews;
    const progress = Math.min(reviewsInLevel * currentLevelData.progressPerReview, 100);
    const reviewsNeeded = Math.ceil((100 - progress) / currentLevelData.progressPerReview);
    
    return {
      level: currentLevel,
      progress,
      reviewsForNextLevel: reviewsNeeded
    };
  }

  /**
   * Get user statistics with level progression
   * @param {number} reviewCount - Number of reviews
   * @returns {Object} User stats data
   */
  static getUserStats(reviewCount) {
    const { level, progress, reviewsForNextLevel } = this.calculateLevelProgress(reviewCount);
    
    return {
      reviewCount,
      level,
      progress,
      reviewsForNextLevel
    };
  }

  /**
   * Validate review data before submission
   * @param {Object} reviewData - Review data to validate
   * @returns {Object} Validation result
   */
  static validateReviewData(reviewData) {
    const { lng, lat, review, rating, username, photos } = reviewData;
    const errors = [];

    // Validate username
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      errors.push('Username is required.');
    } else if (username.length > 50) {
      errors.push('Username must be 50 characters or less.');
    }

    // Validate coordinates
    if (typeof lng !== 'number' || lng < -180 || lng > 180) {
      errors.push('Invalid longitude. Must be between -180 and 180.');
    }
    if (typeof lat !== 'number' || lat < -90 || lat > 90) {
      errors.push('Invalid latitude. Must be between -90 and 90.');
    }

    // Validate review text
    if (!review || typeof review !== 'string' || review.trim().length === 0) {
      errors.push('Review text is required.');
    } else if (review.length > 500) {
      errors.push('Review text must be 500 characters or less.');
    }

    // Validate rating
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      errors.push('Rating must be 500 characters or less.');
    }

    // Validate photos
    if (photos && photos.length > 5) {
      errors.push('Maximum 5 photos allowed.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default ReviewService;
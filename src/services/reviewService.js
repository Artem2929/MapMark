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
   * @param {File[]} reviewData.photos - Array of photo files
   * @returns {Promise<Object>} Created review data
   */
  static async createReview({ lng, lat, review, rating, photos = [] }) {
    try {
      const formData = new FormData();
      
      // Add required fields
      formData.append('lng', lng.toString());
      formData.append('lat', lat.toString());
      formData.append('review', review);
      formData.append('rating', rating.toString());
      
      // Add photos if provided
      photos.forEach(photo => {
        formData.append('photos', photo);
      });

      const response = await fetch(API_ENDPOINTS.REVIEW, {
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
      const response = await fetch(API_ENDPOINTS.REVIEWS);
      
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

      const response = await fetch(`${API_ENDPOINTS.REVIEWS}/nearby?${params}`);
      
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
   * Get photo URL from photo ID
   * @param {string} photoId - Photo ID from review
   * @returns {string} Full photo URL
   */
  static getPhotoUrl(photoId) {
    // This would need to be configured based on your Cloudflare R2 setup
    // For now, return a placeholder or construct the URL based on your R2 configuration
    const R2_BASE_URL = process.env.REACT_APP_R2_BASE_URL || 'https://your-r2-domain.com';
    return `${R2_BASE_URL}/${photoId}`;
  }

  /**
   * Delete a review by ID
   * @param {string} reviewId - Review ID to delete
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteReview(reviewId) {
    try {
      const response = await fetch(`${API_ENDPOINTS.REVIEW}/${reviewId}`, {
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
   * Delete a photo from a review
   * @param {string} reviewId - Review ID containing the photo
   * @param {string} photoId - Photo ID to delete
   * @returns {Promise<Object>} Deletion result
   */
  static async deletePhoto(reviewId, photoId) {
    try {
      const response = await fetch(`${API_ENDPOINTS.REVIEW}/${reviewId}/photo/${photoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw new Error(`Failed to delete photo: ${error.message}`);
    }
  }

  /**
   * Validate review data before submission
   * @param {Object} reviewData - Review data to validate
   * @returns {Object} Validation result
   */
  static validateReviewData(reviewData) {
    const { lng, lat, review, rating, photos } = reviewData;
    const errors = [];

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
      errors.push('Rating must be a number between 1 and 5.');
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

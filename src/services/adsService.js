import { API_ENDPOINTS } from '../constants';

/**
 * Ads Service for MapMark - Handle ads operations with backend API
 */
class AdsService {
  /**
   * Get all ads with filters
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Ads data with pagination
   */
  static async getAds(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/ads?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching ads:', error);
      throw new Error(`Failed to fetch ads: ${error.message}`);
    }
  }

  /**
   * Get ad by ID
   * @param {string} id - Ad ID
   * @returns {Promise<Object>} Ad data
   */
  static async getAdById(id) {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/ads/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching ad:', error);
      throw new Error(`Failed to fetch ad: ${error.message}`);
    }
  }

  /**
   * Create new ad
   * @param {Object} adData - Ad data
   * @returns {Promise<Object>} Created ad data
   */
  static async createAd(adData) {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/ads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating ad:', error);
      throw new Error(`Failed to create ad: ${error.message}`);
    }
  }

  /**
   * Update ad
   * @param {string} id - Ad ID
   * @param {Object} adData - Updated ad data
   * @returns {Promise<Object>} Updated ad data
   */
  static async updateAd(id, adData) {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/ads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error updating ad:', error);
      throw new Error(`Failed to update ad: ${error.message}`);
    }
  }

  /**
   * Delete ad
   * @param {string} id - Ad ID
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteAd(id) {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/ads/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting ad:', error);
      throw new Error(`Failed to delete ad: ${error.message}`);
    }
  }
}

export default AdsService;
import { API_ENDPOINTS } from '../constants';

/**
 * Location Service for MapMark - Handle location operations with backend API
 */
class LocationService {
  /**
   * Get all locations
   * @returns {Promise<Array>} Array of locations
   */
  static async getAllLocations() {
    try {
      const response = await fetch(API_ENDPOINTS.LOCATIONS);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw new Error(`Failed to fetch locations: ${error.message}`);
    }
  }

  /**
   * Get locations near a specific location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Search radius in meters (default: 1000)
   * @returns {Promise<Array>} Array of nearby locations
   */
  static async getNearbyLocations(lat, lng, radius = 1000) {
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius: radius.toString(),
      });

      const response = await fetch(`${API_ENDPOINTS.LOCATIONS}/nearby?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching nearby locations:', error);
      throw new Error(`Failed to fetch nearby locations: ${error.message}`);
    }
  }

  /**
   * Convert location data to map marker format
   * @param {Object} location - Location data from API
   * @returns {Object} Map marker object
   */
  static convertToMarker(location) {
    return {
      id: location._id || location.id,
      position: [location.lat, location.lng],
      name: location.review || 'Location',
      hasReviews: true,
      rating: location.rating || 0,
      author: location.author || 'Unknown',
      image: location.image,
      createdAt: location.createdAt
    };
  }

  /**
   * Convert array of locations to map markers
   * @param {Array} locations - Array of location data
   * @returns {Array} Array of map marker objects
   */
  static convertToMarkers(locations) {
    return locations.map(location => this.convertToMarker(location));
  }

  /**
   * Validate location data
   * @param {Object} location - Location data to validate
   * @returns {Object} Validation result
   */
  static validateLocation(location) {
    const { lat, lng } = location;
    const errors = [];

    // Validate coordinates
    if (typeof lat !== 'number' || lat < -90 || lat > 90) {
      errors.push('Invalid latitude. Must be between -90 and 90.');
    }
    if (typeof lng !== 'number' || lng < -180 || lng > 180) {
      errors.push('Invalid longitude. Must be between -180 and 180.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default LocationService;

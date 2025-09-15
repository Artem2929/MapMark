import { API_ENDPOINTS } from '../constants';

/**
 * Geocoding service for converting addresses to coordinates
 */
export class GeocodingService {
  /**
   * Get coordinates for a given address
   * @param {string} address - The address to geocode
   * @returns {Promise<{lat: number, lon: number} | null>}
   */
  static async getCoordinates(address) {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.GEOCODING}?format=json&q=${encodeURIComponent(address)}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        return {
          lat: parseFloat(lat),
          lon: parseFloat(lon)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Failed to get coordinates for the address');
    }
  }

  /**
   * Get address from coordinates (reverse geocoding)
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<string | null>}
   */
  static async getAddress(lat, lon) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data?.display_name || null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw new Error('Failed to get address for coordinates');
    }
  }
}
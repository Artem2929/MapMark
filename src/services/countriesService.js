import { API_ENDPOINTS } from '../constants';

class CountriesService {
  static async getCountries() {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/countries`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw new Error(`Failed to fetch countries: ${error.message}`);
    }
  }
}

export default CountriesService;
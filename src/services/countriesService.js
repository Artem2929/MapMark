import { API_ENDPOINTS } from '../constants';

class CountriesService {
  static cache = null;
  static promise = null;

  static async getCountries() {
    if (this.cache) {
      return this.cache;
    }

    if (this.promise) {
      return this.promise;
    }

    this.promise = this.fetchCountries();
    const result = await this.promise;
    this.cache = result;
    this.promise = null;
    return result;
  }

  static async fetchCountries() {
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
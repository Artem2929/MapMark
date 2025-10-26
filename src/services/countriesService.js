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
    // Повертаємо тільки Україну
    return [
      {
        id: 'ukraine',
        name: 'Україна',
        flag: '🇺🇦'
      }
    ];
  }
}

export default CountriesService;
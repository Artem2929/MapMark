const API_BASE_URL = 'http://localhost:3000/api';

export const filtersService = {
  async getFilters() {
    try {
      const response = await fetch(`${API_BASE_URL}/filters`);
      if (!response.ok) {
        throw new Error('Failed to fetch filters');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching filters:', error);
      throw error;
    }
  }
};
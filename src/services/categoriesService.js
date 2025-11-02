const API_BASE_URL = 'http://localhost:3001/api';

let categoriesCache = null;
let categoriesPromise = null;

export const categoriesService = {
  async getCategories() {
    if (categoriesCache) {
      return categoriesCache;
    }
    
    if (categoriesPromise) {
      return categoriesPromise;
    }
    
    categoriesPromise = this._fetchCategories();
    categoriesCache = await categoriesPromise;
    categoriesPromise = null;
    
    return categoriesCache;
  },
  
  clearCache() {
    categoriesCache = null;
    categoriesPromise = null;
  },
  
  async _fetchCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
};
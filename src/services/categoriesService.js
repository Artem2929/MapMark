import apiClient from '../utils/apiClient.js';

let categoriesCache = null;
let categoriesPromise = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 хвилин
let cacheTimestamp = null;

export const categoriesService = {
  async getCategories() {
    const now = Date.now();
    
    if (categoriesCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
      return categoriesCache;
    }
    
    if (categoriesPromise) {
      return categoriesPromise;
    }
    
    categoriesPromise = this._fetchCategories();
    try {
      categoriesCache = await categoriesPromise;
      cacheTimestamp = now;
      return categoriesCache;
    } catch (error) {
      categoriesCache = null;
      cacheTimestamp = null;
      throw error;
    } finally {
      categoriesPromise = null;
    }
  },
  
  clearCache() {
    categoriesCache = null;
    categoriesPromise = null;
    cacheTimestamp = null;
  },
  
  async _fetchCategories() {
    const result = await apiClient.get('/categories');
    return result.data || [];
  }
};
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class AdService {
  async createAd(formData) {
    const data = new FormData();
    
    // Add form fields
    Object.keys(formData).forEach(key => {
      if (key === 'photos') {
        formData.photos.forEach(photo => {
          if (photo.file) {
            data.append('photos', photo.file);
          }
        });
      } else {
        data.append(key, formData[key]);
      }
    });

    const response = await fetch(`${API_BASE_URL}/ads`, {
      method: 'POST',
      body: data
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create ad');
    }

    return response.json();
  }

  async getAds(filters = {}) {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    const response = await fetch(`${API_BASE_URL}/ads?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch ads');
    }

    return response.json();
  }

  async getAdById(id) {
    const response = await fetch(`${API_BASE_URL}/ads/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch ad');
    }

    return response.json();
  }

  async updateAd(id, formData) {
    const data = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (key === 'photos') {
        formData.photos.forEach(photo => {
          if (photo.file) {
            data.append('photos', photo.file);
          }
        });
      } else {
        data.append(key, formData[key]);
      }
    });

    const response = await fetch(`${API_BASE_URL}/ads/${id}`, {
      method: 'PUT',
      body: data
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update ad');
    }

    return response.json();
  }

  async deleteAd(id) {
    const response = await fetch(`${API_BASE_URL}/ads/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete ad');
    }

    return response.json();
  }
}

export default new AdService();
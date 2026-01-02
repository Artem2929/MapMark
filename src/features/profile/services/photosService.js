import { apiClient } from '../../../shared/api/client.js'

export const photosService = {
  async getUserPhotos(userId, params = {}) {
    if (!userId) {
      throw new Error('ID користувача обов\'язковий')
    }
    
    const data = await apiClient.request(`/photos/users/${userId}`, { params })
    const photos = data.data?.photos || data.photos || []
    return photos.map(photo => ({
      ...photo,
      _id: photo._id || photo.id
    }))
  },

  async uploadPhotos(files) {
    if (!files || files.length === 0) {
      throw new Error('Файли для завантаження обов\'язкові')
    }
    
    const formData = new FormData()
    files.forEach(file => formData.append('photos', file))

    return apiClient.secureRequest('/photos/upload', {
      method: 'POST',
      body: formData,
      headers: {}
    })
  },

  async deletePhoto(photoId) {
    if (!photoId) {
      throw new Error('ID фото обов\'язковий')
    }
    
    return apiClient.secureRequest(`/photos/${photoId}`, {
      method: 'DELETE'
    })
  },

  async updatePhoto(photoId, data) {
    if (!photoId || !data) {
      throw new Error('ID фото та дані обов\'язкові')
    }
    
    return apiClient.secureRequest(`/photos/${photoId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  async getPhoto(photoId) {
    if (!photoId) {
      throw new Error('ID фото обов\'язковий')
    }
    
    return apiClient.request(`/photos/${photoId}`)
  },

  async getPhotos(params = {}) {
    return apiClient.request('/photos', { params })
  },

  async togglePhotoLike(photoId, type) {
    if (!photoId || !type) {
      throw new Error('ID фото та тип обов\'язкові')
    }
    
    return apiClient.secureRequest(`/photos/${photoId}/like`, {
      method: 'POST',
      body: JSON.stringify({ type })
    })
  },

  async getPhotoComments(photoId, params = {}) {
    if (!photoId) {
      throw new Error('ID фото обов\'язковий')
    }
    
    return apiClient.request(`/photos/${photoId}/comments`, { params })
  },

  async addPhotoComment(photoId, text) {
    if (!photoId || !text) {
      throw new Error('ID фото та текст коментаря обов\'язкові')
    }
    
    return apiClient.secureRequest(`/photos/${photoId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text })
    })
  }
}
import { apiClient } from '../../../utils/apiClient'

class PhotosService {
  async getUserPhotos(userId, params = {}) {
    try {
      const response = await apiClient.get(`/api/v1/photos/users/${userId}`, { params })
      return response.data?.photos || []
    } catch (error) {
      console.error('Error fetching user photos:', error)
      return []
    }
  }

  async uploadPhotos(files) {
    const formData = new FormData()
    
    // Додаємо файли до FormData
    files.forEach((file) => {
      formData.append('photos', file)
    })

    const response = await apiClient.post('/api/v1/photos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  }

  async deletePhoto(photoId) {
    const response = await apiClient.delete(`/api/v1/photos/${photoId}`)
    return response.data
  }

  async updatePhoto(photoId, data) {
    const response = await apiClient.put(`/api/v1/photos/${photoId}`, data)
    return response.data
  }

  async getPhoto(photoId) {
    const response = await apiClient.get(`/api/v1/photos/${photoId}`)
    return response.data
  }

  async getPhotos(params = {}) {
    const response = await apiClient.get('/api/v1/photos', { params })
    return response.data
  }

  async togglePhotoLike(photoId, type) {
    const response = await apiClient.post(`/api/v1/photos/${photoId}/like`, { type })
    return response.data
  }
}

export const photosService = new PhotosService()
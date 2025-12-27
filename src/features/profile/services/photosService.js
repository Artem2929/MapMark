import { apiClient } from '../../../utils/apiClient'

class PhotosService {
  async getUserPhotos(userId) {
    try {
      const response = await apiClient.get(`/api/v1/users/${userId}/photos`)
      return response.data.photos || []
    } catch (error) {
      console.error('Error fetching user photos:', error)
      return []
    }
  }

  async uploadPhotos(files) {
    const formData = new FormData()
    
    files.forEach((file, index) => {
      // Якщо file це blob URL, конвертуємо назад в File
      if (typeof file === 'string' && file.startsWith('blob:')) {
        // Для blob URLs потрібно отримати оригінальний файл
        // Це буде реалізовано в PhotoUpload компоненті
        return
      }
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
}

export const photosService = new PhotosService()
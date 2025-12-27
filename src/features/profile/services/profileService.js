import { apiClient } from '../../../shared/api/client.js'

export const profileService = {
  async getUserProfile(userId) {
    if (!userId) {
      throw new Error('ID користувача обов\'язковий')
    }
    
    return apiClient.request(`/users/${userId}`)
  },

  async createPost(content) {
    if (!content) {
      throw new Error('Контент посту обов\'язковий')
    }
    
    return apiClient.secureRequest('/posts', {
      method: 'POST',
      body: JSON.stringify({ content })
    })
  },

  async uploadAvatar(formData) {
    if (!formData) {
      throw new Error('Файл аватара обов\'язковий')
    }
    
    return apiClient.secureRequest('/users/avatar', {
      method: 'POST',
      body: formData,
      headers: {}
    })
  },

  async updateProfile(userId, profileData) {
    if (!userId || !profileData) {
      throw new Error('ID користувача та дані обов\'язкові')
    }
    
    return apiClient.secureRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    })
  }
}
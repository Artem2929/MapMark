import { apiClient } from '../../../shared/api/client.js'

export const followsService = {
  async followUser(userId) {
    if (!userId) {
      throw new Error('ID користувача обов\'язковий')
    }
    
    return await apiClient.secureRequest('/follows', {
      method: 'POST',
      body: JSON.stringify({ userId })
    })
  },

  async unfollowUser(userId) {
    if (!userId) {
      throw new Error('ID користувача обов\'язковий')
    }
    
    return await apiClient.secureRequest(`/follows/${userId}`, {
      method: 'DELETE'
    })
  },

  async getFollowers(userId, page = 1, limit = 20) {
    if (!userId) {
      throw new Error('ID користувача обов\'язковий')
    }
    
    try {
      return await apiClient.request(`/follows/${userId}/followers?page=${page}&limit=${limit}`)
    } catch (error) {
      if (error.message.includes('404')) {
        return { success: true, data: { followers: [], total: 0 } }
      }
      throw error
    }
  },

  async getFollowing(userId, page = 1, limit = 20) {
    if (!userId) {
      throw new Error('ID користувача обов\'язковий')
    }
    
    try {
      return await apiClient.request(`/follows/${userId}/following?page=${page}&limit=${limit}`)
    } catch (error) {
      if (error.message.includes('404')) {
        return { success: true, data: { following: [], total: 0 } }
      }
      throw error
    }
  },

  async getUserStats(userId) {
    if (!userId) {
      throw new Error('ID користувача обов\'язковий')
    }
    
    try {
      return await apiClient.request(`/follows/${userId}/stats`)
    } catch (error) {
      if (error.message.includes('404')) {
        return { success: true, data: { followersCount: 0, followingCount: 0 } }
      }
      throw error
    }
  },

  async checkFollowing(userId) {
    if (!userId) {
      throw new Error('ID користувача обов\'язковий')
    }
    
    try {
      return await apiClient.request(`/follows/${userId}/check`)
    } catch (error) {
      if (error.message.includes('404')) {
        return { success: true, data: { isFollowing: false } }
      }
      throw error
    }
  }
}
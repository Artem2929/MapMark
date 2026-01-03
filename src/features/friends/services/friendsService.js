import { apiClient } from '../../../shared/api/client.js'

export const friendsService = {
  async getMyFriends() {
    try {
      const result = await apiClient.secureRequest('/friends')
      return {
        success: true,
        data: result.data || []
      }
    } catch (error) {
      if (error.message.includes('404') || error.message.includes("Can't find")) {
        return { success: true, data: [] }
      }
      throw error
    }
  },

  async getFriends(userId) {
    if (!userId) {
      throw new Error('ID користувача обов\'язковий')
    }
    
    try {
      const result = await apiClient.request(`/friends/${userId}`)
      return {
        success: true,
        data: result.data || []
      }
    } catch (error) {
      // Return empty result if endpoint doesn't exist
      if (error.message.includes('404') || error.message.includes("Can't find")) {
        return { success: true, data: [] }
      }
      throw error
    }
  },

  async getFriendRequests(userId) {
    if (!userId) {
      throw new Error('ID користувача обов\'язковий')
    }
    
    try {
      const result = await apiClient.request(`/friends/${userId}/requests`)
      return {
        success: true,
        data: result.data || []
      }
    } catch (error) {
      if (error.message.includes('404') || error.message.includes("Can't find")) {
        return { success: true, data: [] }
      }
      throw error
    }
  },

  async getSentFriendRequests(userId) {
    if (!userId) {
      throw new Error('ID користувача обов\'язковий')
    }
    
    try {
      const result = await apiClient.request(`/friends/${userId}/sent-requests`)
      return {
        success: true,
        data: result.data || []
      }
    } catch (error) {
      if (error.message.includes('404') || error.message.includes("Can't find")) {
        return { success: true, data: [] }
      }
      throw error
    }
  },

  async searchFriends(userId, query) {
    if (!userId) {
      throw new Error('ID користувача обов\'язковий')
    }
    
    try {
      const result = await apiClient.request(`/friends/${userId}/search?query=${encodeURIComponent(query)}`)
      return {
        success: true,
        data: result.data || []
      }
    } catch (error) {
      if (error.message.includes('404') || error.message.includes("Can't find")) {
        return { success: true, data: [] }
      }
      throw error
    }
  },

  async searchFriendRequests(userId, query) {
    if (!userId) {
      throw new Error('ID користувача обов\'язковий')
    }
    
    try {
      const result = await apiClient.request(`/friends/${userId}/requests/search?query=${encodeURIComponent(query)}`)
      return {
        success: true,
        data: result.data || []
      }
    } catch (error) {
      if (error.message.includes('404') || error.message.includes("Can't find")) {
        return { success: true, data: [] }
      }
      throw error
    }
  },

  async searchSentFriendRequests(userId, query) {
    if (!userId) {
      throw new Error('ID користувача обов\'язковий')
    }
    
    try {
      const result = await apiClient.request(`/friends/${userId}/sent-requests/search?query=${encodeURIComponent(query)}`)
      return {
        success: true,
        data: result.data || []
      }
    } catch (error) {
      if (error.message.includes('404') || error.message.includes("Can't find")) {
        return { success: true, data: [] }
      }
      throw error
    }
  },

  async searchUsers(query = '', filters = {}) {
    try {
      const params = new URLSearchParams()
      
      if (query) {
        params.append('query', query)
      }
      
      if (filters.country) {
        params.append('country', filters.country)
      }
      
      if (filters.city) {
        params.append('city', filters.city)
      }
      
      if (filters.ageRange) {
        params.append('ageRange', filters.ageRange)
      }
      
      if (filters.limit) {
        params.append('limit', filters.limit)
      }
      
      if (filters.random) {
        params.append('random', 'true')
        params.append('limit', filters.limit || 100)
      }
      
      const result = await apiClient.request(`/users/search?${params}`)
      return {
        success: true,
        data: result.data?.data || result.data || []
      }
    } catch (error) {
      if (error.message.includes('404') || error.message.includes("Can't find")) {
        return { success: true, data: [] }
      }
      throw error
    }
  },

  async sendFriendRequest(userId) {
    if (!userId) {
      throw new Error('ID користувача обов\'язковий')
    }
    
    try {
      return await apiClient.secureRequest('/friends/request', {
        method: 'POST',
        body: JSON.stringify({ userId })
      })
    } catch (error) {
      // Return error result if endpoint doesn't exist
      if (error.message.includes('404') || error.message.includes("Can't find")) {
        return { success: false, error: 'Функція друзів поки недоступна' }
      }
      throw error
    }
  },

  async acceptFriendRequest(requestId) {
    if (!requestId) {
      throw new Error('ID заявки обов\'язковий')
    }
    
    try {
      return await apiClient.secureRequest(`/friends/request/${requestId}/accept`, {
        method: 'POST'
      })
    } catch (error) {
      // Return error result if endpoint doesn't exist
      if (error.message.includes('404') || error.message.includes("Can't find")) {
        return { success: false, error: 'Функція друзів поки недоступна' }
      }
      throw error
    }
  },

  async rejectFriendRequest(requestId) {
    if (!requestId) {
      throw new Error('ID заявки обов\'язковий')
    }
    
    try {
      return await apiClient.secureRequest(`/friends/request/${requestId}/reject`, {
        method: 'POST'
      })
    } catch (error) {
      // Return error result if endpoint doesn't exist
      if (error.message.includes('404') || error.message.includes("Can't find")) {
        return { success: false, error: 'Функція друзів поки недоступна' }
      }
      throw error
    }
  },

  async removeFriend(userId) {
    if (!userId) {
      throw new Error('ID користувача обов\'язковий')
    }
    
    try {
      return await apiClient.secureRequest(`/friends/${userId}`, {
        method: 'DELETE'
      })
    } catch (error) {
      // Return error result if endpoint doesn't exist
      if (error.message.includes('404') || error.message.includes("Can't find")) {
        return { success: false, error: 'Функція друзів поки недоступна' }
      }
      throw error
    }
  },

  async cancelFriendRequest(userId) {
    if (!userId) {
      throw new Error('ID користувача обов\'язковий')
    }
    
    try {
      return await apiClient.secureRequest('/friends/request/cancel', {
        method: 'POST',
        body: JSON.stringify({ userId })
      })
    } catch (error) {
      if (error.message.includes('404') || error.message.includes("Can't find")) {
        return { success: false, error: 'Функція друзів поки недоступна' }
      }
      throw error
    }
  },

  async removeFollower(userId) {
    if (!userId) {
      throw new Error('ID користувача обов\'язковий')
    }
    
    try {
      return await apiClient.secureRequest('/friends/follower/remove', {
        method: 'POST',
        body: JSON.stringify({ userId })
      })
    } catch (error) {
      if (error.message.includes('404') || error.message.includes("Can't find")) {
        return { success: false, error: 'Функція друзів поки недоступна' }
      }
      throw error
    }
  },

  async blockUser(userId) {
    if (!userId) {
      throw new Error('ID користувача обов\'язковий')
    }
    
    try {
      return await apiClient.secureRequest('/users/block', {
        method: 'POST',
        body: JSON.stringify({ userId })
      })
    } catch (error) {
      if (error.message.includes('404') || error.message.includes("Can't find")) {
        return { success: false, error: 'Функція блокування поки недоступна' }
      }
      throw error
    }
  }
}
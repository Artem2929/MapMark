import { apiClient } from '../../../shared/api/client.js'

// Функція для отримання поточного користувача з localStorage
const getCurrentUser = () => {
  try {
    const token = localStorage.getItem('accessToken')
    if (!token) return null
    
    const payload = JSON.parse(atob(token.split('.')[1]))
    return { id: payload.id }
  } catch (error) {
    console.error('Помилка отримання користувача:', error)
    return null
  }
}

export const messagesService = {
  async getConversations() {
    try {
      return await apiClient.request('/messages/conversations')
    } catch (error) {
      if (error.message.includes('404') || error.message.includes("Can't find")) {
        return { success: true, data: [] }
      }
      throw error
    }
  },

  async getMessages(conversationId, params = {}) {
    if (!conversationId) {
      throw new Error('ID розмови обов\'язковий')
    }
    
    try {
      return await apiClient.request(`/messages/conversations/${conversationId}`, { params })
    } catch (error) {
      if (error.message.includes('404') || error.message.includes("Can't find")) {
        return { success: true, data: [] }
      }
      throw error
    }
  },

  async sendMessage(conversationId, content) {
    if (!conversationId || !content) {
      throw new Error('ID розмови та контент обов\'язкові')
    }
    
    try {
      return await apiClient.secureRequest('/messages', {
        method: 'POST',
        body: JSON.stringify({ conversationId, content })
      })
    } catch (error) {
      if (error.message.includes('404') || error.message.includes("Can't find")) {
        return { success: false, error: 'Функція повідомлень поки недоступна' }
      }
      throw error
    }
  },

  async sendFileMessage(conversationId, file, content = '') {
    if (!conversationId || !file) {
      throw new Error('ID розмови та файл обов\'язкові')
    }
    
    try {
      const formData = new FormData()
      formData.append('conversationId', conversationId)
      formData.append('file', file)
      if (content) formData.append('content', content)
      
      return await apiClient.secureRequest('/messages/file', {
        method: 'POST',
        body: formData
      })
    } catch (error) {
      if (error.message.includes('404') || error.message.includes("Can't find")) {
        return { success: false, error: 'Функція повідомлень поки недоступна' }
      }
      throw error
    }
  },

  async sendVoiceMessage(conversationId, audioFile) {
    if (!conversationId || !audioFile) {
      throw new Error('ID розмови та аудіо файл обов\'язкові')
    }
    
    try {
      const formData = new FormData()
      formData.append('conversationId', conversationId)
      formData.append('voice', audioFile)
      
      return await apiClient.secureRequest('/messages/voice', {
        method: 'POST',
        body: formData
      })
    } catch (error) {
      if (error.message.includes('404') || error.message.includes("Can't find")) {
        return { success: false, error: 'Функція повідомлень поки недоступна' }
      }
      throw error
    }
  },

  async deleteMessage(messageId) {
    if (!messageId) {
      throw new Error('ID повідомлення обов\'язковий')
    }
    
    try {
      return await apiClient.secureRequest(`/messages/${messageId}`, {
        method: 'DELETE'
      })
    } catch (error) {
      if (error.message.includes('404') || error.message.includes("Can't find")) {
        return { success: false, error: 'Функція повідомлень поки недоступна' }
      }
      throw error
    }
  },

  async deleteConversation(conversationId) {
    if (!conversationId) {
      throw new Error('ID розмови обов\'язковий')
    }
    
    try {
      return await apiClient.secureRequest(`/messages/conversations/${conversationId}`, {
        method: 'DELETE'
      })
    } catch (error) {
      if (error.message.includes('404') || error.message.includes("Can't find")) {
        return { success: false, error: 'Функція повідомлень поки недоступна' }
      }
      throw error
    }
  },

  async searchUsers(query) {
    if (!query || query.trim().length < 2) {
      return []
    }
    
    try {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        console.log('Користувач не авторизований')
        return []
      }
      
      const result = await apiClient.request(`/friends/${currentUser.id}`)
      console.log('API response:', result)
      
      if (!result.success) return []
      
      const friends = result.data || []
      console.log('Friends data:', friends)
      
      const filteredFriends = friends.filter(friend => {
        const matchName = friend.name?.toLowerCase().includes(query.toLowerCase())
        const matchEmail = friend.email?.toLowerCase().includes(query.toLowerCase())
        const matchFirstName = friend.firstName?.toLowerCase().includes(query.toLowerCase())
        const matchLastName = friend.lastName?.toLowerCase().includes(query.toLowerCase())
        const matchUsername = friend.username?.toLowerCase().includes(query.toLowerCase())
        
        console.log(`Checking friend:`, friend, `Query: ${query}`, {
          matchName, matchEmail, matchFirstName, matchLastName, matchUsername
        })
        
        return matchName || matchEmail || matchFirstName || matchLastName || matchUsername
      })
      
      console.log('Filtered friends:', filteredFriends)
      return filteredFriends
    } catch (error) {
      console.error('Помилка пошуку друзів:', error)
      return []
    }
  },

  async createConversation(userId) {
    if (!userId) {
      throw new Error('ID користувача обов\'язковий')
    }
    
    try {
      return await apiClient.secureRequest('/messages/conversations', {
        method: 'POST',
        body: JSON.stringify({ userId })
      })
    } catch (error) {
      if (error.message.includes('404') || error.message.includes("Can't find")) {
        return { success: false, error: 'Функція повідомлень поки недоступна' }
      }
      throw error
    }
  },

  async createOrFindConversation(userId) {
    return this.createConversation(userId)
  },

  async markAsRead(conversationId) {
    if (!conversationId) {
      throw new Error('ID розмови обов\'язковий')
    }
    
    try {
      return await apiClient.secureRequest(`/messages/conversations/${conversationId}/read`, {
        method: 'POST'
      })
    } catch (error) {
      if (error.message.includes('404') || error.message.includes("Can't find")) {
        return { success: false, error: 'Функція повідомлень поки недоступна' }
      }
      throw error
    }
  },

  // WebSocket methods (placeholder for future implementation)
  setToken(token) {
    // Implementation depends on WebSocket service
  },

  initSocket() {
    // Implementation depends on WebSocket service
    return null
  },

  onNewMessage(callback) {
    // Implementation depends on WebSocket service
  },

  onMessageDeleted(callback) {
    // Implementation depends on WebSocket service
  },

  onUserTyping(callback) {
    // Implementation depends on WebSocket service
  },

  onUserOnline(callback) {
    // Implementation depends on WebSocket service
  },

  onUserOffline(callback) {
    // Implementation depends on WebSocket service
  },

  off(event, callback) {
    // Implementation depends on WebSocket service
  },

  disconnect() {
    // Implementation depends on WebSocket service
  },

  joinConversation(conversationId) {
    // Implementation depends on WebSocket service
  },

  leaveConversation(conversationId) {
    // Implementation depends on WebSocket service
  },

  sendTyping(conversationId, isTyping) {
    // Implementation depends on WebSocket service
  }
}
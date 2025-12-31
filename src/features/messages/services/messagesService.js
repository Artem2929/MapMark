import { apiClient } from '../../../shared/api/client.js'

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
    if (!query || query.trim().length < 3) {
      return []
    }
    
    try {
      const result = await apiClient.request(`/users/search?q=${encodeURIComponent(query)}`)
      return result.success ? result.data : []
    } catch (error) {
      if (error.message.includes('404') || error.message.includes("Can't find")) {
        return []
      }
      throw error
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
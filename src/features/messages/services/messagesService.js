import { apiClient } from '../../../shared/api/client.js'

export const messagesService = {
  async getConversations() {
    try {
      return await apiClient.request('/messages/conversations')
    } catch (error) {
      // Return empty result if endpoint doesn't exist
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
  }
}
import { apiClient } from '../../../shared/api/client.js'
import socketService from '../../../services/socketService.js'

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

  async createOrFindConversation(userId) {
    return this.createConversation(userId)
  },

  // WebSocket методи
  initSocket() {
    const token = localStorage.getItem('accessToken')
    if (token) {
      return socketService.connect(token)
    }
    return null
  },

  joinConversation(conversationId) {
    socketService.joinConversation(conversationId)
  },

  leaveConversation(conversationId) {
    socketService.leaveConversation(conversationId)
  },

  startTyping(conversationId) {
    socketService.startTyping(conversationId)
  },

  stopTyping(conversationId) {
    socketService.stopTyping(conversationId)
  },

  onNewMessage(callback) {
    socketService.on('message:new', callback)
  },

  onMessageRead(callback) {
    socketService.on('message:read', callback)
  },

  onMessageDeleted(callback) {
    socketService.on('message:deleted', callback)
  },

  onUserTyping(callback) {
    socketService.on('typing:start', callback)
  },

  onUserStoppedTyping(callback) {
    socketService.on('typing:stop', callback)
  },

  onUserOnline(callback) {
    socketService.on('user:online', callback)
  },

  onUserOffline(callback) {
    socketService.on('user:offline', callback)
  },

  off(event, callback) {
    socketService.off(event, callback)
  },

  disconnect() {
    socketService.disconnect()
  },

  sendTyping(conversationId, isTyping) {
    if (isTyping) {
      this.startTyping(conversationId)
    } else {
      this.stopTyping(conversationId)
    }
  }
}
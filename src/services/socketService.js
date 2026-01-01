import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.listeners = new Map()
  }

  connect(token) {
    // WebSocket поки не реалізований на backend
    console.log('WebSocket connection disabled')
    return null
  }

  disconnect() {
    // Заглушка
  }

  joinConversation(conversationId) {
    // Заглушка
  }

  leaveConversation(conversationId) {
    // Заглушка
  }

  startTyping(conversationId) {
    // Заглушка
  }

  stopTyping(conversationId) {
    // Заглушка
  }

  on(event, callback) {
    // Заглушка
  }

  off(event, callback) {
    // Заглушка
  }

  removeAllListeners() {
    // Заглушка
  }

  get connected() {
    return false
  }
}

// Експортуємо singleton
export default new SocketService()
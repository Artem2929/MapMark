import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.listeners = new Map()
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket
    }

    const serverUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
    
    this.socket = io(serverUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    })

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server')
      this.isConnected = true
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server')
      this.isConnected = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      this.isConnected = false
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  // Приєднання до розмови
  joinConversation(conversationId) {
    if (this.socket?.connected) {
      this.socket.emit('conversation:join', conversationId)
    }
  }

  // Вихід з розмови
  leaveConversation(conversationId) {
    if (this.socket?.connected) {
      this.socket.emit('conversation:leave', conversationId)
    }
  }

  // Індикатор набору тексту
  startTyping(conversationId) {
    if (this.socket?.connected) {
      this.socket.emit('typing:start', { conversationId })
    }
  }

  stopTyping(conversationId) {
    if (this.socket?.connected) {
      this.socket.emit('typing:stop', { conversationId })
    }
  }

  // Підписка на події
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
      
      // Зберігаємо для можливості відписки
      if (!this.listeners.has(event)) {
        this.listeners.set(event, new Set())
      }
      this.listeners.get(event).add(callback)
    }
  }

  // Відписка від події
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
      
      if (this.listeners.has(event)) {
        this.listeners.get(event).delete(callback)
      }
    }
  }

  // Відписка від всіх подій
  removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket.off(event, callback)
        })
      })
      this.listeners.clear()
    }
  }

  // Перевірка підключення
  get connected() {
    return this.socket?.connected || false
  }
}

// Експортуємо singleton
export default new SocketService()
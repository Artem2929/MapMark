const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const logger = require('../utils/logger')

class SocketService {
  constructor() {
    this.io = null
    this.connectedUsers = new Map() // userId -> socketId
  }

  init(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    })

    // Middleware для автентифікації
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')
        
        if (!token) {
          return next(new Error('Authentication error'))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id).select('id username firstName lastName avatar')
        
        if (!user) {
          return next(new Error('User not found'))
        }

        socket.userId = user.id
        socket.user = user
        next()
      } catch (error) {
        logger.error('Socket authentication error:', error)
        next(new Error('Authentication error'))
      }
    })

    this.io.on('connection', (socket) => {
      logger.info(`User connected: ${socket.user.username} (${socket.userId})`)
      
      // Зберігаємо підключення
      this.connectedUsers.set(socket.userId, socket.id)
      
      // Повідомляємо інших про онлайн статус
      socket.broadcast.emit('user:online', {
        userId: socket.userId,
        user: socket.user
      })

      // Приєднання до кімнат розмов
      socket.on('conversation:join', (conversationId) => {
        socket.join(`conversation:${conversationId}`)
        logger.info(`User ${socket.userId} joined conversation ${conversationId}`)
      })

      // Вихід з кімнати розмови
      socket.on('conversation:leave', (conversationId) => {
        socket.leave(`conversation:${conversationId}`)
        logger.info(`User ${socket.userId} left conversation ${conversationId}`)
      })

      // Індикатор набору тексту
      socket.on('typing:start', ({ conversationId }) => {
        socket.to(`conversation:${conversationId}`).emit('typing:start', {
          userId: socket.userId,
          user: socket.user,
          conversationId
        })
      })

      socket.on('typing:stop', ({ conversationId }) => {
        socket.to(`conversation:${conversationId}`).emit('typing:stop', {
          userId: socket.userId,
          conversationId
        })
      })

      // Відключення
      socket.on('disconnect', () => {
        logger.info(`User disconnected: ${socket.user.username} (${socket.userId})`)
        
        // Видаляємо з підключених
        this.connectedUsers.delete(socket.userId)
        
        // Повідомляємо інших про офлайн статус
        socket.broadcast.emit('user:offline', {
          userId: socket.userId
        })
      })
    })

    logger.info('Socket.IO server initialized')
  }

  // Відправка нового повідомлення учасникам розмови
  emitNewMessage(conversationId, message, excludeUserId = null) {
    if (!this.io) return

    const eventData = {
      message,
      conversationId
    }

    if (excludeUserId) {
      // Відправляємо всім в кімнаті, крім відправника
      this.io.to(`conversation:${conversationId}`).emit('message:new', eventData)
    } else {
      this.io.to(`conversation:${conversationId}`).emit('message:new', eventData)
    }
  }

  // Повідомлення про прочитання
  emitMessageRead(conversationId, userId) {
    if (!this.io) return

    this.io.to(`conversation:${conversationId}`).emit('message:read', {
      conversationId,
      userId
    })
  }

  // Видалення повідомлення
  emitMessageDeleted(conversationId, messageId) {
    if (!this.io) return

    this.io.to(`conversation:${conversationId}`).emit('message:deleted', {
      conversationId,
      messageId
    })
  }

  // Перевірка онлайн статусу
  isUserOnline(userId) {
    return this.connectedUsers.has(userId)
  }

  // Отримання всіх онлайн користувачів
  getOnlineUsers() {
    return Array.from(this.connectedUsers.keys())
  }
}

module.exports = new SocketService()
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class SocketService {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map();
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Аутентифікація користувача
      socket.on('authenticate', async (token) => {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
          const user = await User.findById(decoded.id);
          
          if (user) {
            socket.userId = user._id.toString();
            this.connectedUsers.set(socket.userId, socket.id);
            
            // Оновити статус користувача
            await User.findByIdAndUpdate(user._id, { 
              isOnline: true,
              lastSeen: new Date()
            });

            socket.emit('authenticated', { userId: user._id });
            
            // Повідомити інших про онлайн статус
            socket.broadcast.emit('userOnline', { userId: user._id });
            
            console.log(`User ${user.username} authenticated`);
          }
        } catch (error) {
          socket.emit('authError', { message: 'Authentication failed' });
        }
      });

      // Приєднатися до розмови
      socket.on('joinConversation', (conversationId) => {
        socket.join(conversationId);
        console.log(`User ${socket.userId} joined conversation ${conversationId}`);
      });

      // Покинути розмову
      socket.on('leaveConversation', (conversationId) => {
        socket.leave(conversationId);
        console.log(`User ${socket.userId} left conversation ${conversationId}`);
      });

      // Користувач друкує
      socket.on('typing', (data) => {
        socket.to(data.conversationId).emit('userTyping', {
          userId: socket.userId,
          isTyping: data.isTyping
        });
      });

      // Відключення
      socket.on('disconnect', async () => {
        console.log('User disconnected:', socket.id);
        
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          
          // Оновити статус користувача
          await User.findByIdAndUpdate(socket.userId, { 
            isOnline: false,
            lastSeen: new Date()
          });

          // Повідомити інших про офлайн статус
          socket.broadcast.emit('userOffline', { userId: socket.userId });
        }
      });
    });
  }

  // Відправити повідомлення конкретному користувачу
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  // Відправити повідомлення в розмову
  sendToConversation(conversationId, event, data) {
    this.io.to(conversationId).emit(event, data);
  }

  // Отримати онлайн користувачів
  getOnlineUsers() {
    return Array.from(this.connectedUsers.keys());
  }
}

module.exports = SocketService;
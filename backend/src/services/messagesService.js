const Message = require('../models/Message')
const User = require('../models/User')
const mongoose = require('mongoose')
const logger = require('../utils/logger')

class MessagesService {
  async getUserObjectId(userId) {
    try {
      // Спочатку шукаємо по полю id
      let user = await User.findOne({ id: userId })
      if (user) {
        return user._id
      }
      
      // Якщо не знайшли, перевіряємо чи це вже ObjectId
      if (userId.match(/^[0-9a-fA-F]{24}$/)) {
        user = await User.findById(userId)
        if (user) {
          return user._id
        }
      }
      
      console.log(`User not found for userId: ${userId}`)
      return null
    } catch (error) {
      console.error('Error in getUserObjectId:', error)
      return null
    }
  }

  generateConversationId(userId1, userId2) {
    return [userId1, userId2].sort().join('-')
  }

  async getConversations(userId) {
    // Поки що повертаємо порожній список, оскільки немає повідомлень
    return []
  }

  async getMessages(userId, otherUserId, page = 1, limit = 50) {
    const userObjectId = await this.getUserObjectId(userId)
    const otherUserObjectId = await this.getUserObjectId(otherUserId)
    
    if (!userObjectId || !otherUserObjectId) {
      throw new Error('Користувача не знайдено')
    }

    const conversationId = this.generateConversationId(userObjectId.toString(), otherUserObjectId.toString())
    
    const messages = await Message.find({ conversationId })
      .populate('sender', 'id name avatar')
      .populate('recipient', 'id name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * page)
      .skip((page - 1) * limit)

    return messages.reverse().map(msg => ({
      id: msg._id,
      content: msg.content,
      createdAt: msg.createdAt,
      read: msg.read,
      sender: {
        id: msg.sender.id || msg.sender._id,
        name: msg.sender.name,
        avatar: msg.sender.avatar
      },
      isFromMe: msg.sender._id.toString() === userObjectId.toString()
    }))
  }

  async sendMessage(senderId, recipientId, content) {
    const senderObjectId = await this.getUserObjectId(senderId)
    const recipientObjectId = await this.getUserObjectId(recipientId)
    
    if (!senderObjectId || !recipientObjectId) {
      throw new Error('Користувача не знайдено')
    }

    const conversationId = this.generateConversationId(senderObjectId.toString(), recipientObjectId.toString())
    
    const message = new Message({
      sender: senderObjectId,
      recipient: recipientObjectId,
      content: content.trim(),
      conversationId
    })

    await message.save()
    await message.populate('sender', 'id name avatar')
    await message.populate('recipient', 'id name avatar')
    
    logger.info('Message sent', { senderId, recipientId, conversationId })
    
    return {
      id: message._id,
      content: message.content,
      createdAt: message.createdAt,
      read: message.read,
      sender: {
        id: message.sender.id || message.sender._id,
        name: message.sender.name,
        avatar: message.sender.avatar
      },
      isFromMe: true
    }
  }

  async markAsRead(userId, conversationId) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) {
      throw new Error('Користувача не знайдено')
    }

    await Message.updateMany(
      { 
        conversationId,
        recipient: userObjectId,
        read: false
      },
      { read: true }
    )

    logger.info('Messages marked as read', { userId, conversationId })
  }

  async createOrFindConversation(userId, otherUserId) {
    const userObjectId = await this.getUserObjectId(userId)
    const otherUserObjectId = await this.getUserObjectId(otherUserId)
    
    if (!userObjectId || !otherUserObjectId) {
      throw new Error('Користувача не знайдено')
    }

    // Створюємо новий ObjectId для conversationId
    const conversationId = new mongoose.Types.ObjectId()
    
    const otherUser = await User.findById(otherUserObjectId)
    
    return {
      _id: conversationId,
      participant: {
        _id: otherUser._id,
        id: otherUser.id,
        username: otherUser.username,
        firstName: otherUser.firstName,
        lastName: otherUser.lastName,
        avatar: otherUser.avatar,
        isOnline: false
      },
      lastMessage: null,
      unreadCount: 0,
      lastActivity: new Date()
    }
  }
}

module.exports = new MessagesService()
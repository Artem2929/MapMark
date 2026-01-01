const Message = require('../models/Message')
const Conversation = require('../models/Conversation')
const User = require('../models/User')
const mongoose = require('mongoose')

class MessageService {
  async getMessages(conversationId, userId, page = 1, limit = 50) {
    // Перевіряємо доступ до розмови
    const conversation = await Conversation.findById(conversationId)
    if (!conversation || !conversation.hasParticipant(userId)) {
      throw new Error('Розмову не знайдено або доступ заборонено')
    }

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'id username firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()

    return messages.reverse().map(msg => ({
      _id: msg._id,
      text: msg.text,
      senderId: msg.senderId._id,
      sender: {
        id: msg.senderId.id,
        username: msg.senderId.username,
        firstName: msg.senderId.firstName,
        lastName: msg.senderId.lastName,
        avatar: msg.senderId.avatar
      },
      createdAt: msg.createdAt,
      readBy: msg.readBy,
      messageType: msg.messageType,
      fileUrl: msg.fileUrl,
      fileName: msg.fileName
    }))
  }

  async sendMessage(conversationId, senderId, text) {
    // Перевіряємо доступ до розмови
    const conversation = await Conversation.findById(conversationId)
    if (!conversation || !conversation.hasParticipant(senderId)) {
      throw new Error('Розмову не знайдено або доступ заборонено')
    }

    // Створюємо повідомлення
    const message = new Message({
      conversationId,
      senderId,
      text: text.trim(),
      messageType: 'text'
    })

    await message.save()

    // Оновлюємо розмову
    conversation.lastMessage = message._id
    conversation.updatedAt = new Date()
    
    // Збільшуємо лічильник непрочитаних для інших учасників
    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== senderId.toString()) {
        const currentCount = conversation.unreadCount.get(participantId.toString()) || 0
        conversation.unreadCount.set(participantId.toString(), currentCount + 1)
      }
    })

    await conversation.save()

    // Повертаємо повідомлення з populated даними
    await message.populate('senderId', 'id username firstName lastName avatar')

    const messageData = {
      _id: message._id,
      text: message.text,
      senderId: message.senderId._id,
      sender: {
        id: message.senderId.id,
        username: message.senderId.username,
        firstName: message.senderId.firstName,
        lastName: message.senderId.lastName,
        avatar: message.senderId.avatar
      },
      createdAt: message.createdAt,
      readBy: message.readBy,
      messageType: message.messageType,
      conversation: conversationId
    }

    // Відправляємо через WebSocket (поки відключено)
    // socketService.emitNewMessage(conversationId, messageData, senderId)

    return messageData
  }

  async markAsRead(conversationId, userId) {
    // Перевіряємо доступ до розмови
    const conversation = await Conversation.findById(conversationId)
    if (!conversation || !conversation.hasParticipant(userId)) {
      throw new Error('Розмову не знайдено або доступ заборонено')
    }

    // Позначаємо повідомлення як прочитані
    await Message.updateMany(
      { 
        conversationId,
        senderId: { $ne: userId },
        readBy: { $ne: userId }
      },
      { $addToSet: { readBy: userId } }
    )

    // Скидаємо лічильник непрочитаних
    conversation.unreadCount.set(userId.toString(), 0)
    await conversation.save()

    // Повідомляємо через WebSocket (поки відключено)
    // socketService.emitMessageRead(conversationId, userId)

    return { success: true }
  }

  async deleteMessage(messageId, userId) {
    const message = await Message.findById(messageId)
    
    if (!message) {
      throw new Error('Повідомлення не знайдено')
    }

    if (message.senderId.toString() !== userId.toString()) {
      throw new Error('Ви можете видаляти тільки свої повідомлення')
    }

    await Message.findByIdAndDelete(messageId)
    
    return { success: true }
  }
}

module.exports = new MessageService()
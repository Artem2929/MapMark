const Conversation = require('../models/Conversation')
const Message = require('../models/Message')
const User = require('../models/User')
const mongoose = require('mongoose')

class ConversationService {
  async getConversations(userId) {
    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    })
    .populate({
      path: 'participants',
      select: 'name username avatar isOnline lastSeen',
      match: { _id: { $ne: userId } }
    })
    .populate({
      path: 'lastMessage',
      select: 'text createdAt senderId'
    })
    .sort({ updatedAt: -1 })
    .lean()

    return conversations.map(conv => ({
      _id: conv._id,
      participant: conv.participants[0],
      lastMessage: conv.lastMessage,
      unreadCount: conv.unreadCount?.get(userId.toString()) || 0,
      lastActivity: conv.updatedAt
    }))
  }

  async createConversation(userId, otherUserId) {
    // Перевіряємо чи існує розмова
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] }
    })

    if (conversation) {
      return conversation
    }

    // Перевіряємо чи існує інший користувач
    const otherUser = await User.findById(otherUserId).select('_id').lean()
    if (!otherUser) {
      throw new Error('Користувача не знайдено')
    }

    // Створюємо нову розмову
    conversation = new Conversation({
      participants: [userId, otherUserId],
      unreadCount: new Map()
    })

    await conversation.save()
    
    // Повертаємо з populated даними
    return await Conversation.findById(conversation._id)
      .populate({
        path: 'participants',
        select: 'name username avatar isOnline lastSeen',
        match: { _id: { $ne: userId } }
      })
      .lean()
  }

  async deleteConversation(userId, conversationId) {
    const conversation = await Conversation.findById(conversationId)
    
    if (!conversation) {
      throw new Error('Розмову не знайдено')
    }

    if (!conversation.hasParticipant(userId)) {
      throw new Error('Доступ заборонено')
    }

    // Позначаємо як неактивну замість видалення
    conversation.isActive = false
    await conversation.save()

    return { success: true }
  }

  async getConversationById(conversationId, userId) {
    const conversation = await Conversation.findById(conversationId)
      .populate({
        path: 'participants',
        select: 'name username avatar isOnline lastSeen'
      })
      .lean()

    if (!conversation) {
      throw new Error('Розмову не знайдено')
    }

    if (!conversation.participants.some(p => p._id.toString() === userId.toString())) {
      throw new Error('Доступ заборонено')
    }

    return conversation
  }
}

module.exports = new ConversationService()
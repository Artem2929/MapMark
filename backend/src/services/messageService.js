const Message = require('../models/Message')
const Conversation = require('../models/Conversation')
const mongoose = require('mongoose')

class MessageService {
  async getMessages(conversationId, userId, cursor = null, limit = 50) {
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      throw new Error('Розмову не знайдено')
    }

    if (!conversation.hasParticipant(userId)) {
      throw new Error('Доступ заборонено')
    }

    const query = { conversationId }
    
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) }
    }

    const messages = await Message.find(query)
      .populate({
        path: 'senderId',
        select: 'name username avatar'
      })
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean()

    const hasMore = messages.length > limit
    if (hasMore) {
      messages.pop()
    }

    const nextCursor = messages.length > 0 ? messages[messages.length - 1].createdAt : null

    return {
      messages: messages.reverse(),
      hasMore,
      nextCursor
    }
  }

  async sendMessage(conversationId, senderId, text) {
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      throw new Error('Розмову не знайдено')
    }

    if (!conversation.hasParticipant(senderId)) {
      throw new Error('Доступ заборонено')
    }

    const message = new Message({
      conversationId,
      senderId,
      text: text.trim(),
      readBy: [senderId]
    })

    await message.save()
    await this.updateConversationAfterMessage(conversation, message)

    return await Message.findById(message._id)
      .populate({
        path: 'senderId',
        select: 'name username avatar'
      })
      .lean()
  }

  async markAsRead(conversationId, userId) {
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      throw new Error('Розмову не знайдено')
    }

    if (!conversation.hasParticipant(userId)) {
      throw new Error('Доступ заборонено')
    }

    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        readBy: { $ne: userId }
      },
      {
        $addToSet: { readBy: userId }
      }
    )

    conversation.unreadCount.set(userId.toString(), 0)
    await conversation.save()

    return { success: true }
  }

  async deleteMessage(messageId, userId) {
    const message = await Message.findById(messageId)
    
    if (!message) {
      throw new Error('Повідомлення не знайдено')
    }

    if (message.senderId.toString() !== userId.toString()) {
      throw new Error('Доступ заборонено')
    }

    await Message.findByIdAndDelete(messageId)
    return { success: true }
  }

  async updateConversationAfterMessage(conversation, message) {
    conversation.lastMessage = message._id
    conversation.updatedAt = new Date()

    conversation.participants.forEach(participantId => {
      const participantIdStr = participantId.toString()
      if (participantIdStr !== message.senderId.toString()) {
        const currentCount = conversation.unreadCount.get(participantIdStr) || 0
        conversation.unreadCount.set(participantIdStr, currentCount + 1)
      }
    })

    await conversation.save()
  }
}

module.exports = new MessageService()
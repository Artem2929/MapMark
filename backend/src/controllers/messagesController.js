const messagesService = require("../services/messagesService")
const messageService = require('../services/messageService')
const { success, error } = require('../utils/response')
const logger = require('../utils/logger')

const messagesController = {
  // GET /api/v1/messages/conversations
  async getConversations(req, res) {
    try {
      const userId = req.user.id
      const conversations = await messagesService.getConversations(userId)
      
      success(res, conversations, 'Розмови отримано')
    } catch (err) {
      logger.error('Get conversations error', { error: err.message, userId: req.user.id })
      error(res, err.message, 500)
    }
  },

  // GET /api/v1/messages/conversations/:conversationId
  async getMessages(req, res) {
    try {
      const userId = req.user.id
      const { conversationId } = req.params
      const { page = 1, limit = 50 } = req.query
      
      const messages = await messageService.getMessages(conversationId, userId, parseInt(page), parseInt(limit))
      
      success(res, messages, 'Повідомлення отримано')
    } catch (err) {
      logger.error('Get messages error', { error: err.message, userId: req.user.id })
      
      if (err.message.includes('не знайдено')) {
        return error(res, err.message, 404)
      }
      
      error(res, err.message, 500)
    }
  },

  // POST /api/v1/messages
  async sendMessage(req, res) {
    try {
      const senderId = req.user.id
      const { conversationId, content } = req.body
      
      if (!content || !content.trim()) {
        return error(res, 'Повідомлення не може бути порожнім', 400)
      }
      
      const message = await messageService.sendMessage(conversationId, senderId, content)
      
      success(res, message, 'Повідомлення надіслано', 201)
    } catch (err) {
      logger.error('Send message error', { error: err.message, senderId: req.user.id })
      
      if (err.message.includes('не знайдено')) {
        return error(res, err.message, 404)
      }
      
      error(res, err.message, 500)
    }
  },

  // POST /api/v1/messages/conversations/:conversationId/read
  async markAsRead(req, res) {
    try {
      const userId = req.user.id
      const { conversationId } = req.params
      
      await messageService.markAsRead(conversationId, userId)
      
      success(res, null, 'Повідомлення позначено як прочитане')
    } catch (err) {
      logger.error('Mark as read error', { error: err.message, userId: req.user.id })
      
      if (err.message.includes('не знайдено')) {
        return error(res, err.message, 404)
      }
      
      error(res, err.message, 500)
    }
  },

  // POST /api/v1/messages/conversations
  async createConversation(req, res) {
    try {
      const userId = req.user.id
      const { userId: otherUserId } = req.body
      
      if (!otherUserId) {
        return error(res, 'ID користувача обов\'язковий', 400)
      }
      
      const conversation = await messagesService.createConversation(userId, otherUserId)
      
      success(res, conversation, 'Розмова створена', 201)
    } catch (err) {
      logger.error('Create conversation error', { error: err.message, userId: req.user.id })
      
      if (err.message.includes('не знайдено')) {
        return error(res, err.message, 404)
      }
      
      error(res, err.message, 500)
    }
  },

  // DELETE /api/v1/messages/conversations/:conversationId
  async deleteConversation(req, res) {
    try {
      const userId = req.user.id
      const { conversationId } = req.params
      
      await messagesService.deleteConversation(userId, conversationId)
      
      success(res, null, 'Розмова видалена')
    } catch (err) {
      logger.error('Delete conversation error', { error: err.message, userId: req.user.id })
      
      if (err.message.includes('не знайдено')) {
        return error(res, err.message, 404)
      }
      
      error(res, err.message, 500)
    }
  }
}

module.exports = messagesController
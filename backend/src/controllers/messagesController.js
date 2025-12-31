const messagesService = require('../services/messagesService')
const { success, error } = require('../utils/response')
const { validationResult } = require('express-validator')
const logger = require('../utils/logger')

const messagesController = {
  // GET /api/conversations
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

  // GET /api/messages/:otherUserId
  async getMessages(req, res) {
    try {
      const userId = req.user.id
      const { otherUserId } = req.params
      const { page = 1, limit = 50 } = req.query
      
      const messages = await messagesService.getMessages(userId, otherUserId, parseInt(page), parseInt(limit))
      
      success(res, messages, 'Повідомлення отримано')
    } catch (err) {
      logger.error('Get messages error', { error: err.message, userId: req.user.id })
      
      if (err.message.includes('не знайдено')) {
        return error(res, err.message, 404)
      }
      
      error(res, err.message, 500)
    }
  },

  // POST /api/messages/send
  async sendMessage(req, res) {
    try {
      const senderId = req.user.id
      const { recipientId, content } = req.body
      
      if (!content || !content.trim()) {
        return error(res, 'Повідомлення не може бути порожнім', 400)
      }
      
      const message = await messagesService.sendMessage(senderId, recipientId, content)
      
      success(res, message, 'Повідомлення надіслано', 201)
    } catch (err) {
      logger.error('Send message error', { error: err.message, senderId: req.user.id })
      
      if (err.message.includes('не знайдено')) {
        return error(res, err.message, 404)
      }
      
      error(res, err.message, 500)
    }
  },

  // PUT /api/messages/:conversationId/read
  async markAsRead(req, res) {
    try {
      const userId = req.user.id
      const { conversationId } = req.params
      
      await messagesService.markAsRead(userId, conversationId)
      
      success(res, null, 'Повідомлення позначено як прочитане')
    } catch (err) {
      logger.error('Mark as read error', { error: err.message, userId: req.user.id })
      
      if (err.message.includes('не знайдено')) {
        return error(res, err.message, 404)
      }
      
      error(res, err.message, 500)
    }
  },

  // POST /api/messages/conversations
  async createConversation(req, res) {
    try {
      const userId = req.user.id
      const { userId: otherUserId } = req.body
      
      if (!otherUserId) {
        return error(res, 'ID користувача обов\'\'язковий', 400)
      }
      
      const conversation = await messagesService.createOrFindConversation(userId, otherUserId)
      
      success(res, conversation, 'Розмова створена', 201)
    } catch (err) {
      logger.error('Create conversation error', { error: err.message, userId: req.user.id })
      
      if (err.message.includes('не знайдено')) {
        return error(res, err.message, 404)
      }
      
      error(res, err.message, 500)
    }
  }
}

module.exports = messagesController
const messagesService = require('../services/messagesService')
const { success } = require('../utils/response')
const logger = require('../utils/logger')

const messagesController = {
  async getConversations(req, res) {
    try {
      const userId = req.user.id
      const conversations = await messagesService.getConversations(userId)
      
      success(res, conversations, 'Розмови отримано')
    } catch (error) {
      logger.error('Get conversations error', { error: error.message, userId: req.user.id })
      return res.status(500).json({
        status: 'error',
        message: error.message
      })
    }
  },

  async getMessages(req, res) {
    try {
      const userId = req.user.id
      const { otherUserId } = req.params
      const { page = 1, limit = 50 } = req.query
      
      const messages = await messagesService.getMessages(userId, otherUserId, parseInt(page), parseInt(limit))
      
      success(res, messages, 'Повідомлення отримано')
    } catch (error) {
      logger.error('Get messages error', { error: error.message, userId: req.user.id })
      
      if (error.message.includes('не знайдено')) {
        return res.status(404).json({
          status: 'fail',
          message: error.message
        })
      }
      
      return res.status(500).json({
        status: 'error',
        message: error.message
      })
    }
  },

  async sendMessage(req, res) {
    try {
      const senderId = req.user.id
      const { recipientId, content } = req.body
      
      if (!content || !content.trim()) {
        return res.status(400).json({
          status: 'fail',
          message: 'Повідомлення не може бути порожнім'
        })
      }
      
      const message = await messagesService.sendMessage(senderId, recipientId, content)
      
      success(res, message, 'Повідомлення надіслано', 201)
    } catch (error) {
      logger.error('Send message error', { error: error.message, senderId: req.user.id })
      
      if (error.message.includes('не знайдено')) {
        return res.status(404).json({
          status: 'fail',
          message: error.message
        })
      }
      
      return res.status(500).json({
        status: 'error',
        message: error.message
      })
    }
  },

  async markAsRead(req, res) {
    try {
      const userId = req.user.id
      const { conversationId } = req.params
      
      await messagesService.markAsRead(userId, conversationId)
      
      success(res, null, 'Повідомлення позначено як прочитане')
    } catch (error) {
      logger.error('Mark as read error', { error: error.message, userId: req.user.id })
      
      if (error.message.includes('не знайдено')) {
        return res.status(404).json({
          status: 'fail',
          message: error.message
        })
      }
      
      return res.status(500).json({
        status: 'error',
        message: error.message
      })
    }
  }
}

module.exports = messagesController
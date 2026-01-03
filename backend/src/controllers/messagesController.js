const messagesService = require('../services/messagesService')
const messageService = require('../services/messageService')
const { success } = require('../utils/response')
const { catchAsync } = require('../utils/errorHandler')
const logger = require('../utils/logger')

const messagesController = {
  getConversations: catchAsync(async (req, res) => {
    const userId = req.user.id
    const conversations = await messagesService.getConversations(userId)
    
    success(res, conversations, 'Розмови отримано')
  }),

  getMessages: catchAsync(async (req, res) => {
    const userId = req.user.id
    const { conversationId } = req.params
    const { page = 1, limit = 50 } = req.query
    
    const messages = await messageService.getMessages(conversationId, userId, parseInt(page), parseInt(limit))
    
    success(res, messages, 'Повідомлення отримано')
  }),

  sendMessage: catchAsync(async (req, res) => {
    const senderId = req.user.id
    const { conversationId, content } = req.body
    
    const message = await messageService.sendMessage(conversationId, senderId, content)
    
    success(res, message, 'Повідомлення надіслано', 201)
  }),

  markAsRead: catchAsync(async (req, res) => {
    const userId = req.user.id
    const { conversationId } = req.params
    
    await messageService.markAsRead(conversationId, userId)
    
    success(res, null, 'Повідомлення позначено як прочитане')
  }),

  createConversation: catchAsync(async (req, res) => {
    const userId = req.user.id
    const { userId: otherUserId } = req.body
    
    const conversation = await messagesService.createConversation(userId, otherUserId)
    
    success(res, conversation, 'Розмова створена', 201)
  }),

  deleteConversation: catchAsync(async (req, res) => {
    const userId = req.user.id
    const { conversationId } = req.params
    
    await messagesService.deleteConversation(userId, conversationId)
    
    success(res, null, 'Розмова видалена')
  })
}

module.exports = messagesController
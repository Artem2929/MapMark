const express = require('express')
const messagesController = require('../controllers/messagesController')
const { protect } = require('../middleware/auth')
const { csrfProtection } = require('../middleware/csrf')

const router = express.Router()

// Всі routes потребують авторизації
router.use(protect)

// GET /api/v1/messages/conversations - Get user's conversations
router.get('/conversations', messagesController.getConversations)

// POST /api/v1/messages/conversations - Create conversation
router.post('/conversations', csrfProtection, messagesController.createConversation)

// GET /api/v1/messages/conversations/:conversationId - Get messages in conversation
router.get('/conversations/:conversationId', messagesController.getMessages)

// POST /api/v1/messages/conversations/:conversationId/read - Mark conversation as read
router.post('/conversations/:conversationId/read', csrfProtection, messagesController.markAsRead)

// DELETE /api/v1/messages/conversations/:conversationId - Delete conversation
router.delete('/conversations/:conversationId', csrfProtection, messagesController.deleteConversation)

// POST /api/v1/messages - Send message
router.post('/', csrfProtection, messagesController.sendMessage)

module.exports = router
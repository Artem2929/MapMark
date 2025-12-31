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

// GET /api/v1/messages/:otherUserId - Get messages with specific user
router.get('/:otherUserId', messagesController.getMessages)

// POST /api/v1/messages/send - Send message
router.post('/send', csrfProtection, messagesController.sendMessage)

// PUT /api/v1/messages/:conversationId/read - Mark conversation as read
router.put('/:conversationId/read', csrfProtection, messagesController.markAsRead)

module.exports = router
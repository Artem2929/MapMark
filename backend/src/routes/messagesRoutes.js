const express = require('express')
const messagesController = require('../controllers/messagesController')
const { protect } = require('../middleware/auth')
const { csrfProtection } = require('../middleware/csrf')

const router = express.Router()

// All messages routes require authentication
router.use(protect)

// GET /api/v1/messages/conversations - Get user's conversations
router.get('/conversations', messagesController.getConversations)

// GET /api/v1/messages/:otherUserId - Get messages with specific user
router.get('/:otherUserId', messagesController.getMessages)

// POST /api/v1/messages/send - Send message
router.post('/send', csrfProtection, messagesController.sendMessage)

// PUT /api/v1/messages/:conversationId/read - Mark conversation as read
router.put('/:conversationId/read', csrfProtection, messagesController.markAsRead)

module.exports = router
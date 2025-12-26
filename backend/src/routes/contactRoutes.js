const express = require('express')
const rateLimit = require('express-rate-limit')
const contactController = require('../controllers/contactController')
const { createContactValidation } = require('../validators/contactValidators')
const csrfProtection = require('../middleware/csrf')

const router = express.Router()

// Rate limiting for contact form
const contactRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 messages per 15 minutes
  message: {
    status: 'fail',
    message: 'Забагато повідомлень. Спробуйте пізніше.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Public routes
router.post('/send', 
  contactRateLimit,
  csrfProtection,
  createContactValidation,
  contactController.sendMessage
)

// Admin routes (would need auth middleware in real app)
router.get('/messages', contactController.getMessages)
router.patch('/messages/:id/status', contactController.updateMessageStatus)

module.exports = router
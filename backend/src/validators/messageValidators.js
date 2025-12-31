const { body, param, query } = require('express-validator')
const mongoose = require('mongoose')

const messageValidators = {
  sendMessage: [
    body('text')
      .trim()
      .isLength({ min: 1, max: 4000 })
      .withMessage('Повідомлення має бути від 1 до 4000 символів'),
    
    body('conversationId')
      .custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error('Невірний ID розмови')
        }
        return true
      })
  ],

  getMessages: [
    param('conversationId')
      .custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error('Невірний ID розмови')
        }
        return true
      }),
    
    query('cursor')
      .optional()
      .isISO8601()
      .withMessage('Невірний формат cursor'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit має бути від 1 до 100')
  ],

  createConversation: [
    body('userId')
      .custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error('Невірний ID користувача')
        }
        return true
      })
  ],

  markAsRead: [
    param('conversationId')
      .custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error('Невірний ID розмови')
        }
        return true
      })
  ],

  deleteMessage: [
    param('messageId')
      .custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error('Невірний ID повідомлення')
        }
        return true
      })
  ]
}

module.exports = messageValidators
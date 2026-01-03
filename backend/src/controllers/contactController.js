const { validationResult } = require('express-validator')
const contactService = require('../services/contactService')
const { success, created, error: errorResponse, badRequest } = require('../utils/response')
const logger = require('../utils/logger')

class ContactController {
  async sendMessage(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return badRequest(res, 'Помилка валідації', errors.array())
      }

      const { name, email, message } = req.body
      
      const contact = await contactService.createMessage({
        name,
        email,
        message,
        ip: req.ip
      })

      logger.info('Contact message sent successfully', { 
        contactId: contact._id,
        email: contact.email,
        ip: req.ip 
      })

      return created(res, {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        createdAt: contact.createdAt
      }, 'Повідомлення надіслано успішно')

    } catch (error) {
      logger.error('Error sending contact message', { 
        error: error.message,
        body: { ...req.body, message: '[REDACTED]' },
        ip: req.ip 
      })

      if (error.name === 'ValidationError') {
        return badRequest(res, 'Помилка валідації даних', error.errors)
      }

      return errorResponse(res, 'Помилка надсилання повідомлення')
    }
  }

  async getMessages(req, res) {
    try {
      const { page, limit, status } = req.query
      
      const result = await contactService.getMessages({}, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        status
      })

      return success(res, result)

    } catch (error) {
      logger.error('Error fetching contact messages', { 
        error: error.message,
        query: req.query 
      })

      return errorResponse(res, 'Помилка отримання повідомлень')
    }
  }

  async updateMessageStatus(req, res) {
    try {
      const { id } = req.params
      const { status } = req.body

      if (!['new', 'read', 'replied'].includes(status)) {
        return badRequest(res, 'Невірний статус повідомлення')
      }

      const contact = await contactService.updateMessageStatus(id, status)

      return success(res, {
        id: contact._id,
        status: contact.status
      }, 'Статус повідомлення оновлено')

    } catch (error) {
      logger.error('Error updating contact message status', { 
        error: error.message,
        messageId: req.params.id,
        status: req.body.status 
      })

      if (error.message === 'Повідомлення не знайдено') {
        return errorResponse(res, error.message, 404)
      }

      return errorResponse(res, 'Помилка оновлення статусу')
    }
  }
}

module.exports = new ContactController()
const { validationResult } = require('express-validator')
const contactService = require('../services/contactService')
const { createSuccessResponse, createErrorResponse } = require('../utils/response')
const logger = require('../utils/logger')

class ContactController {
  async sendMessage(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return createErrorResponse(res, 'Помилка валідації', 400, errors.array())
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

      return createSuccessResponse(res, {
        message: 'Повідомлення надіслано успішно',
        contact: {
          id: contact._id,
          name: contact.name,
          email: contact.email,
          createdAt: contact.createdAt
        }
      }, 201)

    } catch (error) {
      logger.error('Error sending contact message', { 
        error: error.message,
        body: { ...req.body, message: '[REDACTED]' },
        ip: req.ip 
      })

      if (error.name === 'ValidationError') {
        return createErrorResponse(res, 'Помилка валідації даних', 400, error.errors)
      }

      return createErrorResponse(res, 'Помилка надсилання повідомлення', 500)
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

      return createSuccessResponse(res, result)

    } catch (error) {
      logger.error('Error fetching contact messages', { 
        error: error.message,
        query: req.query 
      })

      return createErrorResponse(res, 'Помилка отримання повідомлень', 500)
    }
  }

  async updateMessageStatus(req, res) {
    try {
      const { id } = req.params
      const { status } = req.body

      if (!['new', 'read', 'replied'].includes(status)) {
        return createErrorResponse(res, 'Невірний статус повідомлення', 400)
      }

      const contact = await contactService.updateMessageStatus(id, status)

      return createSuccessResponse(res, {
        message: 'Статус повідомлення оновлено',
        contact: {
          id: contact._id,
          status: contact.status
        }
      })

    } catch (error) {
      logger.error('Error updating contact message status', { 
        error: error.message,
        messageId: req.params.id,
        status: req.body.status 
      })

      if (error.message === 'Повідомлення не знайдено') {
        return createErrorResponse(res, error.message, 404)
      }

      return createErrorResponse(res, 'Помилка оновлення статусу', 500)
    }
  }
}

module.exports = new ContactController()
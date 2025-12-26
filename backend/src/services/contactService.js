const Contact = require('../models/Contact')
const logger = require('../utils/logger')

class ContactService {
  async createMessage(messageData) {
    try {
      const contact = new Contact(messageData)
      await contact.save()
      
      logger.info('Contact message created', { 
        contactId: contact._id,
        email: contact.email 
      })
      
      return contact
    } catch (error) {
      logger.error('Error creating contact message', { 
        error: error.message,
        messageData: { ...messageData, message: '[REDACTED]' }
      })
      throw error
    }
  }

  async getMessages(filters = {}, options = {}) {
    try {
      const { page = 1, limit = 20, status } = options
      const query = {}
      
      if (status) query.status = status
      
      const contacts = await Contact.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-__v')
      
      const total = await Contact.countDocuments(query)
      
      return {
        contacts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      logger.error('Error fetching contact messages', { error: error.message })
      throw error
    }
  }

  async updateMessageStatus(messageId, status) {
    try {
      const contact = await Contact.findByIdAndUpdate(
        messageId,
        { status },
        { new: true, runValidators: true }
      )
      
      if (!contact) {
        throw new Error('Повідомлення не знайдено')
      }
      
      logger.info('Contact message status updated', { 
        contactId: messageId,
        status 
      })
      
      return contact
    } catch (error) {
      logger.error('Error updating contact message status', { 
        error: error.message,
        messageId,
        status 
      })
      throw error
    }
  }
}

module.exports = new ContactService()
const mongoose = require('mongoose')

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Індекси для продуктивності
conversationSchema.index({ participants: 1 })
conversationSchema.index({ updatedAt: -1 })
conversationSchema.index({ 'participants': 1, 'updatedAt': -1 })

// Метод для отримання іншого учасника
conversationSchema.methods.getOtherParticipant = function(userId) {
  return this.participants.find(p => p.toString() !== userId.toString())
}

// Метод для перевірки участі користувача
conversationSchema.methods.hasParticipant = function(userId) {
  return this.participants.some(p => p.toString() === userId.toString())
}

module.exports = mongoose.model('Conversation', conversationSchema)
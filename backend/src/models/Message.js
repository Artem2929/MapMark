const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 4000
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  fileUrl: String,
  fileName: String,
  fileSize: Number
}, {
  timestamps: true
})

// Критичні індекси для продуктивності
messageSchema.index({ conversationId: 1, createdAt: -1 })
messageSchema.index({ senderId: 1, createdAt: -1 })

// Метод для перевірки прочитання
messageSchema.methods.isReadBy = function(userId) {
  return this.readBy.includes(userId)
}

module.exports = mongoose.model('Message', messageSchema)
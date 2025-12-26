const mongoose = require('mongoose')

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ім\'я є обов\'язковим'],
    trim: true,
    maxlength: [100, 'Ім\'я не може бути довшим за 100 символів']
  },
  email: {
    type: String,
    required: [true, 'Email є обов\'язковим'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Невірний формат email']
  },
  message: {
    type: String,
    required: [true, 'Повідомлення є обов\'язковим'],
    trim: true,
    maxlength: [1000, 'Повідомлення не може бути довшим за 1000 символів']
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied'],
    default: 'new'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

contactSchema.index({ createdAt: -1 })
contactSchema.index({ status: 1 })

module.exports = mongoose.model('Contact', contactSchema)
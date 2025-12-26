const mongoose = require('mongoose')

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ім\'я є обов\'язковим'],
    trim: true,
    minlength: [2, 'Ім\'я повинно містити мінімум 2 символи'],
    maxlength: [100, 'Ім\'я не може бути довшим за 100 символів'],
    match: [/^[a-zA-Zа-яА-ЯіІїЇєЄ\s'-]+$/, 'Ім\'я може містити тільки літери, пробіли, апострофи та дефіси']
  },
  email: {
    type: String,
    required: [true, 'Email є обов\'язковим'],
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Невірний формат email']
  },
  message: {
    type: String,
    required: [true, 'Повідомлення є обов\'язковим'],
    trim: true,
    minlength: [10, 'Повідомлення повинно містити мінімум 10 символів'],
    maxlength: [1000, 'Повідомлення не може бути довшим за 1000 символів']
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied'],
    default: 'new'
  },
  ip: {
    type: String,
    required: false
  }
}, {
  timestamps: true
})

contactSchema.index({ createdAt: -1 })
contactSchema.index({ status: 1 })
contactSchema.index({ email: 1 })

module.exports = mongoose.model('Contact', contactSchema)
const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  isRead: { type: Boolean, default: false },
  response: { type: String, trim: true },
  respondedAt: { type: Date },
  respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
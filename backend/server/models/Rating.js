const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  voterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vote: {
    type: Number,
    required: true,
    enum: [-1, 1] // -1 для мінуса, 1 для плюса
  }
}, {
  timestamps: true
});

// Унікальний індекс - один користувач може голосувати за іншого тільки один раз
ratingSchema.index({ userId: 1, voterId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
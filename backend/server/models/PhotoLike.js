const mongoose = require('mongoose');

const photoLikeSchema = new mongoose.Schema({
  photoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'dislike'],
    required: true
  }
}, {
  timestamps: true
});

photoLikeSchema.index({ photoId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('PhotoLike', photoLikeSchema);
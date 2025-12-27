const mongoose = require('mongoose');

const photoCommentSchema = new mongoose.Schema({
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
  text: {
    type: String,
    required: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

photoCommentSchema.index({ photoId: 1, createdAt: -1 });

module.exports = mongoose.model('PhotoComment', photoCommentSchema);
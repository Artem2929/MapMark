const mongoose = require('mongoose');

const serviceLikeSchema = new mongoose.Schema({
  serviceId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['like', 'dislike'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Унікальний індекс для запобігання дублікатів
serviceLikeSchema.index({ serviceId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('ServiceLike', serviceLikeSchema);
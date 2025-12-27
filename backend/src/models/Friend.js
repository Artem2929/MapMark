const mongoose = require('mongoose')

const friendSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
})

// Compound index to prevent duplicate friend requests
friendSchema.index({ requester: 1, recipient: 1 }, { unique: true })

// Index for efficient queries
friendSchema.index({ recipient: 1, status: 1 })
friendSchema.index({ requester: 1, status: 1 })

module.exports = mongoose.model('Friend', friendSchema)
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true
  },
  avatar: {
    type: String
  },
  bio: {
    type: String,
    maxlength: 500
  },
  city: {
    type: String
  },
  country: {
    type: String
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  followers: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  following: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  lastLogin: {
    type: Date
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
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'seller'],
    default: 'user',
    required: true
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
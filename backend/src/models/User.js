const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const config = require('../config')

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  surname: {
    type: String,
    trim: true,
    maxlength: [50, 'Surname cannot exceed 50 characters']
  },
  birthDate: {
    type: Date
  },
  position: {
    type: String,
    maxlength: [100, 'Position cannot exceed 100 characters'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function(el) {
        return el === this.password
      },
      message: 'Passwords do not match'
    }
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    enum: {
      values: ['UA'],
      message: 'Country must be UA (Ukraine)'
    }
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'seller', 'admin'],
      message: 'Role must be either user, seller, or admin'
    },
    default: 'user'
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    trim: true
  },
  location: {
    type: String,
    maxlength: [100, 'Location cannot exceed 100 characters'],
    trim: true
  },
  website: {
    type: String,
    maxlength: [100, 'Website cannot exceed 100 characters'],
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(v)
      },
      message: 'Website must be a valid URL (e.g., example.com or https://example.com)'
    }
  },
  visibility: {
    birthDate: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    position: { type: Boolean, default: true },
    location: { type: Boolean, default: true },
    website: { type: Boolean, default: true }
  },
  avatar: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true,
    select: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  passwordChangedAt: {
    type: Date
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for performance
userSchema.index({ email: 1 })
userSchema.index({ createdAt: -1 })
userSchema.index({ isActive: 1 })

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only run if password was modified
  if (!this.isModified('password')) return next()

  // Hash password with cost of 12
  this.password = await bcrypt.hash(this.password, config.BCRYPT_ROUNDS)

  // Delete passwordConfirm field
  this.passwordConfirm = undefined
  next()
})

// Pre-save middleware to set passwordChangedAt
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next()

  this.passwordChangedAt = Date.now() - 1000 // Subtract 1 second to ensure token is created after password change
  next()
})

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword)
}

// Instance method to check if password changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
    return JWTTimestamp < changedTimestamp
  }
  return false
}

// Query middleware to exclude inactive users
userSchema.pre(/^find/, function(next) {
  // this points to the current query
  this.find({ isActive: { $ne: false } })
  next()
})

// Virtual for user's full profile
userSchema.virtual('profile').get(function() {
  return {
    id: this.id,
    name: this.name,
    email: this.email,
    country: this.country,
    role: this.role,
    emailVerified: this.emailVerified,
    createdAt: this.createdAt
  }
})

// Virtual for online status (online if active within last 5 minutes)
userSchema.virtual('isOnline').get(function() {
  if (!this.lastActivity) return false
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  return this.lastActivity > fiveMinutesAgo
})

const User = mongoose.model('User', userSchema)

module.exports = User
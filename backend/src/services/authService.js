const User = require('../models/User')
const { AppError } = require('../utils/errorHandler')
const { createSendToken, verifyToken } = require('../utils/jwt')
const logger = require('../utils/logger')

class AuthService {
  async register(userData) {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email })
    
    logger.info('Registration attempt', {
      email: userData.email,
      existingUser: existingUser ? {
        id: existingUser.id,
        email: existingUser.email,
        createdAt: existingUser.createdAt
      } : null
    })
    
    if (existingUser) {
      throw new AppError('Користувач вже існує', 409, 'USER_EXISTS')
    }

    // Additional security checks
    if (!userData.name || typeof userData.name !== 'string') {
      throw new AppError('Invalid name format', 400, 'INVALID_NAME')
    }
    
    const suspiciousPatterns = /^(admin|root|test|user|null|undefined)$/i
    if (suspiciousPatterns.test(userData.name.trim())) {
      throw new AppError('Invalid name format', 400, 'INVALID_NAME')
    }

    // Generate custom user ID
    const userCount = await User.countDocuments()
    const incrementalId = userCount + 1
    const country = userData.country.toLowerCase()
    const name = userData.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    const customId = `${country}-${name}-${incrementalId}`

    // Create new user
    const newUser = await User.create({
      id: customId,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      passwordConfirm: userData.passwordConfirm || userData.password,
      country: userData.country,
      role: userData.role || 'user'
    })

    return newUser
  }

  async login(email, password) {
    // Check if email and password exist
    if (!email || !password) {
      throw new AppError('Please provide email and password!', 400, 'MISSING_CREDENTIALS')
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email, isActive: true }).select('+password')

    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new AppError('Невірні дані для входу', 401, 'INVALID_CREDENTIALS')
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save({ validateBeforeSave: false })

    // Remove password from response
    user.password = undefined

    return user
  }

  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400, 'MISSING_REFRESH_TOKEN')
    }

    try {
      // Verify refresh token
      const decoded = await verifyToken(refreshToken)
      
      if (decoded.type !== 'refresh') {
        throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN')
      }

      // Check if user still exists
      const currentUser = await User.findById(decoded.id)
      if (!currentUser) {
        throw new AppError('The user belonging to this token does no longer exist.', 401, 'USER_NOT_FOUND')
      }

      // Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        throw new AppError('User recently changed password! Please log in again.', 401, 'PASSWORD_CHANGED')
      }

      return currentUser
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN')
      }
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Refresh token expired', 401, 'TOKEN_EXPIRED')
      }
      throw error
    }
  }

  async forgotPassword(email) {
    if (!email) {
      throw new AppError('Email is required', 400, 'EMAIL_REQUIRED')
    }

    // Check if user exists
    const user = await User.findOne({ email, isActive: true })
    
    // For security reasons, always return success even if user doesn't exist
    logger.info('Password reset requested', { email, userExists: !!user })
    
    // In real app, generate reset token and send email here
    return { message: 'If this email exists, password reset instructions have been sent' }
  }

  async changePassword(userId, currentPassword, newPassword) {
    // Get user from collection
    const user = await User.findById(userId).select('+password')
    
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND')
    }

    // Check if current password is correct
    if (!(await user.correctPassword(currentPassword, user.password))) {
      throw new AppError('Your current password is incorrect.', 401, 'INCORRECT_PASSWORD')
    }

    // Update password
    user.password = newPassword
    user.passwordConfirm = newPassword
    await user.save()

    return user
  }

  async updateProfile(userId, updateData) {
    // Remove sensitive fields that shouldn't be updated via this method
    const allowedFields = ['name', 'email']
    const filteredData = {}
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field]
      }
    })

    // Check if email is being changed and if it already exists
    if (filteredData.email) {
      const existingUser = await User.findOne({ 
        email: filteredData.email, 
        _id: { $ne: userId } 
      })
      
      if (existingUser) {
        throw new AppError('Email already in use', 400, 'EMAIL_EXISTS')
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, filteredData, {
      new: true,
      runValidators: true
    })

    if (!updatedUser) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND')
    }

    return updatedUser
  }

  async getUserProfile(userId) {
    const user = await User.findById(userId)
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND')
    }
    return user
  }
}

module.exports = new AuthService()
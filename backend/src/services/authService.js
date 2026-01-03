const userRepository = require('../repositories/userRepository')
const { AppError } = require('../utils/errorHandler')
const { verifyToken } = require('../utils/jwt')
const { HTTP_STATUS, ERROR_CODES } = require('../constants/httpStatus')
const logger = require('../utils/logger')

class AuthService {
  async register(userData) {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(userData.email)
    
    logger.info('Registration attempt', {
      email: userData.email,
      existingUser: existingUser ? {
        id: existingUser.id,
        email: existingUser.email,
        createdAt: existingUser.createdAt
      } : null
    })
    
    if (existingUser) {
      throw new AppError('Користувач вже існує', HTTP_STATUS.CONFLICT, ERROR_CODES.USER_EXISTS)
    }

    if (!userData.name || typeof userData.name !== 'string') {
      throw new AppError('Invalid name format', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR)
    }
    
    const suspiciousPatterns = /^(admin|root|test|user|null|undefined)$/i
    if (suspiciousPatterns.test(userData.name.trim())) {
      throw new AppError('Invalid name format', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR)
    }

    // Generate custom user ID
    const userCount = await userRepository.countDocuments()
    const incrementalId = userCount + 1
    const country = userData.country.toLowerCase()
    const name = userData.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    const customId = `${country}-${name}-${incrementalId}`

    // Create new user
    return userRepository.create({
      id: customId,
      name: userData.name,
      surname: userData.surname,
      email: userData.email,
      password: userData.password,
      passwordConfirm: userData.passwordConfirm || userData.password,
      country: userData.country,
      role: userData.role
    })
  }

  async login(email, password) {
    if (!email || !password) {
      throw new AppError('Please provide email and password!', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR)
    }

    // Check if user exists && password is correct
    const user = await userRepository.findByEmailWithPassword(email)

    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new AppError('Невірні дані для входу', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.INVALID_CREDENTIALS)
    }

    // Update last login and activity
    user.lastLogin = new Date()
    user.lastActivity = new Date()
    await user.save({ validateBeforeSave: false })

    // Remove password from response
    user.password = undefined

    return user
  }

  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new AppError('Refresh token is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR)
    }

    try {
      // Verify refresh token
      const decoded = await verifyToken(refreshToken)
      
      if (decoded.type !== 'refresh') {
        throw new AppError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.INVALID_TOKEN)
      }

      const currentUser = await userRepository.findById(decoded.id)
      if (!currentUser) {
        throw new AppError('The user belonging to this token does no longer exist.', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.USER_NOT_FOUND)
      }

      if (currentUser.changedPasswordAfter(decoded.iat)) {
        throw new AppError('User recently changed password! Please log in again.', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.PASSWORD_CHANGED)
      }

      return currentUser
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new AppError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.INVALID_TOKEN)
      }
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Refresh token expired', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.TOKEN_EXPIRED)
      }
      throw error
    }
  }

  async forgotPassword(email) {
    if (!email) {
      throw new AppError('Email is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR)
    }

    // Check if user exists
    const user = await userRepository.findByEmail(email)
    
    // For security reasons, always return success even if user doesn't exist
    logger.info('Password reset requested', { email, userExists: !!user })
    
    // In real app, generate reset token and send email here
    return { message: 'If this email exists, password reset instructions have been sent' }
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findById(userId).select('+password')
    
    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.USER_NOT_FOUND)
    }

    if (!(await user.correctPassword(currentPassword, user.password))) {
      throw new AppError('Your current password is incorrect.', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.INVALID_CREDENTIALS)
    }

    // Update password
    user.password = newPassword
    user.passwordConfirm = newPassword
    await user.save()

    return user
  }



  async getUserProfile(userId) {
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.USER_NOT_FOUND)
    }
    return user
  }
}

module.exports = new AuthService()
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const config = require('../config')
const { AppError } = require('./errorHandler')

const signToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN
  })
}

const signRefreshToken = (id) => {
  return jwt.sign({ id, type: 'refresh' }, config.JWT_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN
  })
}

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)
  const refreshToken = signRefreshToken(user._id)
  
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict'
  }

  res.cookie('jwt', token, cookieOptions)
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  })

  // Очищені дані користувача
  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    country: user.country,
    role: user.role,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt
  }

  res.status(statusCode).json({
    status: 'success',
    token,
    refreshToken,
    data: {
      user: userData
    }
  })
}

const verifyToken = async (token) => {
  try {
    const decoded = await promisify(jwt.verify)(token, config.JWT_SECRET)
    return decoded
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token expired', 401, 'TOKEN_EXPIRED')
    }
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token', 401, 'INVALID_TOKEN')
    }
    throw error
  }
}

const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.split(' ')[1]
}

module.exports = {
  signToken,
  signRefreshToken,
  createSendToken,
  verifyToken,
  extractTokenFromHeader
}
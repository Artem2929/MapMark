const authService = require('../services/authService')
const { createSendToken } = require('../utils/jwt')
const { catchAsync } = require('../utils/errorHandler')
const { success, created } = require('../utils/response')
const logger = require('../utils/logger')

const register = catchAsync(async (req, res, next) => {
  const newUser = await authService.register(req.body)
  
  logger.info('User registered successfully', {
    userId: newUser._id,
    email: newUser.email,
    country: newUser.country,
    role: newUser.role
  })
  
  createSendToken(newUser, 201, res)
})

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body
  const user = await authService.login(email, password)
  
  logger.info('User logged in successfully', {
    userId: user._id,
    email: user.email,
    lastLogin: user.lastLogin
  })
  
  createSendToken(user, 200, res)
})

const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body
  const user = await authService.refreshToken(refreshToken)
  
  logger.info('Token refreshed successfully', {
    userId: user._id,
    email: user.email
  })
  
  createSendToken(user, 200, res)
})

const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body
  const result = await authService.forgotPassword(email)
  
  success(res, null, result.message)
})

const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  })
  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  })
  
  logger.info('User logged out', {
    userId: req.user?.id,
    email: req.user?.email
  })
  
  success(res, null, 'Logged out successfully')
}

const getMe = catchAsync(async (req, res, next) => {
  const user = await authService.getUserProfile(req.user.id)
  
  const userData = {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    name: user.name,
    surname: user.surname,
    avatar: user.avatar,
    bio: user.bio,
    location: user.location,
    country: user.country,
    role: user.role,
    emailVerified: user.emailVerified,
    stats: user.stats,
    meta: user.meta
  }
  
  success(res, { user: userData }, 'Profile retrieved successfully')
})

module.exports = {
  register,
  login,
  refreshToken,
  forgotPassword,
  logout,
  getMe
}
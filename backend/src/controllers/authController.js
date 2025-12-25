const authService = require('../services/authService')
const { createSendToken } = require('../utils/jwt')
const { catchAsync } = require('../utils/errorHandler')

const register = catchAsync(async (req, res, next) => {
  const newUser = await authService.register(req.body)
  createSendToken(newUser, 201, res)
})

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body
  const user = await authService.login(email, password)
  createSendToken(user, 200, res)
})

const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body
  const user = await authService.refreshToken(refreshToken)
  createSendToken(user, 200, res)
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
  res.status(200).json({ status: 'success' })
}

const getMe = catchAsync(async (req, res, next) => {
  const user = await authService.getUserProfile(req.user.id)
  res.status(200).json({
    status: 'success',
    data: { user }
  })
})

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe
}
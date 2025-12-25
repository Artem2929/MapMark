const express = require('express')
const authController = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const { authLimiter } = require('../middleware/security')
const { registerValidation, loginValidation } = require('../validators/authValidators')
const rateLimit = require('express-rate-limit')

const router = express.Router()

// Stricter rate limiting for auth endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    status: 'error',
    message: 'Too many login attempts, try again later',
    code: 'LOGIN_RATE_LIMIT'
  },
  standardHeaders: true,
  legacyHeaders: false
})

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 registrations per hour
  message: {
    status: 'error',
    message: 'Too many registration attempts, try again later',
    code: 'REGISTER_RATE_LIMIT'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Public routes
router.post('/register', registerLimiter, registerValidation, authController.register)
router.post('/login', loginLimiter, loginValidation, authController.login)
router.post('/refresh-token', authLimiter, authController.refreshToken)
router.post('/forgot-password', authLimiter, authController.forgotPassword)

// Protected routes
router.use(protect) // All routes after this middleware are protected

router.post('/logout', authController.logout)
router.get('/me', authController.getMe)

module.exports = router
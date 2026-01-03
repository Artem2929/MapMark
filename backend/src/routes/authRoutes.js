const express = require('express')
const authController = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const { authLimiter, strictLimiter } = require('../middleware/rateLimiter')
const { csrfProtection, generateCSRFToken } = require('../middleware/csrf')
const { registerValidation, loginValidation } = require('../validators/authValidators')

const router = express.Router()

// CSRF token endpoint
router.get('/csrf-token', generateCSRFToken)

// Public routes with rate limiting (without CSRF)
router.post('/register', strictLimiter, registerValidation, authController.register)
router.post('/login', authLimiter, loginValidation, authController.login)
router.post('/refresh-token', authLimiter, authController.refreshToken)
router.post('/forgot-password', strictLimiter, authController.forgotPassword)

// Protected routes
router.use(protect) // All routes after this middleware are protected

router.post('/logout', authController.logout)
router.get('/me', authController.getMe)

module.exports = router

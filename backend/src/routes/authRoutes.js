const express = require('express')
const authController = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const { authLimiter } = require('../middleware/security')
const { registerValidation, loginValidation } = require('../validators/authValidators')

const router = express.Router()

// Apply auth rate limiting to all routes
router.use(authLimiter)

// Public routes
router.post('/register', registerValidation, authController.register)
router.post('/login', loginValidation, authController.login)
router.post('/refresh-token', authController.refreshToken)

// Protected routes
router.use(protect) // All routes after this middleware are protected

router.post('/logout', authController.logout)
router.get('/me', authController.getMe)

module.exports = router
const express = require('express')
const userController = require('../controllers/userController')
const { protect } = require('../middleware/auth')
const { csrfProtection } = require('../middleware/csrf')
const { uploadAvatar } = require('../middleware/upload')
const { userValidation } = require('../validators/userValidators')

const router = express.Router()

// All user routes require authentication
router.use(protect)

// Search users
router.get('/search', userController.searchUsers)

// Get user profile
router.get('/:userId', userController.getUserProfile)

// Update user profile
router.put('/:userId', csrfProtection, ...userValidation, userController.updateProfile)

// Upload avatar
router.post('/avatar', csrfProtection, uploadAvatar, userController.uploadAvatar)

module.exports = router
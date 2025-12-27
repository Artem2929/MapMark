const express = require('express')
const followsController = require('../controllers/followsController')
const { protect } = require('../middleware/auth')
const { csrfProtection } = require('../middleware/csrf')

const router = express.Router()

// All follows routes require authentication
router.use(protect)

// POST /api/v1/follows - Follow user
router.post('/', csrfProtection, followsController.followUser)

// DELETE /api/v1/follows/:userId - Unfollow user
router.delete('/:userId', csrfProtection, followsController.unfollowUser)

// GET /api/v1/follows/:userId/followers - Get user's followers
router.get('/:userId/followers', followsController.getFollowers)

// GET /api/v1/follows/:userId/following - Get user's following
router.get('/:userId/following', followsController.getFollowing)

// GET /api/v1/follows/:userId/stats - Get user's follow stats
router.get('/:userId/stats', followsController.getUserStats)

// GET /api/v1/follows/:userId/check - Check if following user
router.get('/:userId/check', followsController.checkFollowing)

module.exports = router
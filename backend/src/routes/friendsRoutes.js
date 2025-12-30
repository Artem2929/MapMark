const express = require('express')
const friendsController = require('../controllers/friendsController')
const { protect } = require('../middleware/auth')
const { csrfProtection } = require('../middleware/csrf')

const router = express.Router()

// All friends routes require authentication
router.use(protect)

// GET /api/v1/friends/:userId - Get user's friends
router.get('/:userId', friendsController.getFriends)

// GET /api/v1/friends/:userId/requests - Get friend requests for user
router.get('/:userId/requests', friendsController.getFriendRequests)

// POST /api/v1/friends/request - Send friend request
router.post('/request', csrfProtection, friendsController.sendFriendRequest)

// POST /api/v1/friends/request/cancel - Cancel friend request
router.post('/request/cancel', csrfProtection, friendsController.cancelFriendRequest)

// POST /api/v1/friends/request/:requestId/accept - Accept friend request
router.post('/request/:requestId/accept', csrfProtection, friendsController.acceptFriendRequest)

// POST /api/v1/friends/request/:requestId/reject - Reject friend request
router.post('/request/:requestId/reject', csrfProtection, friendsController.rejectFriendRequest)

// DELETE /api/v1/friends/:userId - Remove friend
router.delete('/:userId', csrfProtection, friendsController.removeFriend)

// POST /api/v1/friends/follower/remove - Remove follower
router.post('/follower/remove', csrfProtection, friendsController.removeFollower)

module.exports = router
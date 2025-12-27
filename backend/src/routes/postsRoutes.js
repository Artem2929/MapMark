const express = require('express')
const postsController = require('../controllers/postsController')
const { protect } = require('../middleware/auth')
const { csrfProtection } = require('../middleware/csrf')

const router = express.Router()

// All posts routes require authentication
router.use(protect)

// GET /api/v1/posts/user/:userId - Get user's posts
router.get('/user/:userId', postsController.getUserPosts)

// POST /api/v1/posts - Create new post
router.post('/', csrfProtection, postsController.createPost)

// POST /api/v1/posts/:postId/like - Like/unlike post
router.post('/:postId/like', csrfProtection, postsController.likePost)

// POST /api/v1/posts/:postId/comment - Add comment to post
router.post('/:postId/comment', csrfProtection, postsController.addComment)

// DELETE /api/v1/posts/:postId - Delete post
router.delete('/:postId', csrfProtection, postsController.deletePost)

module.exports = router
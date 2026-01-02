const express = require('express')
const postsController = require('../controllers/postsController')
const { protect } = require('../middleware/auth')
const { csrfProtection } = require('../middleware/csrf')
const { upload } = require('../middleware/upload')

const router = express.Router()

// All posts routes require authentication
router.use(protect)

// GET /api/v1/posts/user/:userId - Get user's posts
router.get('/user/:userId', postsController.getUserPosts)

// POST /api/v1/posts - Create new post (with optional images)
router.post('/', csrfProtection, upload.array('images', 4), postsController.createPost)

// POST /api/v1/posts/:postId/like - Like/unlike post
router.post('/:postId/like', csrfProtection, postsController.likePost)

// POST /api/v1/posts/:postId/dislike - Dislike/undislike post
router.post('/:postId/dislike', csrfProtection, postsController.dislikePost)

// POST /api/v1/posts/:postId/comment - Add comment to post
router.post('/:postId/comment', csrfProtection, postsController.addComment)

// PUT /api/v1/posts/:postId - Update post
router.put('/:postId', csrfProtection, postsController.updatePost)

// PUT /api/v1/posts/:postId/comment/:commentId - Update comment
router.put('/:postId/comment/:commentId', csrfProtection, postsController.updateComment)

// DELETE /api/v1/posts/:postId/comment/:commentId - Delete comment
router.delete('/:postId/comment/:commentId', csrfProtection, postsController.deleteComment)

// POST /api/v1/posts/:postId/comment/:commentId/like - Like/unlike comment
router.post('/:postId/comment/:commentId/like', csrfProtection, postsController.likeComment)

// POST /api/v1/posts/:postId/comment/:commentId/dislike - Dislike/undislike comment
router.post('/:postId/comment/:commentId/dislike', csrfProtection, postsController.dislikeComment)

// DELETE /api/v1/posts/:postId - Delete post
router.delete('/:postId', csrfProtection, postsController.deletePost)

module.exports = router
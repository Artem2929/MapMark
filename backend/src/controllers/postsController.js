const postsService = require('../services/postsService')
const { success } = require('../utils/response')
const { catchAsync } = require('../utils/errorHandler')
const logger = require('../utils/logger')

const postsController = {
  getUserPosts: catchAsync(async (req, res) => {
    const { userId } = req.params
    const { page = 1, limit = 10 } = req.query
    
    const result = await postsService.getUserPosts(userId, parseInt(page), parseInt(limit))
    
    success(res, result, 'Пости користувача отримано')
  }),

  createPost: catchAsync(async (req, res) => {
    const authorId = req.user.id
    const { content } = req.body
    const images = req.files ? req.files.map(file => {
      const base64 = file.buffer.toString('base64')
      return `data:${file.mimetype};base64,${base64}`
    }) : []
    
    const post = await postsService.createPost(authorId, content?.trim() || '', images)
    
    success(res, post, 'Пост створено', 201)
  }),

  likePost: catchAsync(async (req, res) => {
    const { postId } = req.params
    const userId = req.user.id
    
    const result = await postsService.likePost(postId, userId)
    
    success(res, result, result.liked ? 'Пост вподобано' : 'Вподобання знято')
  }),

  dislikePost: catchAsync(async (req, res) => {
    const { postId } = req.params
    const userId = req.user.id
    
    const result = await postsService.dislikePost(postId, userId)
    
    success(res, result, result.disliked ? 'Дізлайк поставлено' : 'Дізлайк знято')
  }),

  addComment: catchAsync(async (req, res) => {
    const { postId } = req.params
    const userId = req.user.id
    const { content } = req.body
    
    const comment = await postsService.addComment(postId, userId, content)
    
    success(res, comment, 'Коментар додано', 201)
  }),

  updatePost: catchAsync(async (req, res) => {
    const { postId } = req.params
    const userId = req.user.id
    const { content, removedImages } = req.body
    const newImages = req.files ? req.files.map(file => {
      const base64 = file.buffer.toString('base64')
      return `data:${file.mimetype};base64,${base64}`
    }) : []
    
    const trimmedContent = content ? content.trim() : ''
    const parsedRemovedImages = removedImages ? JSON.parse(removedImages) : []
    
    const post = await postsService.updatePost(postId, userId, trimmedContent, newImages, parsedRemovedImages)
    
    success(res, post, 'Пост оновлено')
  }),

  updateComment: catchAsync(async (req, res) => {
    const { postId, commentId } = req.params
    const userId = req.user.id
    const { content } = req.body
    
    const comment = await postsService.updateComment(postId, commentId, userId, content)
    
    success(res, comment, 'Коментар оновлено')
  }),

  deleteComment: catchAsync(async (req, res) => {
    const { postId, commentId } = req.params
    const userId = req.user.id
    
    await postsService.deleteComment(postId, commentId, userId)
    
    success(res, null, 'Коментар видалено')
  }),

  likeComment: catchAsync(async (req, res) => {
    const { postId, commentId } = req.params
    const userId = req.user.id
    
    const result = await postsService.likeComment(postId, commentId, userId)
    
    success(res, result, result.liked ? 'Коментар вподобано' : 'Вподобання знято')
  }),

  dislikeComment: catchAsync(async (req, res) => {
    const { postId, commentId } = req.params
    const userId = req.user.id
    
    const result = await postsService.dislikeComment(postId, commentId, userId)
    
    success(res, result, result.disliked ? 'Дізлайк поставлено' : 'Дізлайк знято')
  }),

  deletePost: catchAsync(async (req, res) => {
    const { postId } = req.params
    const userId = req.user.id
    
    await postsService.deletePost(postId, userId)
    
    success(res, null, 'Пост видалено')
  })
}

module.exports = postsController
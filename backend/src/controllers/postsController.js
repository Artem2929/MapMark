const postsService = require('../services/postsService')
const { success } = require('../utils/response')
const logger = require('../utils/logger')

const postsController = {
  async getUserPosts(req, res) {
    try {
      const { userId } = req.params
      const { page = 1, limit = 10 } = req.query
      
      const result = await postsService.getUserPosts(userId, parseInt(page), parseInt(limit))
      
      success(res, result, 'Пости користувача отримано')
    } catch (error) {
      logger.error('Get user posts error', { error: error.message, userId: req.params.userId })
      return res.status(500).json({
        status: 'error',
        message: error.message
      })
    }
  },

  async createPost(req, res) {
    try {
      const authorId = req.user.id
      const { content, images = [] } = req.body
      
      if (!content || !content.trim()) {
        return res.status(400).json({
          status: 'fail',
          message: 'Контент поста обов\'язковий'
        })
      }
      
      const post = await postsService.createPost(authorId, content, images)
      
      success(res, post, 'Пост створено', 201)
    } catch (error) {
      logger.error('Create post error', { error: error.message, authorId: req.user.id })
      
      if (error.message.includes('не знайдено')) {
        return res.status(404).json({
          status: 'fail',
          message: error.message
        })
      }
      
      return res.status(500).json({
        status: 'error',
        message: error.message
      })
    }
  },

  async likePost(req, res) {
    try {
      const { postId } = req.params
      const userId = req.user.id
      
      const result = await postsService.likePost(postId, userId)
      
      success(res, result, result.liked ? 'Пост вподобано' : 'Вподобання знято')
    } catch (error) {
      logger.error('Like post error', { error: error.message, postId: req.params.postId })
      
      if (error.message.includes('не знайдено')) {
        return res.status(404).json({
          status: 'fail',
          message: error.message
        })
      }
      
      return res.status(500).json({
        status: 'error',
        message: error.message
      })
    }
  },

  async addComment(req, res) {
    try {
      const { postId } = req.params
      const userId = req.user.id
      const { content } = req.body
      
      if (!content || !content.trim()) {
        return res.status(400).json({
          status: 'fail',
          message: 'Контент коментаря обов\'язковий'
        })
      }
      
      const comment = await postsService.addComment(postId, userId, content)
      
      success(res, comment, 'Коментар додано', 201)
    } catch (error) {
      logger.error('Add comment error', { error: error.message, postId: req.params.postId })
      
      if (error.message.includes('не знайдено')) {
        return res.status(404).json({
          status: 'fail',
          message: error.message
        })
      }
      
      return res.status(500).json({
        status: 'error',
        message: error.message
      })
    }
  },

  async deletePost(req, res) {
    try {
      const { postId } = req.params
      const userId = req.user.id
      
      await postsService.deletePost(postId, userId)
      
      success(res, null, 'Пост видалено')
    } catch (error) {
      logger.error('Delete post error', { error: error.message, postId: req.params.postId })
      
      if (error.message.includes('не знайдено') || error.message.includes('не маєте прав')) {
        return res.status(404).json({
          status: 'fail',
          message: error.message
        })
      }
      
      return res.status(500).json({
        status: 'error',
        message: error.message
      })
    }
  }
}

module.exports = postsController
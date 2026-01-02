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
      const { content } = req.body
      const images = req.files ? req.files.map(file => {
        const base64 = file.buffer.toString('base64')
        return `data:${file.mimetype};base64,${base64}`
      }) : []
      
      // Validate content
      if (!content || typeof content !== 'string') {
        return res.status(400).json({
          status: 'fail',
          message: 'Контент поста обов\'язковий'
        })
      }
      
      const trimmedContent = content.trim()
      
      if (!trimmedContent && images.length === 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Пост повинен містити текст або фото'
        })
      }
      
      if (trimmedContent.length > 2000) {
        return res.status(400).json({
          status: 'fail',
          message: 'Максимальна довжина тексту 2000 символів'
        })
      }
      
      const post = await postsService.createPost(authorId, trimmedContent, images)
      
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

  async dislikePost(req, res) {
    try {
      const { postId } = req.params
      const userId = req.user.id
      
      const result = await postsService.dislikePost(postId, userId)
      
      success(res, result, result.disliked ? 'Дізлайк поставлено' : 'Дізлайк знято')
    } catch (error) {
      logger.error('Dislike post error', { error: error.message, postId: req.params.postId })
      
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

  async updatePost(req, res) {
    try {
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
    } catch (error) {
      logger.error('Update post error', { error: error.message, postId: req.params.postId })
      
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
  },

  async updateComment(req, res) {
    try {
      const { postId, commentId } = req.params
      const userId = req.user.id
      const { content } = req.body
      
      if (!content || !content.trim()) {
        return res.status(400).json({
          status: 'fail',
          message: 'Контент коментаря обов\'язковий'
        })
      }
      
      if (content.trim().length > 500) {
        return res.status(400).json({
          status: 'fail',
          message: 'Максимальна довжина коментаря 500 символів'
        })
      }
      
      const comment = await postsService.updateComment(postId, commentId, userId, content)
      
      success(res, comment, 'Коментар оновлено')
    } catch (error) {
      logger.error('Update comment error', { error: error.message, postId: req.params.postId, commentId: req.params.commentId })
      
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
  },

  async deleteComment(req, res) {
    try {
      const { postId, commentId } = req.params
      const userId = req.user.id
      
      await postsService.deleteComment(postId, commentId, userId)
      
      success(res, null, 'Коментар видалено')
    } catch (error) {
      logger.error('Delete comment error', { error: error.message, postId: req.params.postId, commentId: req.params.commentId })
      
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
  },

  async likeComment(req, res) {
    try {
      const { postId, commentId } = req.params
      const userId = req.user.id
      
      const result = await postsService.likeComment(postId, commentId, userId)
      
      success(res, result, result.liked ? 'Коментар вподобано' : 'Вподобання знято')
    } catch (error) {
      logger.error('Like comment error', { error: error.message, postId: req.params.postId, commentId: req.params.commentId })
      
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

  async dislikeComment(req, res) {
    try {
      const { postId, commentId } = req.params
      const userId = req.user.id
      
      const result = await postsService.dislikeComment(postId, commentId, userId)
      
      success(res, result, result.disliked ? 'Дізлайк поставлено' : 'Дізлайк знято')
    } catch (error) {
      logger.error('Dislike comment error', { error: error.message, postId: req.params.postId, commentId: req.params.commentId })
      
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
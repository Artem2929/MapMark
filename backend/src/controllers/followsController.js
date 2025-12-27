const followsService = require('../services/followsService')
const { success } = require('../utils/response')
const logger = require('../utils/logger')

const followsController = {
  async followUser(req, res) {
    try {
      const followerId = req.user.id
      const { userId } = req.body
      
      await followsService.followUser(followerId, userId)
      
      success(res, null, 'Підписка оформлена', 201)
    } catch (error) {
      logger.error('Follow user error', { error: error.message, followerId: req.user.id })
      
      if (error.message.includes('не знайдено') || error.message.includes('підписані') || error.message.includes('самого себе')) {
        return res.status(400).json({
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

  async unfollowUser(req, res) {
    try {
      const followerId = req.user.id
      const { userId } = req.params
      
      await followsService.unfollowUser(followerId, userId)
      
      success(res, null, 'Підписка скасована')
    } catch (error) {
      logger.error('Unfollow user error', { error: error.message, followerId: req.user.id })
      
      if (error.message.includes('не знайдено') || error.message.includes('не підписані')) {
        return res.status(400).json({
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

  async getFollowers(req, res) {
    try {
      const { userId } = req.params
      const { page = 1, limit = 20 } = req.query
      
      const result = await followsService.getFollowers(userId, parseInt(page), parseInt(limit))
      
      success(res, result, 'Підписники отримано')
    } catch (error) {
      logger.error('Get followers error', { error: error.message, userId: req.params.userId })
      return res.status(500).json({
        status: 'error',
        message: error.message
      })
    }
  },

  async getFollowing(req, res) {
    try {
      const { userId } = req.params
      const { page = 1, limit = 20 } = req.query
      
      const result = await followsService.getFollowing(userId, parseInt(page), parseInt(limit))
      
      success(res, result, 'Підписки отримано')
    } catch (error) {
      logger.error('Get following error', { error: error.message, userId: req.params.userId })
      return res.status(500).json({
        status: 'error',
        message: error.message
      })
    }
  },

  async getUserStats(req, res) {
    try {
      const { userId } = req.params
      
      const stats = await followsService.getUserStats(userId)
      
      success(res, stats, 'Статистика користувача отримана')
    } catch (error) {
      logger.error('Get user stats error', { error: error.message, userId: req.params.userId })
      return res.status(500).json({
        status: 'error',
        message: error.message
      })
    }
  },

  async checkFollowing(req, res) {
    try {
      const followerId = req.user.id
      const { userId } = req.params
      
      const isFollowing = await followsService.isFollowing(followerId, userId)
      
      success(res, { isFollowing }, 'Статус підписки перевірено')
    } catch (error) {
      logger.error('Check following error', { error: error.message, followerId: req.user.id })
      return res.status(500).json({
        status: 'error',
        message: error.message
      })
    }
  }
}

module.exports = followsController
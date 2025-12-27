const friendsService = require('../services/friendsService')
const { success } = require('../utils/response')
const logger = require('../utils/logger')

const friendsController = {
  async getFriends(req, res) {
    try {
      const { userId } = req.params
      const friends = await friendsService.getFriends(userId)
      
      success(res, friends, 'Список друзів отримано')
    } catch (error) {
      logger.error('Get friends error', { error: error.message, userId: req.params.userId })
      return res.status(500).json({
        status: 'error',
        message: error.message
      })
    }
  },

  async getFriendRequests(req, res) {
    try {
      const { userId } = req.params
      const requests = await friendsService.getFriendRequests(userId)
      
      success(res, requests, 'Заявки в друзі отримано')
    } catch (error) {
      logger.error('Get friend requests error', { error: error.message, userId: req.params.userId })
      return res.status(500).json({
        status: 'error',
        message: error.message
      })
    }
  },

  async sendFriendRequest(req, res) {
    try {
      const { userId } = req.body
      const requesterId = req.user.id
      
      await friendsService.sendFriendRequest(requesterId, userId)
      
      success(res, null, 'Заявку в друзі надіслано', 201)
    } catch (error) {
      logger.error('Send friend request error', { error: error.message, requesterId: req.user.id })
      
      if (error.message.includes('не знайдено') || error.message.includes('вже друзі') || error.message.includes('надіслана')) {
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

  async acceptFriendRequest(req, res) {
    try {
      const { requestId } = req.params
      const userId = req.user.id
      
      await friendsService.acceptFriendRequest(requestId, userId)
      
      success(res, null, 'Заявку прийнято')
    } catch (error) {
      logger.error('Accept friend request error', { error: error.message, requestId: req.params.requestId })
      
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

  async rejectFriendRequest(req, res) {
    try {
      const { requestId } = req.params
      const userId = req.user.id
      
      await friendsService.rejectFriendRequest(requestId, userId)
      
      success(res, null, 'Заявку відхилено')
    } catch (error) {
      logger.error('Reject friend request error', { error: error.message, requestId: req.params.requestId })
      
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

  async removeFriend(req, res) {
    try {
      const { userId: friendId } = req.params
      const userId = req.user.id
      
      await friendsService.removeFriend(userId, friendId)
      
      success(res, null, 'Друга видалено')
    } catch (error) {
      logger.error('Remove friend error', { error: error.message, friendId: req.params.userId })
      
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
  }
}

module.exports = friendsController
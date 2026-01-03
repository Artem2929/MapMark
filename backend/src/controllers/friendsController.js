const friendsService = require('../services/friendsService')
const { success } = require('../utils/response')
const { catchAsync } = require('../utils/errorHandler')
const logger = require('../utils/logger')

const friendsController = {
  getMyFriends: catchAsync(async (req, res) => {
    const userId = req.user.id
    const friends = await friendsService.getFriends(userId)
    
    success(res, friends, 'Список друзів отримано')
  }),

  getFriends: catchAsync(async (req, res) => {
    const { userId } = req.params
    const friends = await friendsService.getFriends(userId)
    
    success(res, friends, 'Список друзів отримано')
  }),

  getFriendRequests: catchAsync(async (req, res) => {
    const { userId } = req.params
    const requests = await friendsService.getFriendRequests(userId)
    
    success(res, requests, 'Заявки в друзі отримано')
  }),

  sendFriendRequest: catchAsync(async (req, res) => {
    const { userId } = req.body
    const requesterId = req.user.id
    
    await friendsService.sendFriendRequest(requesterId, userId)
    
    success(res, null, 'Заявку в друзі надіслано', 201)
  }),

  acceptFriendRequest: catchAsync(async (req, res) => {
    const { requestId } = req.params
    const userId = req.user.id
    
    await friendsService.acceptFriendRequest(requestId, userId)
    
    success(res, null, 'Заявку прийнято')
  }),

  rejectFriendRequest: catchAsync(async (req, res) => {
    const { requestId } = req.params
    const userId = req.user.id
    
    await friendsService.rejectFriendRequest(requestId, userId)
    
    success(res, null, 'Заявку відхилено')
  }),

  cancelFriendRequest: catchAsync(async (req, res) => {
    const { userId } = req.body
    const requesterId = req.user.id
    
    await friendsService.cancelFriendRequest(requesterId, userId)
    
    success(res, null, 'Заявку скасовано')
  }),

  removeFriend: catchAsync(async (req, res) => {
    const { userId: friendId } = req.params
    const userId = req.user.id
    
    await friendsService.removeFriend(userId, friendId)
    
    success(res, null, 'Друга видалено')
  }),

  removeFollower: catchAsync(async (req, res) => {
    const { userId: followerId } = req.body
    const userId = req.user.id
    
    await friendsService.removeFollower(userId, followerId)
    
    success(res, null, 'Підписника видалено')
  })
}

module.exports = friendsController
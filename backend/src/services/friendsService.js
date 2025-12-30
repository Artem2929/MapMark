const Friend = require('../models/Friend')
const User = require('../models/User')
const logger = require('../utils/logger')

class FriendsService {
  async getUserObjectId(userId) {
    let user = await User.findOne({ id: userId })
    if (!user && userId.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(userId)
    }
    return user ? user._id : null
  }

  async getFriends(userId) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) return []

    const friends = await Friend.find({
      $or: [
        { requester: userObjectId, status: 'accepted' },
        { recipient: userObjectId, status: 'accepted' }
      ]
    })
    .populate('requester', 'id name email country')
    .populate('recipient', 'id name email country')

    return friends.map(friend => {
      const friendUser = friend.requester._id.toString() === userObjectId.toString() 
        ? friend.recipient 
        : friend.requester
      return {
        id: friendUser.id || friendUser._id,
        name: friendUser.name,
        email: friendUser.email,
        country: friendUser.country,
        friendshipId: friend._id
      }
    })
  }

  async getFriendRequests(userId) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) return []

    const requests = await Friend.find({
      recipient: userObjectId,
      status: 'pending'
    }).populate('requester', 'id name email country avatar')

    return requests.map(request => ({
      id: request._id,
      requester: {
        id: request.requester.id || request.requester._id,
        name: request.requester.name,
        email: request.requester.email,
        country: request.requester.country,
        avatar: request.requester.avatar
      },
      createdAt: request.createdAt
    }))
  }

  async sendFriendRequest(requesterId, recipientId) {
    const requesterObjectId = await this.getUserObjectId(requesterId)
    const recipientObjectId = await this.getUserObjectId(recipientId)
    
    if (!requesterObjectId || !recipientObjectId) {
      throw new Error('Користувача не знайдено')
    }
    
    if (requesterObjectId.toString() === recipientObjectId.toString()) {
      throw new Error('Не можна надіслати заявку самому собі')
    }

    // Перевіряємо чи вже друзі
    const existingFriendship = await Friend.findOne({
      $or: [
        { requester: requesterObjectId, recipient: recipientObjectId, status: 'accepted' },
        { requester: recipientObjectId, recipient: requesterObjectId, status: 'accepted' }
      ]
    })

    if (existingFriendship) {
      throw new Error('Ви вже друзі')
    }

    // Перевіряємо чи вже є заявка від цього користувача
    const existingRequest = await Friend.findOne({
      requester: requesterObjectId,
      recipient: recipientObjectId,
      status: 'pending'
    })

    if (existingRequest) {
      throw new Error('Заявка вже надіслана')
    }

    // Перевіряємо чи є зворотна заявка (тоді автоматично приймаємо)
    const reverseRequest = await Friend.findOne({
      requester: recipientObjectId,
      recipient: requesterObjectId,
      status: 'pending'
    })

    if (reverseRequest) {
      // Автоматично приймаємо зворотну заявку
      reverseRequest.status = 'accepted'
      await reverseRequest.save()
      logger.info('Mutual friend request accepted', { requesterId, recipientId })
      return reverseRequest
    }

    const friendRequest = new Friend({
      requester: requesterObjectId,
      recipient: recipientObjectId
    })

    await friendRequest.save()
    logger.info('Friend request sent', { requesterId, recipientId })
    
    return friendRequest
  }

  async acceptFriendRequest(requestId, userId) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) {
      throw new Error('Користувача не знайдено')
    }

    logger.info('Accepting friend request', { requestId, userId, userObjectId }) // Debug

    const request = await Friend.findOne({
      _id: requestId,
      recipient: userObjectId,
      status: 'pending'
    })

    logger.info('Found request', { request }) // Debug

    if (!request) {
      throw new Error('Заявку не знайдено')
    }

    request.status = 'accepted'
    await request.save()
    
    logger.info('Friend request accepted', { requestId, userId })
    return request
  }

  async rejectFriendRequest(requestId, userId) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) {
      throw new Error('Користувача не знайдено')
    }

    const request = await Friend.findOne({
      _id: requestId,
      recipient: userObjectId,
      status: 'pending'
    })

    if (!request) {
      throw new Error('Заявку не знайдено')
    }

    await Friend.deleteOne({ _id: requestId })
    logger.info('Friend request rejected', { requestId, userId })
  }

  async removeFriend(userId, friendId) {
    const userObjectId = await this.getUserObjectId(userId)
    const friendObjectId = await this.getUserObjectId(friendId)
    
    if (!userObjectId || !friendObjectId) {
      throw new Error('Користувача не знайдено')
    }

    const friendship = await Friend.findOne({
      $or: [
        { requester: userObjectId, recipient: friendObjectId, status: 'accepted' },
        { requester: friendObjectId, recipient: userObjectId, status: 'accepted' }
      ]
    })

    if (!friendship) {
      throw new Error('Дружбу не знайдено')
    }

    await Friend.deleteOne({ _id: friendship._id })
    logger.info('Friendship removed', { userId, friendId })
  }

  async cancelFriendRequest(requesterId, recipientId) {
    const requesterObjectId = await this.getUserObjectId(requesterId)
    const recipientObjectId = await this.getUserObjectId(recipientId)
    
    if (!requesterObjectId || !recipientObjectId) {
      throw new Error('Користувача не знайдено')
    }

    const request = await Friend.findOne({
      requester: requesterObjectId,
      recipient: recipientObjectId,
      status: 'pending'
    })

    if (!request) {
      throw new Error('Заявку не знайдено')
    }

    await Friend.deleteOne({ _id: request._id })
    logger.info('Friend request cancelled', { requesterId, recipientId })
  }

  async removeFollower(userId, followerId) {
    const userObjectId = await this.getUserObjectId(userId)
    const followerObjectId = await this.getUserObjectId(followerId)
    
    if (!userObjectId || !followerObjectId) {
      throw new Error('Користувача не знайдено')
    }

    // Шукаємо заявку, де follower підписаний на user
    const request = await Friend.findOne({
      requester: followerObjectId,
      recipient: userObjectId,
      status: 'pending'
    })

    if (!request) {
      throw new Error('Підписку не знайдено')
    }

    await Friend.deleteOne({ _id: request._id })
    logger.info('Follower removed', { userId, followerId })
  }
}

module.exports = new FriendsService()
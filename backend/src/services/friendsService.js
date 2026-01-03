const friendRepository = require('../repositories/friendRepository')
const userRepository = require('../repositories/userRepository')
const { AppError } = require('../utils/errorHandler')
const logger = require('../utils/logger')

class FriendsService {
  async getUserObjectId(userId) {
    const user = await userRepository.findByIdOrCustomId(userId)
    return user ? user._id : null
  }

  async getFriends(userId) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) return []

    const friends = await friendRepository.findFriends(userObjectId)

    return friends.map(friend => {
      const friendUser = friend.requester._id.toString() === userObjectId.toString() 
        ? friend.recipient 
        : friend.requester
      return {
        id: friendUser.id || friendUser._id,
        name: friendUser.name,
        email: friendUser.email,
        country: friendUser.country,
        avatar: friendUser.avatar,
        friendshipId: friend._id
      }
    })
  }

  async getFriendRequests(userId) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) return []

    const requests = await friendRepository.findPendingRequests(userObjectId)

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
      throw new AppError('Користувача не знайдено', 404)
    }
    
    if (requesterObjectId.toString() === recipientObjectId.toString()) {
      throw new AppError('Не можна надіслати заявку самому собі', 400)
    }

    const existingFriendship = await friendRepository.findFriendship(requesterObjectId, recipientObjectId)

    if (existingFriendship) {
      throw new AppError('Ви вже друзі', 400)
    }

    const existingRequest = await friendRepository.findRequest(requesterObjectId, recipientObjectId)

    if (existingRequest) {
      throw new AppError('Заявка вже надіслана', 400)
    }

    const reverseRequest = await friendRepository.findRequest(recipientObjectId, requesterObjectId)

    if (reverseRequest) {
      reverseRequest.status = 'accepted'
      await reverseRequest.save()
      logger.info('Mutual friend request accepted', { requesterId, recipientId })
      return reverseRequest
    }

    return friendRepository.create({
      requester: requesterObjectId,
      recipient: recipientObjectId
    })
  }

  async acceptFriendRequest(requestId, userId) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) {
      throw new AppError('Користувача не знайдено', 404)
    }

    const request = await friendRepository.findByIdAndRecipient(requestId, userObjectId)

    if (!request) {
      throw new AppError('Заявку не знайдено', 404)
    }

    request.status = 'accepted'
    await request.save()
    
    logger.info('Friend request accepted', { requestId, userId })
    return request
  }

  async rejectFriendRequest(requestId, userId) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) {
      throw new AppError('Користувача не знайдено', 404)
    }

    const request = await friendRepository.findByIdAndRecipient(requestId, userObjectId)

    if (!request) {
      throw new AppError('Заявку не знайдено', 404)
    }

    await friendRepository.deleteById(requestId)
    logger.info('Friend request rejected', { requestId, userId })
  }

  async removeFriend(userId, friendId) {
    const userObjectId = await this.getUserObjectId(userId)
    const friendObjectId = await this.getUserObjectId(friendId)
    
    if (!userObjectId || !friendObjectId) {
      throw new AppError('Користувача не знайдено', 404)
    }

    const friendship = await friendRepository.findFriendship(userObjectId, friendObjectId)

    if (!friendship) {
      throw new AppError('Дружбу не знайдено', 404)
    }

    await friendRepository.deleteById(friendship._id)
    logger.info('Friendship removed', { userId, friendId })
  }

  async cancelFriendRequest(requesterId, recipientId) {
    const requesterObjectId = await this.getUserObjectId(requesterId)
    const recipientObjectId = await this.getUserObjectId(recipientId)
    
    if (!requesterObjectId || !recipientObjectId) {
      throw new AppError('Користувача не знайдено', 404)
    }

    const request = await friendRepository.findRequest(requesterObjectId, recipientObjectId)

    if (!request) {
      throw new AppError('Заявку не знайдено', 404)
    }

    await friendRepository.deleteById(request._id)
    logger.info('Friend request cancelled', { requesterId, recipientId })
  }

  async removeFollower(userId, followerId) {
    const userObjectId = await this.getUserObjectId(userId)
    const followerObjectId = await this.getUserObjectId(followerId)
    
    if (!userObjectId || !followerObjectId) {
      throw new AppError('Користувача не знайдено', 404)
    }

    const request = await friendRepository.findRequest(followerObjectId, userObjectId)

    if (!request) {
      throw new AppError('Підписку не знайдено', 404)
    }

    await friendRepository.deleteById(request._id)
    logger.info('Follower removed', { userId, followerId })
  }
}

module.exports = new FriendsService()
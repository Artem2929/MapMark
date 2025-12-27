const Follow = require('../models/Follow')
const User = require('../models/User')
const logger = require('../utils/logger')

class FollowsService {
  async getUserObjectId(userId) {
    let user = await User.findOne({ id: userId })
    if (!user && userId.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(userId)
    }
    return user ? user._id : null
  }

  async followUser(followerId, followingId) {
    const followerObjectId = await this.getUserObjectId(followerId)
    const followingObjectId = await this.getUserObjectId(followingId)
    
    if (!followerObjectId || !followingObjectId) {
      throw new Error('Користувача не знайдено')
    }
    
    if (followerObjectId.toString() === followingObjectId.toString()) {
      throw new Error('Не можна підписатися на самого себе')
    }

    const existingFollow = await Follow.findOne({
      follower: followerObjectId,
      following: followingObjectId
    })

    if (existingFollow) {
      throw new Error('Ви вже підписані на цього користувача')
    }

    const follow = new Follow({
      follower: followerObjectId,
      following: followingObjectId
    })

    await follow.save()
    logger.info('User followed', { followerId, followingId })
    
    return follow
  }

  async unfollowUser(followerId, followingId) {
    const followerObjectId = await this.getUserObjectId(followerId)
    const followingObjectId = await this.getUserObjectId(followingId)
    
    if (!followerObjectId || !followingObjectId) {
      throw new Error('Користувача не знайдено')
    }

    const follow = await Follow.findOne({
      follower: followerObjectId,
      following: followingObjectId
    })

    if (!follow) {
      throw new Error('Ви не підписані на цього користувача')
    }

    await Follow.deleteOne({ _id: follow._id })
    logger.info('User unfollowed', { followerId, followingId })
  }

  async getFollowers(userId, page = 1, limit = 20) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) return { followers: [], total: 0 }

    const follows = await Follow.find({ following: userObjectId })
      .populate('follower', 'id name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * page)
      .skip((page - 1) * limit)

    const total = await Follow.countDocuments({ following: userObjectId })

    return {
      followers: follows.map(follow => ({
        id: follow.follower.id || follow.follower._id,
        name: follow.follower.name,
        avatar: follow.follower.avatar,
        followedAt: follow.createdAt
      })),
      total
    }
  }

  async getFollowing(userId, page = 1, limit = 20) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) return { following: [], total: 0 }

    const follows = await Follow.find({ follower: userObjectId })
      .populate('following', 'id name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * page)
      .skip((page - 1) * limit)

    const total = await Follow.countDocuments({ follower: userObjectId })

    return {
      following: follows.map(follow => ({
        id: follow.following.id || follow.following._id,
        name: follow.following.name,
        avatar: follow.following.avatar,
        followedAt: follow.createdAt
      })),
      total
    }
  }

  async getUserStats(userId) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) return { followersCount: 0, followingCount: 0 }

    const [followersCount, followingCount] = await Promise.all([
      Follow.countDocuments({ following: userObjectId }),
      Follow.countDocuments({ follower: userObjectId })
    ])

    return { followersCount, followingCount }
  }

  async isFollowing(followerId, followingId) {
    const followerObjectId = await this.getUserObjectId(followerId)
    const followingObjectId = await this.getUserObjectId(followingId)
    
    if (!followerObjectId || !followingObjectId) return false

    const follow = await Follow.findOne({
      follower: followerObjectId,
      following: followingObjectId
    })

    return !!follow
  }
}

module.exports = new FollowsService()
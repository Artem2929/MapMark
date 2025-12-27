const Message = require('../models/Message')
const User = require('../models/User')
const logger = require('../utils/logger')

class MessagesService {
  async getUserObjectId(userId) {
    let user = await User.findOne({ id: userId })
    if (!user && userId.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(userId)
    }
    return user ? user._id : null
  }

  generateConversationId(userId1, userId2) {
    return [userId1, userId2].sort().join('-')
  }

  async getConversations(userId) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) return []

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userObjectId },
            { recipient: userObjectId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$recipient', userObjectId] }, { $eq: ['$read', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.sender',
          foreignField: '_id',
          as: 'senderInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.recipient',
          foreignField: '_id',
          as: 'recipientInfo'
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ])

    return conversations.map(conv => {
      const otherUser = conv.lastMessage.sender.toString() === userObjectId.toString() 
        ? conv.recipientInfo[0] 
        : conv.senderInfo[0]
      
      return {
        conversationId: conv._id,
        otherUser: {
          id: otherUser.id || otherUser._id,
          name: otherUser.name,
          avatar: otherUser.avatar
        },
        lastMessage: {
          content: conv.lastMessage.content,
          createdAt: conv.lastMessage.createdAt,
          isFromMe: conv.lastMessage.sender.toString() === userObjectId.toString()
        },
        unreadCount: conv.unreadCount
      }
    })
  }

  async getMessages(userId, otherUserId, page = 1, limit = 50) {
    const userObjectId = await this.getUserObjectId(userId)
    const otherUserObjectId = await this.getUserObjectId(otherUserId)
    
    if (!userObjectId || !otherUserObjectId) {
      throw new Error('Користувача не знайдено')
    }

    const conversationId = this.generateConversationId(userObjectId.toString(), otherUserObjectId.toString())
    
    const messages = await Message.find({ conversationId })
      .populate('sender', 'id name avatar')
      .populate('recipient', 'id name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * page)
      .skip((page - 1) * limit)

    return messages.reverse().map(msg => ({
      id: msg._id,
      content: msg.content,
      createdAt: msg.createdAt,
      read: msg.read,
      sender: {
        id: msg.sender.id || msg.sender._id,
        name: msg.sender.name,
        avatar: msg.sender.avatar
      },
      isFromMe: msg.sender._id.toString() === userObjectId.toString()
    }))
  }

  async sendMessage(senderId, recipientId, content) {
    const senderObjectId = await this.getUserObjectId(senderId)
    const recipientObjectId = await this.getUserObjectId(recipientId)
    
    if (!senderObjectId || !recipientObjectId) {
      throw new Error('Користувача не знайдено')
    }

    const conversationId = this.generateConversationId(senderObjectId.toString(), recipientObjectId.toString())
    
    const message = new Message({
      sender: senderObjectId,
      recipient: recipientObjectId,
      content: content.trim(),
      conversationId
    })

    await message.save()
    await message.populate('sender', 'id name avatar')
    await message.populate('recipient', 'id name avatar')
    
    logger.info('Message sent', { senderId, recipientId, conversationId })
    
    return {
      id: message._id,
      content: message.content,
      createdAt: message.createdAt,
      read: message.read,
      sender: {
        id: message.sender.id || message.sender._id,
        name: message.sender.name,
        avatar: message.sender.avatar
      },
      isFromMe: true
    }
  }

  async markAsRead(userId, conversationId) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) {
      throw new Error('Користувача не знайдено')
    }

    await Message.updateMany(
      { 
        conversationId,
        recipient: userObjectId,
        read: false
      },
      { read: true }
    )

    logger.info('Messages marked as read', { userId, conversationId })
  }
}

module.exports = new MessagesService()
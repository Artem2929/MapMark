const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

class MessageService {
  // Отримати всі розмови користувача
  async getUserConversations(userId) {
    try {
      console.log(`Fetching conversations for user: ${userId}`);
      
      const conversations = await Conversation.find({
        participants: userId
      })
      .populate('participants', 'name username email firstName lastName avatar isOnline lastSeen')
      .populate('lastMessage')
      .sort({ lastActivity: -1 });

      console.log(`Found ${conversations.length} conversations`);

      const result = conversations.map(conv => {
        const otherParticipant = conv.participants.find(p => p._id.toString() !== userId);
        const unreadCount = conv.unreadCount.get(userId.toString()) || 0;
        
        console.log(`Conversation ${conv._id}: participant=${otherParticipant?.name || otherParticipant?.email}, unreadCount=${unreadCount}`);
        
        return {
          _id: conv._id,
          participant: otherParticipant,
          lastMessage: conv.lastMessage,
          lastActivity: conv.lastActivity,
          unreadCount
        };
      });
      
      return result;
    } catch (error) {
      console.error('Error in getUserConversations:', error);
      throw new Error(`Error fetching conversations: ${error.message}`);
    }
  }

  // Отримати повідомлення розмови
  async getConversationMessages(conversationId, page = 1, limit = 50) {
    try {
      const skip = (page - 1) * limit;
      
      const messages = await Message.find({
        conversation: conversationId,
        isDeleted: false
      })
      .populate('sender', 'name username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

      return messages.reverse();
    } catch (error) {
      throw new Error(`Error fetching messages: ${error.message}`);
    }
  }

  // Створити або знайти розмову
  async findOrCreateConversation(userId, otherUserId) {
    try {
      let conversation = await Conversation.findOne({
        participants: { $all: [userId, otherUserId] }
      }).populate('participants', 'username email firstName lastName avatar isOnline lastSeen');

      if (!conversation) {
        conversation = new Conversation({
          participants: [userId, otherUserId]
        });
        await conversation.save();
        await conversation.populate('participants', 'name username email firstName lastName avatar isOnline lastSeen');
      }

      return conversation;
    } catch (error) {
      throw new Error(`Error creating conversation: ${error.message}`);
    }
  }

  // Надіслати повідомлення
  async sendMessage(conversationId, senderId, content) {
    try {
      const message = new Message({
        conversation: conversationId,
        sender: senderId,
        content: content.trim()
      });

      await message.save();
      await message.populate('sender', 'name username avatar');

      // Оновити розмову
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      conversation.lastMessage = message._id;
      conversation.lastActivity = new Date();
      
      // Збільшити лічильник непрочитаних тільки для інших учасників
      conversation.participants.forEach(participantId => {
        const participantIdStr = participantId.toString();
        if (participantIdStr !== senderId.toString()) {
          const currentCount = conversation.unreadCount.get(participantIdStr) || 0;
          conversation.unreadCount.set(participantIdStr, currentCount + 1);
        }
      });

      await conversation.save();

      return message;
    } catch (error) {
      throw new Error(`Error sending message: ${error.message}`);
    }
  }

  // Позначити повідомлення як прочитані
  async markMessagesAsRead(conversationId, userId) {
    try {
      await Message.updateMany(
        {
          conversation: conversationId,
          sender: { $ne: userId },
          'readBy.user': { $ne: userId }
        },
        {
          $push: {
            readBy: {
              user: userId,
              readAt: new Date()
            }
          },
          status: 'read'
        }
      );

      // Скинути лічильник непрочитаних
      const conversation = await Conversation.findById(conversationId);
      conversation.unreadCount.set(userId, 0);
      await conversation.save();

      return true;
    } catch (error) {
      throw new Error(`Error marking messages as read: ${error.message}`);
    }
  }

  // Видалити повідомлення
  async deleteMessage(messageId, userId) {
    try {
      const message = await Message.findById(messageId);
      
      if (!message) {
        throw new Error('Message not found');
      }

      if (message.sender.toString() !== userId) {
        throw new Error('Not authorized to delete this message');
      }

      message.isDeleted = true;
      await message.save();

      return true;
    } catch (error) {
      throw new Error(`Error deleting message: ${error.message}`);
    }
  }

  // Видалити розмову
  async deleteConversation(conversationId, userId) {
    try {
      const conversation = await Conversation.findById(conversationId);
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      if (!conversation.participants.includes(userId)) {
        throw new Error('Not authorized to delete this conversation');
      }

      await Message.deleteMany({ conversation: conversationId });
      await Conversation.findByIdAndDelete(conversationId);

      return true;
    } catch (error) {
      throw new Error(`Error deleting conversation: ${error.message}`);
    }
  }

  // Пошук користувачів для нової розмови
  async searchUsers(query, currentUserId) {
    try {
      const users = await User.find({
        _id: { $ne: currentUserId },
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { username: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } }
        ]
      })
      .select('name username email firstName lastName avatar isOnline lastSeen')
      .limit(10);

      return users;
    } catch (error) {
      throw new Error(`Error searching users: ${error.message}`);
    }
  }
}

module.exports = new MessageService();
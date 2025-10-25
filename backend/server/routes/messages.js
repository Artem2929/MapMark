const express = require('express');
const router = express.Router();

// Mock data for conversations and messages
let conversations = [
  {
    id: 1,
    participants: ['68fca6b223ea8d70a8da03d8', '507f1f77bcf86cd799439011'],
    lastMessage: 'Привіт! Як справи?',
    lastMessageTime: new Date().toISOString(),
    unreadCount: 2
  },
  {
    id: 2,
    participants: ['68fca6b223ea8d70a8da03d8', '507f1f77bcf86cd799439012'],
    lastMessage: 'Дякую за допомогу!',
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0
  }
];

let messages = {
  1: [
    {
      id: 1,
      conversationId: 1,
      senderId: '507f1f77bcf86cd799439011',
      text: 'Привіт!',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      conversationId: 1,
      senderId: '68fca6b223ea8d70a8da03d8',
      text: 'Привіт! Як справи?',
      timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString()
    }
  ],
  2: [
    {
      id: 3,
      conversationId: 2,
      senderId: '507f1f77bcf86cd799439012',
      text: 'Дякую за допомогу!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  ]
};

// Mock users data
const users = {
  '507f1f77bcf86cd799439011': {
    id: '507f1f77bcf86cd799439011',
    firstName: 'Олександр',
    lastName: 'Коваленко',
    avatar: null,
    isOnline: true
  },
  '507f1f77bcf86cd799439012': {
    id: '507f1f77bcf86cd799439012',
    firstName: 'Марина',
    lastName: 'Петренко',
    avatar: null,
    isOnline: false
  }
};

// Get conversations for a user
router.get('/:userId/conversations', (req, res) => {
  try {
    const { userId } = req.params;
    
    const userConversations = conversations
      .filter(conv => conv.participants.includes(userId))
      .map(conv => {
        const otherUserId = conv.participants.find(id => id !== userId);
        const otherUser = users[otherUserId];
        
        return {
          id: conv.id,
          name: otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User',
          avatar: otherUser?.avatar || null,
          lastMessage: conv.lastMessage,
          lastMessageTime: new Date(conv.lastMessageTime).toLocaleTimeString('uk-UA', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          unreadCount: conv.unreadCount,
          isOnline: otherUser?.isOnline || false
        };
      });

    res.json(userConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get messages for a conversation
router.get('/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversationMessages = messages[conversationId] || [];
    
    const formattedMessages = conversationMessages.map(msg => {
      const sender = users[msg.senderId];
      return {
        id: msg.id,
        text: msg.text,
        sender: msg.senderId === req.query.currentUserId ? 'me' : 'other',
        time: new Date(msg.timestamp).toLocaleTimeString('uk-UA', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        name: sender ? sender.firstName : 'Unknown'
      };
    });

    res.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send a message
router.post('/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text, senderId } = req.body;

    if (!text || !senderId) {
      return res.status(400).json({ error: 'Text and senderId are required' });
    }

    const newMessage = {
      id: Date.now(),
      conversationId: parseInt(conversationId),
      senderId,
      text,
      timestamp: new Date().toISOString()
    };

    if (!messages[conversationId]) {
      messages[conversationId] = [];
    }
    
    messages[conversationId].push(newMessage);

    // Update conversation last message
    const conversation = conversations.find(conv => conv.id === parseInt(conversationId));
    if (conversation) {
      conversation.lastMessage = text;
      conversation.lastMessageTime = newMessage.timestamp;
    }

    res.json({
      id: newMessage.id,
      text: newMessage.text,
      sender: 'me',
      time: new Date(newMessage.timestamp).toLocaleTimeString('uk-UA', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new conversation
router.post('/conversations', (req, res) => {
  try {
    const { participants } = req.body;

    if (!participants || participants.length !== 2) {
      return res.status(400).json({ error: 'Two participants are required' });
    }

    // Check if conversation already exists
    const existingConversation = conversations.find(conv => 
      conv.participants.includes(participants[0]) && 
      conv.participants.includes(participants[1])
    );

    if (existingConversation) {
      return res.json({ id: existingConversation.id });
    }

    const newConversation = {
      id: conversations.length + 1,
      participants,
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0
    };

    conversations.push(newConversation);
    messages[newConversation.id] = [];

    res.json({ id: newConversation.id });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
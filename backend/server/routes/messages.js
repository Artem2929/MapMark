const express = require('express');
const router = express.Router();
const MessageService = require('../services/MessageService');
const auth = require('../middleware/auth');

// Отримати всі розмови користувача
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await MessageService.getUserConversations(req.user.id);
    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Отримати повідомлення розмови
router.get('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const messages = await MessageService.getConversationMessages(
      conversationId, 
      parseInt(page), 
      parseInt(limit)
    );
    
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Створити або знайти розмову
router.post('/conversations', auth, async (req, res) => {
  try {
    const { otherUserId } = req.body;
    
    if (!otherUserId) {
      return res.status(400).json({ success: false, message: 'Other user ID is required' });
    }
    
    const conversation = await MessageService.findOrCreateConversation(req.user.id, otherUserId);
    res.json({ success: true, data: conversation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Надіслати повідомлення
router.post('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }
    
    const message = await MessageService.sendMessage(conversationId, req.user.id, content);
    
    // Відправити через WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to(conversationId).emit('newMessage', message);
    }
    
    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Позначити повідомлення як прочитані
router.put('/conversations/:conversationId/read', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    await MessageService.markMessagesAsRead(conversationId, req.user.id);
    
    // Відправити через WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to(conversationId).emit('messagesRead', { userId: req.user.id });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Видалити повідомлення
router.delete('/messages/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    
    await MessageService.deleteMessage(messageId, req.user.id);
    
    // Відправити через WebSocket
    const io = req.app.get('io');
    if (io) {
      io.emit('messageDeleted', { messageId });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Видалити розмову
router.delete('/conversations/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    await MessageService.deleteConversation(conversationId, req.user.id);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Пошук користувачів
router.get('/users/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }
    
    const users = await MessageService.searchUsers(q.trim(), req.user.id);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
import { io } from 'socket.io-client';

const API_BASE_URL = 'http://localhost:3001/api';
const SOCKET_URL = 'http://localhost:3001';

class MessagesService {
  constructor() {
    this.socket = null;
    this.token = null;
  }
  
  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('accessToken');
    }
    return this.token;
  }
  
  setToken(token) {
    this.token = token;
    localStorage.setItem('accessToken', token);
  }

  // Ініціалізація WebSocket з'єднання
  initSocket() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling']
      });

      const token = this.getToken();
      if (token) {
        this.socket.emit('authenticate', token);
      }
    }
    return this.socket;
  }

  // Закрити WebSocket з'єднання
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Отримати всі розмови
  async getConversations() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  // Отримати повідомлення розмови
  async getMessages(conversationId, page = 1) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch(
        `${API_BASE_URL}/messages/conversations/${conversationId}/messages?page=${page}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Надіслати повідомлення
  async sendMessage(conversationId, content) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch(
        `${API_BASE_URL}/messages/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Створити нову розмову
  async createConversation(otherUserId) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ otherUserId })
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Позначити повідомлення як прочитані
  async markAsRead(conversationId) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch(
        `${API_BASE_URL}/messages/conversations/${conversationId}/read`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark messages as read');
      }

      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  // Видалити повідомлення
  async deleteMessage(messageId) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch(`${API_BASE_URL}/messages/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // Видалити розмову
  async deleteConversation(conversationId) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch(
        `${API_BASE_URL}/messages/conversations/${conversationId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }

      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  // Пошук користувачів
  async searchUsers(query) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch(
        `${API_BASE_URL}/messages/users/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search users');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // WebSocket методи
  joinConversation(conversationId) {
    if (this.socket) {
      this.socket.emit('joinConversation', conversationId);
    }
  }

  leaveConversation(conversationId) {
    if (this.socket) {
      this.socket.emit('leaveConversation', conversationId);
    }
  }

  sendTyping(conversationId, isTyping) {
    if (this.socket) {
      this.socket.emit('typing', { conversationId, isTyping });
    }
  }

  // Підписка на події
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('newMessage', callback);
    }
  }

  onMessageDeleted(callback) {
    if (this.socket) {
      this.socket.on('messageDeleted', callback);
    }
  }

  onMessagesRead(callback) {
    if (this.socket) {
      this.socket.on('messagesRead', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('userTyping', callback);
    }
  }

  onUserOnline(callback) {
    if (this.socket) {
      this.socket.on('userOnline', callback);
    }
  }

  onUserOffline(callback) {
    if (this.socket) {
      this.socket.on('userOffline', callback);
    }
  }

  // Відписка від подій
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new MessagesService();
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
      console.log('Initializing WebSocket connection...');
      
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        forceNew: true
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected:', this.socket.id);
        const token = this.getToken();
        if (token) {
          console.log('Authenticating WebSocket...');
          this.socket.emit('authenticate', token);
        }
      });

      this.socket.on('authenticated', (data) => {
        console.log('WebSocket authenticated:', data);
      });

      this.socket.on('authError', (error) => {
        console.error('WebSocket auth error:', error);
      });
      
      this.socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
      });
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch conversations');
      }

      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      throw error;
    }
  }

  // Отримати повідомлення розмови
  async getMessages(conversationId, page = 1, limit = 50) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch(
        `${API_BASE_URL}/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch messages');
      }

      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
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
          body: JSON.stringify({ content: content.trim() })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      throw error;
    }
  }

  // Надіслати файл
  async sendFileMessage(conversationId, file, content = '') {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const formData = new FormData();
      formData.append('file', file);
      if (content.trim()) {
        formData.append('content', content.trim());
      }
      
      const response = await fetch(
        `${API_BASE_URL}/messages/conversations/${conversationId}/files`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send file');
      }

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      throw error;
    }
  }

  // Надіслати голосове повідомлення
  async sendVoiceMessage(conversationId, audioFile) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const formData = new FormData();
      formData.append('voice', audioFile);
      
      const response = await fetch(
        `${API_BASE_URL}/messages/conversations/${conversationId}/voice`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send voice message');
      }

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create conversation');
      }

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark messages as read');
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete message');
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete conversation');
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to search users');
      }

      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
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
      console.log('Setting up newMessage listener');
      this.socket.on('newMessage', (data) => {
        console.log('Received newMessage event:', data);
        callback(data);
      });
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
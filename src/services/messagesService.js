const API_BASE_URL = 'http://localhost:3000/api';

export const messagesService = {
  async getConversations(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${userId}/conversations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return { success: false, error: error.message };
    }
  },

  async getMessages(conversationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${conversationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return { success: false, error: error.message };
    }
  },

  async sendMessage(conversationId, message) {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${conversationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message,
          senderId: localStorage.getItem('userId')
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  },

  async createConversation(userId, recipientId) {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participants: [userId, recipientId]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error creating conversation:', error);
      return { success: false, error: error.message };
    }
  }
};
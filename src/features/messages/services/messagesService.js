import { apiClient } from '../../../shared/api/apiClient';

export const messagesService = {
  async getConversations() {
    try {
      const response = await apiClient.get('/api/v1/conversations');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Помилка завантаження розмов' };
    }
  },

  async getMessages(conversationId) {
    try {
      const response = await apiClient.get(`/api/v1/conversations/${conversationId}/messages`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Помилка завантаження повідомлень' };
    }
  },

  async sendMessage(conversationId, content) {
    try {
      const response = await apiClient.post(`/api/v1/conversations/${conversationId}/messages`, {
        content,
        messageType: 'text'
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Помилка відправки повідомлення' };
    }
  },

  async createConversation(participantId) {
    try {
      const response = await apiClient.post('/api/v1/conversations', {
        participants: [participantId],
        type: 'private'
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Помилка створення розмови' };
    }
  }
};
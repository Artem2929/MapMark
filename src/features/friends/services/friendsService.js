import { apiClient } from '../../../shared/api/apiClient';

export const friendsService = {
  async getFriends(userId) {
    try {
      const response = await apiClient.get(`/api/v1/friends/${userId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Помилка завантаження друзів' };
    }
  },

  async getFriendRequests(userId) {
    try {
      const response = await apiClient.get(`/api/v1/friends/${userId}/requests`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Помилка завантаження заявок' };
    }
  },

  async searchUsers(query, filters = {}) {
    try {
      const token = localStorage.getItem('accessToken');
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentUserId = payload.id;
      
      const params = new URLSearchParams({ 
        query, 
        currentUserId,
        ...filters 
      });
      const response = await apiClient.get(`/api/v1/users/search?${params}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Помилка пошуку' };
    }
  },

  async sendFriendRequest(userId) {
    try {
      const token = localStorage.getItem('accessToken');
      const payload = JSON.parse(atob(token.split('.')[1]));
      const requesterId = payload.id;
      
      const response = await apiClient.post(`/api/v1/friends/${userId}/request`, {
        requesterId
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Помилка відправки заявки' };
    }
  },

  async acceptFriendRequest(requesterId) {
    try {
      const token = localStorage.getItem('accessToken');
      const payload = JSON.parse(atob(token.split('.')[1]));
      const recipientId = payload.id;
      
      const response = await apiClient.post(`/api/v1/friends/${requesterId}/accept`, {
        recipientId
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Помилка прийняття заявки' };
    }
  },

  async rejectFriendRequest(requesterId) {
    try {
      const token = localStorage.getItem('accessToken');
      const payload = JSON.parse(atob(token.split('.')[1]));
      const recipientId = payload.id;
      
      const response = await apiClient.post(`/api/v1/friends/${requesterId}/reject`, {
        recipientId
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Помилка відхилення заявки' };
    }
  },

  async removeFriend(userId) {
    try {
      const token = localStorage.getItem('accessToken');
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentUserId = payload.id;
      
      const response = await apiClient.delete(`/api/v1/friends/${userId}`, {
        data: { currentUserId }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Помилка видалення друга' };
    }
  }
};
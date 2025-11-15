const API_BASE = 'http://localhost:3001/api';

export const friendsService = {
  // Search users
  searchUsers: async (query, filters = {}) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token');
      }
      
      // Отримуємо userId з токена
      let currentUserId = localStorage.getItem('userId');
      if (!currentUserId && token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          currentUserId = payload.id;
        } catch (e) {
          console.error('Error parsing token:', e);
        }
      }
      
      const params = new URLSearchParams({
        query,
        ...(currentUserId && { currentUserId }),
        ...filters
      });

      const response = await fetch(`${API_BASE}/friends/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get user's friends
  getFriends: async (userId) => {
    try {
      const currentUserId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE}/friends/${userId}?currentUserId=${currentUserId}`);
      return await response.json();
    } catch (error) {
      console.error('Error getting friends:', error);
      return { success: false, error: error.message };
    }
  },

  // Get friend requests
  getFriendRequests: async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/friends/${userId}/requests`);
      return await response.json();
    } catch (error) {
      console.error('Error getting friend requests:', error);
      return { success: false, error: error.message };
    }
  },

  // Send friend request
  sendFriendRequest: async (userId) => {
    try {
      const requesterId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE}/friends/${userId}/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterId })
      });
      return await response.json();
    } catch (error) {
      console.error('Error sending friend request:', error);
      return { success: false, error: error.message };
    }
  },

  // Accept friend request
  acceptFriendRequest: async (requesterId) => {
    try {
      const recipientId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE}/friends/${requesterId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId })
      });
      return await response.json();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      return { success: false, error: error.message };
    }
  },

  // Reject friend request
  rejectFriendRequest: async (requesterId) => {
    try {
      const recipientId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE}/friends/${requesterId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId })
      });
      return await response.json();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      return { success: false, error: error.message };
    }
  },

  // Remove friend
  removeFriend: async (userId) => {
    try {
      const currentUserId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE}/friends/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUserId })
      });
      return await response.json();
    } catch (error) {
      console.error('Error removing friend:', error);
      return { success: false, error: error.message };
    }
  }
};
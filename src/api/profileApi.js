const API_BASE = 'http://localhost:3000/api';

// Profile API
export const profileApi = {
  // Get user profile
  getProfile: async (userId) => {
    const response = await fetch(`${API_BASE}/user/${userId}/profile`);
    return response.json();
  },

  // Update profile
  updateProfile: async (userId, data) => {
    const response = await fetch(`${API_BASE}/user/${userId}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Upload avatar
  uploadAvatar: async (userId, formData) => {
    const response = await fetch(`${API_BASE}/user/${userId}/avatar`, {
      method: 'PUT',
      body: formData
    });
    return response.json();
  },

  // Follow/unfollow user
  toggleFollow: async (userId, targetUserId) => {
    const response = await fetch(`${API_BASE}/user/${userId}/follow/${targetUserId}`, {
      method: 'POST'
    });
    return response.json();
  },

  // Get followers
  getFollowers: async (userId) => {
    const response = await fetch(`${API_BASE}/user/${userId}/followers`);
    return response.json();
  },

  // Get following
  getFollowing: async (userId) => {
    const response = await fetch(`${API_BASE}/user/${userId}/following`);
    return response.json();
  }
};



// Wall/Posts API
export const wallApi = {
  // Get wall posts
  getPosts: async (userId) => {
    const response = await fetch(`${API_BASE}/user/${userId}/wall`);
    return response.json();
  },

  // Create post
  createPost: async (userId, data) => {
    const response = await fetch(`${API_BASE}/user/${userId}/wall`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Like/unlike post
  toggleLike: async (postId, userId) => {
    const response = await fetch(`${API_BASE}/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return response.json();
  },

  // Add comment
  addComment: async (postId, userId, text) => {
    const response = await fetch(`${API_BASE}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, text })
    });
    return response.json();
  }
};
const API_BASE = 'http://localhost:3000/api';

export const wallService = {
  // Get wall posts
  getPosts: async (userId) => {
    try {
      const currentUserId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE}/user/${userId}/wall?currentUserId=${currentUserId}`);
      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  },

  // Create new post
  createPost: async (userId, postData) => {
    try {
      const response = await fetch(`${API_BASE}/user/${userId}/wall`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating post:', error);
      return { success: false, error: error.message };
    }
  },

  // Toggle like on post
  toggleLike: async (postId, userId) => {
    try {
      const response = await fetch(`${API_BASE}/user/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return await response.json();
    } catch (error) {
      console.error('Error toggling like:', error);
      return { success: false, error: error.message };
    }
  },

  // Toggle dislike on post
  toggleDislike: async (postId, userId) => {
    try {
      const response = await fetch(`${API_BASE}/user/posts/${postId}/dislike`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return await response.json();
    } catch (error) {
      console.error('Error toggling dislike:', error);
      return { success: false, error: error.message };
    }
  },

  // Add comment to post
  addComment: async (postId, userId, text) => {
    try {
      const response = await fetch(`${API_BASE}/user/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, text })
      });
      return await response.json();
    } catch (error) {
      console.error('Error adding comment:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete post
  deletePost: async (postId, userId) => {
    try {
      const response = await fetch(`${API_BASE}/user/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting post:', error);
      return { success: false, error: error.message };
    }
  }
};
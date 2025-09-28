const API_BASE_URL = 'http://localhost:3000/api';

class WallService {
  // Отримати пости користувача
  async getUserPosts(userId, page = 1, limit = 10) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${userId}?page=${page}&limit=${limit}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      return data.posts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  // Створити новий пост
  async createPost(postData) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      return data.post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  // Оновити пост
  async updatePost(postId, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      return data.post;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  // Видалити пост
  async deletePost(postId, userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  // Додати/змінити реакцію
  async addReaction(postId, userId, reactionType) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, type: reactionType })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      return data.reactions;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  }

  // Додати коментар
  async addComment(postId, content, authorId) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, authorId })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      return data.comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Додати відповідь на коментар
  async addReply(postId, commentId, content, authorId) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, authorId })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      return data.comment;
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    }
  }

  // Поділитися постом
  async sharePost(postId) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      return data.shares;
    } catch (error) {
      console.error('Error sharing post:', error);
      throw error;
    }
  }

  // Завантажити зображення
  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      return data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
}

export default new WallService();
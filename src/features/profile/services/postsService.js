import { apiClient } from '../../../shared/api/client.js'

export const postsService = {
  async getUserPosts(userId, page = 1, limit = 10) {
    if (!userId) {
      throw new Error('ID користувача обов\'язковий')
    }
    
    try {
      return await apiClient.request(`/posts/user/${userId}?page=${page}&limit=${limit}`)
    } catch (error) {
      if (error.message.includes('404')) {
        return { success: true, data: { posts: [], total: 0 } }
      }
      throw error
    }
  },

  async createPost(content, images = []) {
    if (!content || !content.trim()) {
      throw new Error('Контент поста обов\'язковий')
    }
    
    return await apiClient.secureRequest('/posts', {
      method: 'POST',
      body: JSON.stringify({ content, images })
    })
  },

  async likePost(postId) {
    if (!postId) {
      throw new Error('ID поста обов\'язковий')
    }
    
    return await apiClient.secureRequest(`/posts/${postId}/like`, {
      method: 'POST'
    })
  },

  async addComment(postId, content) {
    if (!postId || !content || !content.trim()) {
      throw new Error('ID поста та контент коментаря обов\'язкові')
    }
    
    return await apiClient.secureRequest(`/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content })
    })
  },

  async deletePost(postId) {
    if (!postId) {
      throw new Error('ID поста обов\'язковий')
    }
    
    return await apiClient.secureRequest(`/posts/${postId}`, {
      method: 'DELETE'
    })
  }
}
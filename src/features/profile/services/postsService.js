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

  async createPost(formData) {
    if (formData instanceof FormData) {
      const content = formData.get('content')
      const hasImages = formData.has('images')
      
      if ((!content || !content.trim()) && !hasImages) {
        throw new Error('Пост повинен містити текст або фото')
      }
      
      const result = await apiClient.secureRequest('/posts', {
        method: 'POST',
        body: formData
      })
      
      console.log('Post created:', result)
      return result
    }
    
    if (!formData || !formData.trim()) {
      throw new Error('Контент поста обов\'язковий')
    }
    
    return await apiClient.secureRequest('/posts', {
      method: 'POST',
      body: JSON.stringify({ content: formData })
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

  async dislikePost(postId) {
    if (!postId) {
      throw new Error('ID поста обов\'язковий')
    }
    
    return await apiClient.secureRequest(`/posts/${postId}/dislike`, {
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

  async updatePost(postId, data) {
    if (!postId) {
      throw new Error('ID поста обов\'язковий')
    }
    
    if (data instanceof FormData) {
      return await apiClient.secureRequest(`/posts/${postId}`, {
        method: 'PUT',
        body: data
      })
    }
    
    if (!data || !data.trim()) {
      throw new Error('Контент обов\'язковий')
    }
    
    return await apiClient.secureRequest(`/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify({ content: data })
    })
  },

  async updateComment(postId, commentId, content) {
    if (!postId || !commentId || !content || !content.trim()) {
      throw new Error('ID поста, ID коментаря та контент обов\'язкові')
    }
    
    return await apiClient.secureRequest(`/posts/${postId}/comment/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content })
    })
  },

  async deleteComment(postId, commentId) {
    if (!postId || !commentId) {
      throw new Error('ID поста та ID коментаря обов\'язкові')
    }
    
    return await apiClient.secureRequest(`/posts/${postId}/comment/${commentId}`, {
      method: 'DELETE'
    })
  },

  async likeComment(postId, commentId) {
    if (!postId || !commentId) {
      throw new Error('ID поста та ID коментаря обов\'язкові')
    }
    
    return await apiClient.secureRequest(`/posts/${postId}/comment/${commentId}/like`, {
      method: 'POST'
    })
  },

  async dislikeComment(postId, commentId) {
    if (!postId || !commentId) {
      throw new Error('ID поста та ID коментаря обов\'язкові')
    }
    
    return await apiClient.secureRequest(`/posts/${postId}/comment/${commentId}/dislike`, {
      method: 'POST'
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
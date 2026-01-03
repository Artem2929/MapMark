const postRepository = require('../repositories/postRepository')
const userRepository = require('../repositories/userRepository')
const { AppError } = require('../utils/errorHandler')
const logger = require('../utils/logger')

class PostsService {
  async getUserObjectId(userId) {
    const user = await userRepository.findByIdOrCustomId(userId)
    return user ? user._id : null
  }

  async getUserPosts(userId, page = 1, limit = 10) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) return { posts: [], total: 0 }

    const posts = await postRepository.findByAuthor(userObjectId, page, limit)
    const total = await postRepository.countByAuthor(userObjectId)

    return {
      posts: posts.map(post => ({
        id: post._id,
        content: post.content,
        images: post.images,
        likesCount: post.likesCount,
        dislikesCount: post.dislikesCount || 0,
        commentsCount: post.commentsCount,
        createdAt: post.createdAt,
        author: {
          id: post.author.id || post.author._id,
          name: post.author.name,
          avatar: post.author.avatar
        },
        comments: post.comments.map(comment => ({
          id: comment._id,
          content: comment.content,
          likesCount: comment.likesCount || 0,
          dislikesCount: comment.dislikesCount || 0,
          createdAt: comment.createdAt,
          user: {
            id: comment.user.id || comment.user._id,
            name: comment.user.name,
            avatar: comment.user.avatar
          }
        }))
      })),
      total
    }
  }

  async createPost(authorId, content, images = []) {
    const authorObjectId = await this.getUserObjectId(authorId)
    if (!authorObjectId) {
      throw new AppError('Користувача не знайдено', 404)
    }

    if (!content && images.length === 0) {
      throw new AppError('Пост повинен містити текст або фото', 400)
    }

    if (content && content.length > 2000) {
      throw new AppError('Максимальна довжина тексту 2000 символів', 400)
    }

    const post = await postRepository.create({
      author: authorObjectId,
      content: content || '',
      images
    })
    await post.populate('author', 'id name avatar')
    
    logger.info('Post created', { authorId, postId: post._id })
    
    return {
      id: post._id,
      content: post.content,
      images: post.images,
      likesCount: post.likesCount,
      dislikesCount: post.dislikesCount || 0,
      commentsCount: post.commentsCount,
      createdAt: post.createdAt,
      author: {
        id: post.author.id || post.author._id,
        name: post.author.name,
        avatar: post.author.avatar
      },
      comments: []
    }
  }

  async likePost(postId, userId) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) {
      throw new AppError('Користувача не знайдено', 404)
    }

    const post = await postRepository.findById(postId)
    if (!post) {
      throw new AppError('Пост не знайдено', 404)
    }

    // Remove dislike if exists
    const existingDislike = post.dislikes.find(dislike => 
      dislike.user.toString() === userObjectId.toString()
    )
    if (existingDislike) {
      post.dislikes = post.dislikes.filter(dislike => 
        dislike.user.toString() !== userObjectId.toString()
      )
      post.dislikesCount = Math.max(0, post.dislikesCount - 1)
    }

    const existingLike = post.likes.find(like => 
      like.user.toString() === userObjectId.toString()
    )

    if (existingLike) {
      post.likes = post.likes.filter(like => 
        like.user.toString() !== userObjectId.toString()
      )
      post.likesCount = Math.max(0, post.likesCount - 1)
    } else {
      post.likes.push({ user: userObjectId })
      post.likesCount += 1
    }

    await post.save()
    logger.info('Post like toggled', { postId, userId, liked: !existingLike })
    
    return { liked: !existingLike, likesCount: post.likesCount, dislikesCount: post.dislikesCount }
  }

  async dislikePost(postId, userId) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) {
      throw new AppError('Користувача не знайдено', 404)
    }

    const post = await postRepository.findById(postId)
    if (!post) {
      throw new AppError('Пост не знайдено', 404)
    }

    // Remove like if exists
    const existingLike = post.likes.find(like => 
      like.user.toString() === userObjectId.toString()
    )
    if (existingLike) {
      post.likes = post.likes.filter(like => 
        like.user.toString() !== userObjectId.toString()
      )
      post.likesCount = Math.max(0, post.likesCount - 1)
    }

    const existingDislike = post.dislikes.find(dislike => 
      dislike.user.toString() === userObjectId.toString()
    )

    if (existingDislike) {
      post.dislikes = post.dislikes.filter(dislike => 
        dislike.user.toString() !== userObjectId.toString()
      )
      post.dislikesCount = Math.max(0, post.dislikesCount - 1)
    } else {
      post.dislikes.push({ user: userObjectId })
      post.dislikesCount += 1
    }

    await post.save()
    logger.info('Post dislike toggled', { postId, userId, disliked: !existingDislike })
    
    return { disliked: !existingDislike, likesCount: post.likesCount, dislikesCount: post.dislikesCount }
  }

  async addComment(postId, userId, content) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) {
      throw new AppError('Користувача не знайдено', 404)
    }

    if (!content || !content.trim()) {
      throw new AppError('Контент коментаря обов\'язковий', 400)
    }

    const post = await postRepository.findById(postId)
    if (!post) {
      throw new AppError('Пост не знайдено', 404)
    }

    const comment = {
      user: userObjectId,
      content: content.trim()
    }

    post.comments.push(comment)
    post.commentsCount += 1
    await post.save()

    await post.populate('comments.user', 'id name avatar')
    const newComment = post.comments[post.comments.length - 1]
    
    logger.info('Comment added', { postId, userId, commentId: newComment._id })
    
    return {
      id: newComment._id,
      content: newComment.content,
      likesCount: newComment.likesCount || 0,
      dislikesCount: newComment.dislikesCount || 0,
      createdAt: newComment.createdAt,
      user: {
        id: newComment.user.id || newComment.user._id,
        name: newComment.user.name,
        avatar: newComment.user.avatar
      }
    }
  }

  async updatePost(postId, userId, content, newImages = [], removedImages = []) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) {
      throw new AppError('Користувача не знайдено', 404)
    }

    const post = await postRepository.findByIdAndAuthor(postId, userObjectId)
    if (!post) {
      throw new AppError('Пост не знайдено або ви не маєте прав на його редагування', 403)
    }

    if (content) {
      post.content = content.trim()
    }
    
    if (removedImages.length > 0) {
      post.images = post.images.filter(img => !removedImages.includes(img))
    }
    
    if (newImages.length > 0) {
      post.images = [...post.images, ...newImages]
    }
    
    await post.save()
    await post.populate('author', 'id name avatar')
    
    logger.info('Post updated', { postId, userId })
    
    return {
      id: post._id,
      content: post.content,
      images: post.images,
      likesCount: post.likesCount,
      dislikesCount: post.dislikesCount || 0,
      commentsCount: post.commentsCount,
      createdAt: post.createdAt,
      author: {
        id: post.author.id || post.author._id,
        name: post.author.name,
        avatar: post.author.avatar
      }
    }
  }

  async updateComment(postId, commentId, userId, content) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) {
      throw new AppError('Користувача не знайдено', 404)
    }

    if (!content || !content.trim()) {
      throw new AppError('Контент коментаря обов\'язковий', 400)
    }

    if (content.trim().length > 500) {
      throw new AppError('Максимальна довжина коментаря 500 символів', 400)
    }

    const post = await postRepository.findById(postId)
    if (!post) {
      throw new AppError('Пост не знайдено', 404)
    }

    const comment = post.comments.id(commentId)
    if (!comment) {
      throw new Error('Коментар не знайдено')
    }

    if (comment.user.toString() !== userObjectId.toString()) {
      throw new AppError('Ви не маєте прав на редагування цього коментаря', 403)
    }

    comment.content = content.trim()
    await post.save()
    await post.populate('comments.user', 'id name avatar')
    
    const updatedComment = post.comments.id(commentId)
    logger.info('Comment updated', { postId, commentId, userId })
    
    return {
      id: updatedComment._id,
      content: updatedComment.content,
      createdAt: updatedComment.createdAt,
      user: {
        id: updatedComment.user.id || updatedComment.user._id,
        name: updatedComment.user.name,
        avatar: updatedComment.user.avatar
      }
    }
  }

  async deleteComment(postId, commentId, userId) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) {
      throw new AppError('Користувача не знайдено', 404)
    }

    const post = await postRepository.findById(postId)
    if (!post) {
      throw new AppError('Пост не знайдено', 404)
    }

    const comment = post.comments.id(commentId)
    if (!comment) {
      throw new Error('Коментар не знайдено')
    }

    if (comment.user.toString() !== userObjectId.toString()) {
      throw new AppError('Ви не маєте прав на видалення цього коментаря', 403)
    }

    comment.deleteOne()
    post.commentsCount = Math.max(0, post.commentsCount - 1)
    await post.save()
    
    logger.info('Comment deleted', { postId, commentId, userId })
  }

  async likeComment(postId, commentId, userId) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) {
      throw new AppError('Користувача не знайдено', 404)
    }

    const post = await postRepository.findById(postId)
    if (!post) {
      throw new AppError('Пост не знайдено', 404)
    }

    const comment = post.comments.id(commentId)
    if (!comment) {
      throw new Error('Коментар не знайдено')
    }

    const existingDislike = comment.dislikes.find(dislike => 
      dislike.user.toString() === userObjectId.toString()
    )
    if (existingDislike) {
      comment.dislikes = comment.dislikes.filter(dislike => 
        dislike.user.toString() !== userObjectId.toString()
      )
      comment.dislikesCount = Math.max(0, comment.dislikesCount - 1)
    }

    const existingLike = comment.likes.find(like => 
      like.user.toString() === userObjectId.toString()
    )

    if (existingLike) {
      comment.likes = comment.likes.filter(like => 
        like.user.toString() !== userObjectId.toString()
      )
      comment.likesCount = Math.max(0, comment.likesCount - 1)
    } else {
      comment.likes.push({ user: userObjectId })
      comment.likesCount += 1
    }

    await post.save()
    logger.info('Comment like toggled', { postId, commentId, userId, liked: !existingLike })
    
    return { liked: !existingLike, likesCount: comment.likesCount, dislikesCount: comment.dislikesCount }
  }

  async dislikeComment(postId, commentId, userId) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) {
      throw new AppError('Користувача не знайдено', 404)
    }

    const post = await postRepository.findById(postId)
    if (!post) {
      throw new AppError('Пост не знайдено', 404)
    }

    const comment = post.comments.id(commentId)
    if (!comment) {
      throw new Error('Коментар не знайдено')
    }

    const existingLike = comment.likes.find(like => 
      like.user.toString() === userObjectId.toString()
    )
    if (existingLike) {
      comment.likes = comment.likes.filter(like => 
        like.user.toString() !== userObjectId.toString()
      )
      comment.likesCount = Math.max(0, comment.likesCount - 1)
    }

    const existingDislike = comment.dislikes.find(dislike => 
      dislike.user.toString() === userObjectId.toString()
    )

    if (existingDislike) {
      comment.dislikes = comment.dislikes.filter(dislike => 
        dislike.user.toString() !== userObjectId.toString()
      )
      comment.dislikesCount = Math.max(0, comment.dislikesCount - 1)
    } else {
      comment.dislikes.push({ user: userObjectId })
      comment.dislikesCount += 1
    }

    await post.save()
    logger.info('Comment dislike toggled', { postId, commentId, userId, disliked: !existingDislike })
    
    return { disliked: !existingDislike, likesCount: comment.likesCount, dislikesCount: comment.dislikesCount }
  }

  async deletePost(postId, userId) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) {
      throw new AppError('Користувача не знайдено', 404)
    }

    const post = await postRepository.findByIdAndAuthor(postId, userObjectId)
    if (!post) {
      throw new AppError('Пост не знайдено або ви не маєте прав на його видалення', 403)
    }

    await postRepository.deleteById(postId)
    logger.info('Post deleted', { postId, userId })
  }
}

module.exports = new PostsService()
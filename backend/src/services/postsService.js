const Post = require('../models/Post')
const User = require('../models/User')
const logger = require('../utils/logger')

class PostsService {
  async getUserObjectId(userId) {
    let user = await User.findOne({ id: userId })
    if (!user && userId.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(userId)
    }
    return user ? user._id : null
  }

  async getUserPosts(userId, page = 1, limit = 10) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) return { posts: [], total: 0 }

    const posts = await Post.find({ author: userObjectId })
      .populate('author', 'id name avatar')
      .populate('comments.user', 'id name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * page)
      .skip((page - 1) * limit)

    const total = await Post.countDocuments({ author: userObjectId })

    return {
      posts: posts.map(post => ({
        id: post._id,
        content: post.content,
        images: post.images,
        likesCount: post.likesCount,
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
      throw new Error('Користувача не знайдено')
    }

    const post = new Post({
      author: authorObjectId,
      content: content || '',
      images
    })

    await post.save()
    await post.populate('author', 'id name avatar')
    
    logger.info('Post created', { authorId, postId: post._id })
    
    return {
      id: post._id,
      content: post.content,
      images: post.images,
      likesCount: post.likesCount,
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
      throw new Error('Користувача не знайдено')
    }

    const post = await Post.findById(postId)
    if (!post) {
      throw new Error('Пост не знайдено')
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
    
    return { liked: !existingLike, likesCount: post.likesCount }
  }

  async addComment(postId, userId, content) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) {
      throw new Error('Користувача не знайдено')
    }

    const post = await Post.findById(postId)
    if (!post) {
      throw new Error('Пост не знайдено')
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
      createdAt: newComment.createdAt,
      user: {
        id: newComment.user.id || newComment.user._id,
        name: newComment.user.name,
        avatar: newComment.user.avatar
      }
    }
  }

  async updatePost(postId, userId, content) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) {
      throw new Error('Користувача не знайдено')
    }

    const post = await Post.findOne({ _id: postId, author: userObjectId })
    if (!post) {
      throw new Error('Пост не знайдено або ви не маєте прав на його редагування')
    }

    post.content = content.trim()
    await post.save()
    await post.populate('author', 'id name avatar')
    
    logger.info('Post updated', { postId, userId })
    
    return {
      id: post._id,
      content: post.content,
      images: post.images,
      likesCount: post.likesCount,
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
      throw new Error('Користувача не знайдено')
    }

    const post = await Post.findById(postId)
    if (!post) {
      throw new Error('Пост не знайдено')
    }

    const comment = post.comments.id(commentId)
    if (!comment) {
      throw new Error('Коментар не знайдено')
    }

    if (comment.user.toString() !== userObjectId.toString()) {
      throw new Error('Ви не маєте прав на редагування цього коментаря')
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
      throw new Error('Користувача не знайдено')
    }

    const post = await Post.findById(postId)
    if (!post) {
      throw new Error('Пост не знайдено')
    }

    const comment = post.comments.id(commentId)
    if (!comment) {
      throw new Error('Коментар не знайдено')
    }

    if (comment.user.toString() !== userObjectId.toString()) {
      throw new Error('Ви не маєте прав на видалення цього коментаря')
    }

    comment.deleteOne()
    post.commentsCount = Math.max(0, post.commentsCount - 1)
    await post.save()
    
    logger.info('Comment deleted', { postId, commentId, userId })
  }

  async deletePost(postId, userId) {
    const userObjectId = await this.getUserObjectId(userId)
    if (!userObjectId) {
      throw new Error('Користувача не знайдено')
    }

    const post = await Post.findOne({ _id: postId, author: userObjectId })
    if (!post) {
      throw new Error('Пост не знайдено або ви не маєте прав на його видалення')
    }

    await Post.deleteOne({ _id: postId })
    logger.info('Post deleted', { postId, userId })
  }
}

module.exports = new PostsService()
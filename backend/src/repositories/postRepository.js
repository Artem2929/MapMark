const Post = require('../models/Post')

class PostRepository {
  async findById(postId) {
    return Post.findById(postId)
  }

  async findByIdWithPopulate(postId) {
    return Post.findById(postId)
      .populate('author', 'id name avatar')
      .populate('comments.user', 'id name avatar')
  }

  async findByAuthor(authorId, page = 1, limit = 10) {
    return Post.find({ author: authorId })
      .populate('author', 'id name avatar')
      .populate('comments.user', 'id name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * page)
      .skip((page - 1) * limit)
  }

  async countByAuthor(authorId) {
    return Post.countDocuments({ author: authorId })
  }

  async create(postData) {
    const post = new Post(postData)
    await post.save()
    return post
  }

  async deleteById(postId) {
    return Post.deleteOne({ _id: postId })
  }

  async findByIdAndAuthor(postId, authorId) {
    return Post.findOne({ _id: postId, author: authorId })
  }
}

module.exports = new PostRepository()

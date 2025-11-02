const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const SavedPost = require('../models/SavedPost');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { postRateLimit, reactionRateLimit, commentRateLimit, validateInput, sanitizeInput } = require('../middleware/security');

// GET /api/posts/:postId - Отримати деталі поста
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate('author', 'name avatar')
      .populate('comments.author', 'name avatar');

    if (!post || post.isDeleted) {
      return res.status(404).json({ success: false, error: 'Пост не знайдено' });
    }

    const formattedPost = {
      id: post._id,
      content: post.content,
      images: post.images || [],
      type: post.type,
      location: post.location,
      mood: post.mood,
      author: {
        id: post.author._id,
        name: post.author.name,
        avatar: post.author.avatar
      },
      stats: {
        likes: post.reactions.filter(r => r.type === 'like').length,
        dislikes: post.reactions.filter(r => r.type === 'dislike').length,
        comments: post.comments.length,
        shares: post.shares,
        views: post.views
      },
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    };

    res.json({ success: true, post: formattedPost });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/posts/user/:userId - Отримати пости користувача
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({ 
      author: userId, 
      isDeleted: false 
    })
    .populate('author', 'name avatar')
    .populate('comments.author', 'name avatar')
    .populate('reactions.userId', 'name')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/posts - Отримати стрічку постів
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const limitNum = Math.min(parseInt(limit) || 10, 20);
    const pageNum = Math.max(parseInt(page) || 1, 1);

    const posts = await Post.find({ isDeleted: false })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limitNum + 1)
      .skip((pageNum - 1) * limitNum)
      .lean();

    const hasMore = posts.length > limitNum;
    const postsToReturn = hasMore ? posts.slice(0, limitNum) : posts;

    const formattedPosts = postsToReturn.map(post => ({
      id: post._id,
      image: post.images?.[0]?.url || null,
      title: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
      description: post.content,
      location: post.location || 'Невідоме місце',
      author: {
        id: post.author._id,
        name: post.author.name,
        avatar: post.author.avatar
      },
      stats: {
        likes: post.reactions.filter(r => r.type === 'like').length,
        dislikes: post.reactions.filter(r => r.type === 'dislike').length,
        comments: post.comments.length
      },
      createdAt: post.createdAt
    }));

    res.json({ 
      success: true, 
      posts: formattedPosts,
      hasMore,
      page: pageNum,
      total: formattedPosts.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});



// POST /api/posts - Створити новий пост
router.post('/', authenticateToken, postRateLimit, validateInput, sanitizeInput, async (req, res) => {
  try {
    const { content, images, type, location, mood } = req.body;

    const post = new Post({
      author: req.user._id,
      content,
      images: images || [],
      type: type || 'text',
      location,
      mood
    });

    await post.save();
    await post.populate('author', 'name avatar');

    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/posts/:postId - Оновити пост
router.put('/:postId', authenticateToken, validateInput, sanitizeInput, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, location, mood } = req.body;

    const post = await Post.findById(postId);
    if (!post || post.isDeleted) {
      return res.status(404).json({ success: false, error: 'Пост не знайдено' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Немає прав для редагування' });
    }

    post.content = content;
    post.location = location;
    post.mood = mood;
    
    await post.save();
    await post.populate('author', 'name avatar');

    res.json({ success: true, post });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/posts/:postId - Видалити пост
router.delete('/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post || post.isDeleted) {
      return res.status(404).json({ success: false, error: 'Пост не знайдено' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Немає прав для видалення' });
    }

    post.isDeleted = true;
    await post.save();

    res.json({ success: true, message: 'Пост видалено' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/posts/:postId/reactions - Додати/змінити реакцію
router.post('/:postId/reactions', optionalAuth, reactionRateLimit, async (req, res) => {
  try {
    const { postId } = req.params;
    const { type } = req.body;
    const userId = req.user?._id || new require('mongoose').Types.ObjectId('507f1f77bcf86cd799439011');

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Пост не знайдено' });
    }

    // Видалити попередню реакцію користувача
    post.reactions = post.reactions.filter(r => r.userId.toString() !== userId.toString());

    // Додати нову реакцію якщо type не null
    if (type && ['like', 'dislike'].includes(type)) {
      post.reactions.push({ userId, type });
    }

    await post.save();
    
    // Підрахунок лайків та дизлайків
    const likes = post.reactions.filter(r => r.type === 'like').length;
    const dislikes = post.reactions.filter(r => r.type === 'dislike').length;
    const userReaction = post.reactions.find(r => r.userId.toString() === userId.toString())?.type || null;
    
    res.json({ 
      success: true, 
      stats: { likes, dislikes },
      userReaction
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/posts/:postId/comments - Отримати коментарі поста
router.get('/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const { offset = 0, limit = 10 } = req.query;
    const offsetNum = parseInt(offset);
    const limitNum = parseInt(limit);

    const post = await Post.findById(postId)
      .populate({
        path: 'comments.author',
        select: 'name avatar'
      });

    if (!post) {
      return res.status(404).json({ success: false, error: 'Пост не знайдено' });
    }

    // Сортуємо коментарі за датою (найновіші спочатку)
    const sortedComments = post.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const totalComments = sortedComments.length;
    const paginatedComments = sortedComments.slice(offsetNum, offsetNum + limitNum);
    const hasMore = offsetNum + limitNum < totalComments;

    res.json({
      success: true,
      comments: paginatedComments,
      hasMore,
      total: totalComments
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/posts/:postId/comments - Додати коментар
router.post('/:postId/comments', authenticateToken, commentRateLimit, validateInput, sanitizeInput, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const authorId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Коментар не може бути порожнім' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Пост не знайдено' });
    }

    post.comments.push({
      author: authorId,
      content: content.trim()
    });

    await post.save();
    await post.populate('comments.author', 'name avatar');

    const newComment = post.comments[post.comments.length - 1];
    
    res.status(201).json({ 
      success: true, 
      comment: newComment,
      totalComments: post.comments.length
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/posts/:postId/comments/:commentId/replies - Додати відповідь
router.post('/:postId/comments/:commentId/replies', async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { content, authorId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Пост не знайдено' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, error: 'Коментар не знайдено' });
    }

    comment.replies.push({
      author: authorId,
      content
    });

    await post.save();
    await post.populate('comments.replies.author', 'name avatar');

    res.status(201).json({ success: true, comment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/posts/:postId/share - Поділитися постом
router.post('/:postId/share', async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Пост не знайдено' });
    }

    post.shares += 1;
    await post.save();

    res.json({ success: true, shares: post.shares });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/posts/:postId/save - Зберегти/видалити пост
router.post('/:postId/save', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post || post.isDeleted) {
      return res.status(404).json({ success: false, error: 'Пост не знайдено' });
    }

    const existingSave = await SavedPost.findOne({ userId, postId });
    
    if (existingSave) {
      // Видаляємо зі збережених
      await SavedPost.deleteOne({ userId, postId });
      res.json({ success: true, saved: false });
    } else {
      // Додаємо до збережених
      await SavedPost.create({ userId, postId });
      res.json({ success: true, saved: true });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/posts/stats - Отримати актуальну статистику постів
router.get('/stats', async (req, res) => {
  try {
    const { postIds } = req.query; // Масив ID постів
    
    if (!postIds) {
      return res.status(400).json({ success: false, error: 'Не вказано ID постів' });
    }

    const idsArray = Array.isArray(postIds) ? postIds : postIds.split(',');
    
    const posts = await Post.find({ 
      _id: { $in: idsArray },
      isDeleted: false 
    }).select('_id reactions comments');

    const stats = {};
    posts.forEach(post => {
      stats[post._id] = {
        likes: post.reactions.filter(r => r.type === 'like').length,
        dislikes: post.reactions.filter(r => r.type === 'dislike').length,
        comments: post.comments.length
      };
    });

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/users/:userId/saved-posts - Отримати збережені пости
router.get('/users/:userId/saved-posts', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);

    const savedPosts = await SavedPost.find({ userId })
      .populate({
        path: 'postId',
        populate: {
          path: 'author',
          select: 'name avatar'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limitNum + 1)
      .skip((pageNum - 1) * limitNum);

    const hasMore = savedPosts.length > limitNum;
    const postsToReturn = hasMore ? savedPosts.slice(0, limitNum) : savedPosts;

    const formattedPosts = postsToReturn
      .filter(savedPost => savedPost.postId && !savedPost.postId.isDeleted)
      .map(savedPost => {
        const post = savedPost.postId;
        return {
          id: post._id,
          image: post.images?.[0]?.url || null,
          title: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
          description: post.content,
          location: post.location || 'Невідоме місце',
          author: {
            id: post.author._id,
            name: post.author.name,
            avatar: post.author.avatar
          },
          stats: {
            likes: post.reactions.filter(r => r.type === 'like').length,
            dislikes: post.reactions.filter(r => r.type === 'dislike').length,
            comments: post.comments.length
          },
          createdAt: post.createdAt,
          savedAt: savedPost.createdAt
        };
      });

    res.json({ 
      success: true, 
      posts: formattedPosts,
      hasMore,
      page: pageNum,
      total: formattedPosts.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
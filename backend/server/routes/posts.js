const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

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
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);

    const posts = await Post.find({ isDeleted: false })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limitNum + 1) // +1 для перевірки hasMore
      .skip((pageNum - 1) * limitNum);

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
router.post('/', async (req, res) => {
  try {
    const { content, images, type, location, mood, authorId } = req.body;

    const post = new Post({
      author: authorId,
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
router.put('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, location, mood, userId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Пост не знайдено' });
    }

    if (post.author.toString() !== userId) {
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
router.delete('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Пост не знайдено' });
    }

    if (post.author.toString() !== userId) {
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
router.post('/:postId/reactions', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, type } = req.body; // type: 'like', 'dislike', або null для видалення

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Пост не знайдено' });
    }

    // Видалити попередню реакцію користувача
    post.reactions = post.reactions.filter(r => r.userId.toString() !== userId);

    // Додати нову реакцію якщо type не null
    if (type && ['like', 'dislike'].includes(type)) {
      post.reactions.push({ userId, type });
    }

    await post.save();
    
    // Підрахунок лайків та дизлайків
    const likes = post.reactions.filter(r => r.type === 'like').length;
    const dislikes = post.reactions.filter(r => r.type === 'dislike').length;
    const userReaction = post.reactions.find(r => r.userId.toString() === userId)?.type || null;
    
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
router.post('/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, authorId } = req.body;

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

module.exports = router;
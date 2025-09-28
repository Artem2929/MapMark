const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

// GET /api/posts/:userId - Отримати пости користувача
router.get('/:userId', async (req, res) => {
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
    const { userId, type } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Пост не знайдено' });
    }

    // Видалити попередню реакцію користувача
    post.reactions = post.reactions.filter(r => r.userId.toString() !== userId);

    // Додати нову реакцію
    if (type) {
      post.reactions.push({ userId, type });
    }

    await post.save();
    res.json({ success: true, reactions: post.reactions });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/posts/:postId/comments - Додати коментар
router.post('/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, authorId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Пост не знайдено' });
    }

    post.comments.push({
      author: authorId,
      content
    });

    await post.save();
    await post.populate('comments.author', 'name avatar');

    res.status(201).json({ 
      success: true, 
      comment: post.comments[post.comments.length - 1] 
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
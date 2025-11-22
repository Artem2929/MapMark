const express = require('express');
const router = express.Router();

// Mock posts data
let posts = {};

// Like/unlike post
router.post('/:postId/like', (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;
  
  if (!posts[postId]) {
    posts[postId] = {
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: [],
      comments: [],
      shares: 0
    };
  }
  
  const post = posts[postId];
  const isLiked = post.likedBy.includes(userId);
  
  if (isLiked) {
    post.likes--;
    post.likedBy = post.likedBy.filter(id => id !== userId);
  } else {
    post.likes++;
    post.likedBy.push(userId);
    // Remove from dislikes if present
    if (post.dislikedBy.includes(userId)) {
      post.dislikes--;
      post.dislikedBy = post.dislikedBy.filter(id => id !== userId);
    }
  }
  
  res.json({
    success: true,
    data: {
      likes: post.likes,
      dislikes: post.dislikes,
      liked: !isLiked,
      disliked: false
    }
  });
});

// Dislike/undislike post
router.post('/:postId/dislike', (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;
  
  if (!posts[postId]) {
    posts[postId] = {
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: [],
      comments: [],
      shares: 0
    };
  }
  
  const post = posts[postId];
  const isDisliked = post.dislikedBy.includes(userId);
  
  if (isDisliked) {
    post.dislikes--;
    post.dislikedBy = post.dislikedBy.filter(id => id !== userId);
  } else {
    post.dislikes++;
    post.dislikedBy.push(userId);
    // Remove from likes if present
    if (post.likedBy.includes(userId)) {
      post.likes--;
      post.likedBy = post.likedBy.filter(id => id !== userId);
    }
  }
  
  res.json({
    success: true,
    data: {
      likes: post.likes,
      dislikes: post.dislikes,
      liked: false,
      disliked: !isDisliked
    }
  });
});

// Add comment to post
router.post('/:postId/comments', (req, res) => {
  const { postId } = req.params;
  const { userId, text } = req.body;
  
  if (!posts[postId]) {
    posts[postId] = {
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: [],
      comments: [],
      shares: 0
    };
  }
  
  const newComment = {
    id: Date.now().toString(),
    userId,
    author: 'Користувач', // In real app, get from user data
    text,
    createdAt: new Date().toISOString()
  };
  
  posts[postId].comments.push(newComment);
  
  res.json({
    success: true,
    data: newComment
  });
});

// Increment share count
router.post('/:postId/share', (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;
  
  if (!posts[postId]) {
    posts[postId] = {
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: [],
      comments: [],
      shares: 0
    };
  }
  
  posts[postId].shares++;
  
  res.json({
    success: true,
    data: {
      shares: posts[postId].shares
    }
  });
});

module.exports = router;
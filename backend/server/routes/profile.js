const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const WallPost = require('../models/WallPost');
const router = express.Router();

// Create uploads directory
const uploadsDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });



// Get user profile
router.get('/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update user profile
router.put('/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Upload avatar
router.put('/:userId/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarPath;
    await user.save();
    
    res.json({
      success: true,
      data: { 
        avatarUrl: avatarPath,
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});







// Get wall posts
router.get('/:userId/wall', async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentUserId } = req.query;
    
    const posts = await WallPost.find({ userId }).sort({ createdAt: -1 });
    
    const postsWithLikeStatus = posts.map(post => ({
      ...post.toObject(),
      id: post._id.toString(),
      date: new Date(post.createdAt).toLocaleDateString('uk-UA'),
      liked: post.likedBy?.includes(currentUserId) || false,
      disliked: post.dislikedBy?.includes(currentUserId) || false
    }));
    
    res.json({
      success: true,
      data: postsWithLikeStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create wall post
router.post('/:userId/wall', async (req, res) => {
  try {
    const { userId } = req.params;
    const { content, images, files, hashtags, location } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const newPost = new WallPost({
      author: user.name,
      userId,
      content,
      images: images || [],
      files: files || [],
      hashtags: hashtags || '',
      location: location || null
    });
    
    await newPost.save();
    
    res.json({
      success: true,
      data: newPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Like/unlike post
router.post('/posts/:postId/like', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    
    const post = await WallPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    const isLiked = post.likedBy.includes(userId);
    const isDisliked = post.dislikedBy.includes(userId);
    
    if (isLiked) {
      // Remove like
      post.likedBy = post.likedBy.filter(id => id !== userId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      // Add like
      post.likedBy.push(userId);
      post.likes += 1;
      
      // Remove dislike if exists
      if (isDisliked) {
        post.dislikedBy = post.dislikedBy.filter(id => id !== userId);
        post.dislikes = Math.max(0, post.dislikes - 1);
      }
    }
    
    await post.save();
    
    res.json({
      success: true,
      data: {
        liked: !isLiked,
        likes: post.likes,
        dislikes: post.dislikes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Dislike/undislike post
router.post('/posts/:postId/dislike', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    
    const post = await WallPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    const isLiked = post.likedBy.includes(userId);
    const isDisliked = post.dislikedBy.includes(userId);
    
    if (isDisliked) {
      // Remove dislike
      post.dislikedBy = post.dislikedBy.filter(id => id !== userId);
      post.dislikes = Math.max(0, post.dislikes - 1);
    } else {
      // Add dislike
      post.dislikedBy.push(userId);
      post.dislikes += 1;
      
      // Remove like if exists
      if (isLiked) {
        post.likedBy = post.likedBy.filter(id => id !== userId);
        post.likes = Math.max(0, post.likes - 1);
      }
    }
    
    await post.save();
    
    res.json({
      success: true,
      data: {
        disliked: !isDisliked,
        likes: post.likes,
        dislikes: post.dislikes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update post
router.put('/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, content } = req.body;
    
    const post = await WallPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    if (post.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this post'
      });
    }
    
    post.content = content;
    await post.save();
    
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete post
router.delete('/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    
    const post = await WallPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    if (post.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }
    
    await WallPost.findByIdAndDelete(postId);
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Add comment to post
router.post('/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, text } = req.body;
    
    const post = await WallPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const newComment = {
      author: user.name,
      userId: user._id.toString(),
      avatar: user.avatar,
      text: text.trim(),
      date: new Date().toLocaleDateString('uk-UA')
    };
    
    post.comments.push(newComment);
    await post.save();
    
    res.json({
      success: true,
      data: newComment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Increment share count
router.post('/posts/:postId/share', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    
    const post = await WallPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    post.shares = (post.shares || 0) + 1;
    await post.save();
    
    res.json({
      success: true,
      data: {
        shares: post.shares
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Follow/unfollow user
router.post('/:userId/follow/:targetUserId', async (req, res) => {
  try {
    const { userId, targetUserId } = req.params;
    
    if (userId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself'
      });
    }
    
    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);
    
    if (!user || !targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Initialize arrays if they don't exist
    if (!user.following) user.following = [];
    if (!targetUser.followers) targetUser.followers = [];
    
    const isFollowing = user.following.includes(targetUserId);
    
    if (isFollowing) {
      // Unfollow
      user.following = user.following.filter(id => id.toString() !== targetUserId);
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId);
    } else {
      // Follow
      user.following.push(targetUserId);
      targetUser.followers.push(userId);
    }
    
    await user.save();
    await targetUser.save();
    
    res.json({
      success: true,
      data: { isFollowing: !isFollowing }
    });
  } catch (error) {
    console.error('Follow/unfollow error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get followers
router.get('/:userId/followers', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user.followers || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get following
router.get('/:userId/following', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user.following || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Check if user is following another user
router.get('/:userId/following/:targetUserId', async (req, res) => {
  try {
    const { userId, targetUserId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const isFollowing = user.following?.includes(targetUserId) || false;
    
    res.json({
      success: true,
      isFollowing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
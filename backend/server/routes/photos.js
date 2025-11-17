const express = require('express');
const multer = require('multer');
const Photo = require('../models/Photo');
const PhotoLike = require('../models/PhotoLike');
const PhotoComment = require('../models/PhotoComment');
const CommentLike = require('../models/CommentLike');
const User = require('../models/User');
const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload photo
router.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    const { description, userId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required' });
    }

    // Convert to base64 for storage
    const base64Data = req.file.buffer.toString('base64');
    const photoUrl = `data:${req.file.mimetype};base64,${base64Data}`;
    
    // Save to database
    const photo = new Photo({
      userId,
      url: photoUrl,
      description: typeof description === 'string' ? description : '',
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
    
    await photo.save();
    
    res.json({
      success: true,
      data: {
        id: photo._id,
        url: photoUrl,
        description: photo.description,
        createdAt: photo.createdAt
      }
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// Get user photos with stats
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const photos = await Photo.find({ userId })
      .sort({ createdAt: -1 })
      .select('_id url description createdAt');
    
    // Get stats for each photo
    const photosWithStats = await Promise.all(photos.map(async (photo) => {
      const [likes, dislikes, comments] = await Promise.all([
        PhotoLike.countDocuments({ photoId: photo._id, type: 'like' }),
        PhotoLike.countDocuments({ photoId: photo._id, type: 'dislike' }),
        PhotoComment.countDocuments({ photoId: photo._id })
      ]);
      
      const photoObj = photo.toObject();
      return {
        ...photoObj,
        description: typeof photoObj.description === 'string' ? photoObj.description : '',
        stats: { likes, dislikes, comments }
      };
    }));
    
    res.json({
      success: true,
      data: photosWithStats
    });
  } catch (error) {
    console.error('Fetch photos error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch photos' });
  }
});

// Delete photo
router.delete('/:photoId', async (req, res) => {
  try {
    const { photoId } = req.params;
    
    // Get photo info first
    const photo = await Photo.findById(photoId);
    
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }
    
    // Delete from database (no file to delete since we use base64)
    await Photo.findByIdAndDelete(photoId);
    
    res.json({ success: true, message: 'Photo deleted' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete photo' });
  }
});

// Update photo description
router.put('/:photoId', async (req, res) => {
  try {
    const { photoId } = req.params;
    const { description } = req.body;
    
    if (typeof description !== 'string') {
      return res.status(400).json({ success: false, message: 'Description must be a string' });
    }
    
    if (description.length > 1000) {
      return res.status(400).json({ success: false, message: 'Description too long' });
    }
    
    const photo = await Photo.findByIdAndUpdate(
      photoId,
      { description: description.trim() },
      { new: true }
    );
    
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }
    
    res.json({ success: true, data: photo });
  } catch (error) {
    console.error('Update photo error:', error);
    res.status(500).json({ success: false, message: 'Failed to update photo' });
  }
});

// Like/dislike photo
router.post('/:photoId/like', async (req, res) => {
  try {
    const { photoId } = req.params;
    const { userId, type } = req.body; // type: 'like' or 'dislike'
    
    // Remove existing like/dislike
    await PhotoLike.deleteOne({ photoId, userId });
    
    // Add new like/dislike if provided
    if (type) {
      await PhotoLike.create({ photoId, userId, type });
    }
    
    // Get updated counts
    const [likes, dislikes] = await Promise.all([
      PhotoLike.countDocuments({ photoId, type: 'like' }),
      PhotoLike.countDocuments({ photoId, type: 'dislike' })
    ]);
    
    res.json({ success: true, data: { likes, dislikes } });
  } catch (error) {
    console.error('Photo like error:', error);
    res.status(500).json({ success: false, message: 'Failed to update like' });
  }
});

// Get photo comments
router.get('/:photoId/comments', async (req, res) => {
  try {
    const { photoId } = req.params;
    
    const comments = await PhotoComment.find({ photoId })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: comments });
  } catch (error) {
    console.error('Fetch comments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  }
});

// Add comment
router.post('/:photoId/comments', async (req, res) => {
  try {
    const { photoId } = req.params;
    const { userId, text } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }
    
    if (text.trim().length > 500) {
      return res.status(400).json({ success: false, message: 'Comment too long' });
    }
    
    const comment = await PhotoComment.create({
      photoId,
      userId,
      text: text.trim()
    });
    
    const populatedComment = await PhotoComment.findById(comment._id)
      .populate('userId', 'name avatar');
    
    res.json({ success: true, data: populatedComment });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
});

// Like/dislike comment
router.post('/comments/:commentId/like', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId, type } = req.body;
    
    // Remove existing like/dislike
    const existingLike = await CommentLike.findOne({ commentId, userId });
    if (existingLike) {
      // Update comment counts
      if (existingLike.type === 'like') {
        await PhotoComment.findByIdAndUpdate(commentId, { $inc: { likes: -1 } });
      } else {
        await PhotoComment.findByIdAndUpdate(commentId, { $inc: { dislikes: -1 } });
      }
      await CommentLike.deleteOne({ commentId, userId });
    }
    
    // Add new like/dislike if different from existing
    if (type && (!existingLike || existingLike.type !== type)) {
      await CommentLike.create({ commentId, userId, type });
      if (type === 'like') {
        await PhotoComment.findByIdAndUpdate(commentId, { $inc: { likes: 1 } });
      } else {
        await PhotoComment.findByIdAndUpdate(commentId, { $inc: { dislikes: 1 } });
      }
    }
    
    const comment = await PhotoComment.findById(commentId);
    res.json({ success: true, data: { likes: comment.likes, dislikes: comment.dislikes } });
  } catch (error) {
    console.error('Comment like error:', error);
    res.status(500).json({ success: false, message: 'Failed to update comment like' });
  }
});

module.exports = router;
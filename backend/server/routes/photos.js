const express = require('express');
const multer = require('multer');
const Photo = require('../models/Photo');
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
      description: description || '',
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

// Get user photos
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const photos = await Photo.find({ userId })
      .sort({ createdAt: -1 })
      .select('_id url description createdAt');
    
    res.json({
      success: true,
      data: photos
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

module.exports = router;
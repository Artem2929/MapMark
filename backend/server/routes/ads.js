const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Ad = require('../models/Ad');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/ads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Validation middleware
const validateAd = (req, res, next) => {
  const { title, description, category, subcategory, country, city, address, details, price, currency } = req.body;
  const errors = {};

  if (!title || title.trim().length === 0) errors.title = 'Title is required';
  if (title && title.length > 100) errors.title = 'Title cannot exceed 100 characters';
  
  if (!description || description.trim().length < 10) errors.description = 'Description must be at least 10 characters';
  if (description && description.length > 1000) errors.description = 'Description cannot exceed 1000 characters';
  
  if (!category) errors.category = 'Category is required';
  if (!subcategory) errors.subcategory = 'Subcategory is required';
  if (!country) errors.country = 'Country is required';
  if (!city) errors.city = 'City is required';
  if (!address || address.trim().length === 0) errors.address = 'Address is required';
  if (address && address.length > 200) errors.address = 'Address cannot exceed 200 characters';
  if (!details) errors.details = 'Details are required';
  
  if (!price || isNaN(price) || parseFloat(price) <= 0) errors.price = 'Valid price is required';
  if (!currency) errors.currency = 'Currency is required';
  
  if (!req.body.contactPhone && !req.body.contactEmail) {
    errors.contact = 'Phone or email is required';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  
  next();
};

// Create new ad
router.post('/', upload.array('photos', 5), validateAd, async (req, res) => {
  try {
    const adData = {
      ...req.body,
      price: parseFloat(req.body.price),
      photos: req.files ? req.files.map(file => ({
        url: `/uploads/ads/${file.filename}`,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype
      })) : []
    };

    const ad = new Ad(adData);
    await ad.save();

    res.status(201).json({
      success: true,
      message: 'Ad created successfully',
      data: ad
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating ad',
      error: error.message
    });
  }
});

// Get all ads with filtering
router.get('/', async (req, res) => {
  try {
    const { category, country, city, status = 'active', page = 1, limit = 20 } = req.query;
    const filter = { status };

    if (category) filter.category = category;
    if (country) filter.country = country;
    if (city) filter.city = city;

    const ads = await Ad.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Ad.countDocuments(filter);

    res.json({
      success: true,
      data: ads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ads',
      error: error.message
    });
  }
});

// Get single ad by ID
router.get('/:id', async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }

    // Increment views
    ad.views += 1;
    await ad.save();

    res.json({
      success: true,
      data: ad
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ad',
      error: error.message
    });
  }
});

// Update ad
router.put('/:id', upload.array('photos', 5), validateAd, async (req, res) => {
  try {
    const adData = {
      ...req.body,
      price: parseFloat(req.body.price),
      updatedAt: new Date()
    };

    if (req.files && req.files.length > 0) {
      adData.photos = req.files.map(file => ({
        url: `/uploads/ads/${file.filename}`,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype
      }));
    }

    const ad = await Ad.findByIdAndUpdate(req.params.id, adData, { new: true });
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }

    res.json({
      success: true,
      message: 'Ad updated successfully',
      data: ad
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating ad',
      error: error.message
    });
  }
});

// Delete ad
router.delete('/:id', async (req, res) => {
  try {
    const ad = await Ad.findByIdAndDelete(req.params.id);
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }

    // Delete associated files
    if (ad.photos && ad.photos.length > 0) {
      ad.photos.forEach(photo => {
        const filePath = path.join(__dirname, '../uploads/ads', photo.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    res.json({
      success: true,
      message: 'Ad deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting ad',
      error: error.message
    });
  }
});

module.exports = router;
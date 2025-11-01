const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require("multer");
const { createReviewHandler, getReviewsHandler, getReviewsByLocationHandler, getPhotoHandler, deleteReviewHandler, deletePhotoHandler, getUserStatsHandler, likeReviewHandler, dislikeReviewHandler, addCommentHandler } = require('./services/ReviewService');
const { getReviews } = require('./Repositories/ReviewRepository');
const { getUserStatsHandler: userStatsHandler, getUserFollowersHandler, getUserFollowingHandler, followUserHandler, unfollowUserHandler } = require('./services/UserStatsService');
const { getUserProfileHandler, updateUserProfileHandler } = require('./services/UserService');
const { getAboutStatsHandler, getTeamMembersHandler, submitContactMessageHandler, getContactMessagesHandler, markMessageAsReadHandler } = require('./services/AboutService');
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const adsRoutes = require('./routes/ads');
const categoriesRoutes = require('./routes/categories');
const countriesRoutes = require('./routes/countries');
const avatarRoutes = require('./routes/avatar');
const profileRoutes = require('./routes/profile');
const wallPostsRoutes = require('./routes/wallPosts');
const friendsRoutes = require('./routes/friends');
const messagesRoutes = require('./routes/messages');
const photosRoutes = require('./routes/photos');
const servicesRoutes = require('./routes/services');
const filtersRoutes = require('./routes/filters');
const Ad = require('./models/Ad');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL || 'mongodb://127.0.0.1:27017/mapmark';

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Connect to MongoDB
mongoose.connect(DB_URL)
.then(async () => {
  console.log('Connected to MongoDB successfully');
  
  // Ініціалізація фільтрів
  try {
    const Country = require('./models/Country');
    const Region = require('./models/Region');
    
    const countryExists = await Country.findOne({ value: 'ukraine' });
    if (!countryExists) {
      await Country.create({ value: 'ukraine', label: '🇺🇦 Україна', isActive: true });
      
      const regions = [
        { value: 'kyiv-region', label: 'Київська' },
        { value: 'kharkiv-region', label: 'Харківська' },
        { value: 'odesa-region', label: 'Одеська' },
        { value: 'dnipropetrovsk-region', label: 'Дніпропетровська' },
        { value: 'donetsk-region', label: 'Донецька' },
        { value: 'zaporizhzhia-region', label: 'Запорізька' },
        { value: 'lviv-region', label: 'Львівська' },
        { value: 'poltava-region', label: 'Полтавська' },
        { value: 'chernihiv-region', label: 'Чернігівська' },
        { value: 'cherkasy-region', label: 'Черкаська' },
        { value: 'zhytomyr-region', label: 'Житомирська' },
        { value: 'sumy-region', label: 'Сумська' },
        { value: 'rivne-region', label: 'Рівненська' },
        { value: 'khmelnytskyi-region', label: 'Хмельницька' },
        { value: 'vinnytsia-region', label: 'Вінницька' },
        { value: 'ternopil-region', label: 'Тернопільська' },
        { value: 'ivano-frankivsk-region', label: 'Івано-Франківська' },
        { value: 'zakarpattia-region', label: 'Закарпатська' },
        { value: 'chernivtsi-region', label: 'Чернівецька' },
        { value: 'volyn-region', label: 'Волинська' },
        { value: 'kirovohrad-region', label: 'Кіровоградська' },
        { value: 'mykolaiv-region', label: 'Миколаївська' },
        { value: 'kherson-region', label: 'Херсонська' },
        { value: 'luhansk-region', label: 'Луганська' }
      ];
      
      await Region.insertMany(regions.map(r => ({ ...r, countryValue: 'ukraine', isActive: true })));
      console.log('Filters initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing filters:', error);
  }
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/countries', countriesRoutes);
app.use('/api/avatar', avatarRoutes);
app.use('/api/user', profileRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/photos', photosRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/filters', filtersRoutes);
app.use('/api', profileRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ 
    message: 'MapMark API Server is running!',
    version: '1.0.0',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      createReview: 'POST /api/review',
      reviews: '/api/reviews',
      nearbyReviews: '/api/reviews/nearby?lat=40.7128&lng=-74.0060&radius=1000',
      deleteReview: 'DELETE /api/review/:reviewId',
      deletePhoto: 'DELETE /api/review/:reviewId/photo/:photoId',
      userStats: 'GET /api/user/stats',
      userProfile: 'GET /api/user/:userId/profile',
      updateUserProfile: 'PUT /api/user/:userId/profile',
      userReviews: 'GET /api/user/:userId/reviews',
      userProfileStats: 'GET /api/user/:userId/stats',
      userFollowers: 'GET /api/user/:userId/followers',
      userFollowing: 'GET /api/user/:userId/following',
      followUser: 'POST /api/user/:userId/follow',
      unfollowUser: 'DELETE /api/user/:userId/follow',
      health: '/api/health'
    }
  });
});

// Create a review with photos
app.post('/api/review', upload.array('photos', 3), createReviewHandler);
// Get all reviews
app.get('/api/reviews', getReviewsHandler);
// Search reviews by radius
app.get('/api/reviews/nearby', getReviewsByLocationHandler);
// Delete a review by ID
app.delete('/api/review/:reviewId', deleteReviewHandler);
// Delete a photo from a review
app.delete('/api/review/:reviewId/photo/:photoId', deletePhotoHandler);
// Like a review
app.post('/api/review/:reviewId/like', likeReviewHandler);
// Dislike a review
app.post('/api/review/:reviewId/dislike', dislikeReviewHandler);
// Add comment to a review
app.post('/api/review/:reviewId/comment', addCommentHandler);
// Get a single photo as base64
app.get('/api/photo/:photoId', getPhotoHandler);
// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint works' });
});

// User profile endpoints
app.get('/api/user/:userId/profile', getUserProfileHandler);
app.put('/api/user/:userId/profile', updateUserProfileHandler);
app.get('/api/user/:userId/reviews', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Mock reviews data
    const mockReviews = [
      {
        _id: '1',
        username: 'testuser',
        text: 'Чудове місце для відпочинку!',
        rating: 5,
        lat: 50.4501,
        lng: 30.5234,
        country: 'Україна',
        createdAt: new Date('2024-01-15')
      },
      {
        _id: '2', 
        username: 'testuser',
        text: 'Гарний ресторан з смачною їжею',
        rating: 4,
        lat: 49.8397,
        lng: 24.0297,
        country: 'Україна',
        createdAt: new Date('2024-02-01')
      }
    ];
    
    // Get username based on userId
    const username = userId === '68d7f31af5d60ea8afa6962d' ? 'testuser' : userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
    const userReviews = mockReviews.filter(review => review.username === username);
    
    res.json({
      success: true,
      data: userReviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// User stats endpoints
app.get('/api/user/:userId/stats', userStatsHandler);
app.get('/api/user/:userId/followers', getUserFollowersHandler);
app.get('/api/user/:userId/following', getUserFollowingHandler);
app.post('/api/user/:userId/follow', followUserHandler);
app.delete('/api/user/:userId/follow', unfollowUserHandler);

// About page endpoints
app.get('/api/about/stats', getAboutStatsHandler);
app.get('/api/about/team', getTeamMembersHandler);
app.post('/api/about/contact', submitContactMessageHandler);
app.get('/api/about/messages', getContactMessagesHandler);
app.put('/api/about/messages/:messageId/read', markMessageAsReadHandler);

// Admin endpoint to create team members
app.post('/api/admin/team', async (req, res) => {
  try {
    const TeamMember = require('./models/TeamMember');
    const teamMember = new TeamMember(req.body);
    await teamMember.save();
    res.json({ success: true, data: teamMember });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ads CRUD
app.get('/api/ads', async (req, res) => {
  try {
    const { 
      category, 
      subcategory, 
      country, 
      region, 
      search, 
      sortBy = 'createdAt', 
      page = 1, 
      limit = 12,
      lat,
      lng,
      radius = 10000
    } = req.query;
    
    let query = {};
    
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (country) query.country = country;
    if (region) query.region = region;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusInMeters = parseInt(radius);
      
      query.location = {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], radiusInMeters / 6371000]
        }
      };
    }
    
    let sortOptions = {};
    switch (sortBy) {
      case 'rating':
        sortOptions = { overallRating: -1 };
        break;
      case 'popular':
        sortOptions = { isPopular: -1, createdAt: -1 };
        break;
      case 'distance':
        sortOptions = { distance: 1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const ads = await Ad.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Ad.countDocuments(query);
    
    res.json({
      success: true,
      data: ads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ads',
      error: error.message
    });
  }
});

app.post('/api/ads', async (req, res) => {
  try {
    const {
      title,
      address,
      category,
      subcategory,
      shortDescription,
      detailedDescription,
      photos,
      overallRating,
      categoryRatings,
      tags,
      workingHours,
      contacts,
      promoCode,
      isAnonymous,
      location,
      country,
      region
    } = req.body;
    
    if (!title || !address || !category || !shortDescription || !location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    const newAd = new Ad({
      title: title.trim(),
      address: address.trim(),
      category,
      subcategory,
      shortDescription: shortDescription.trim(),
      detailedDescription: detailedDescription?.trim(),
      photos: photos || [],
      overallRating: overallRating || 0,
      categoryRatings: categoryRatings || {},
      tags: tags || [],
      workingHours,
      contacts,
      promoCode,
      isAnonymous: isAnonymous || false,
      lat: location.lat,
      lng: location.lng,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      },
      country,
      region,
      hasPromo: !!promoCode
    });
    
    const savedAd = await newAd.save();
    
    res.status(201).json({
      success: true,
      message: 'Ad created successfully',
      data: savedAd
    });
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating ad',
      error: error.message
    });
  }
});

app.get('/api/ads/:id', async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }
    
    res.json({
      success: true,
      data: ad
    });
  } catch (error) {
    console.error('Error fetching ad:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ad',
      error: error.message
    });
  }
});

app.put('/api/ads/:id', async (req, res) => {
  try {
    const updatedAd = await Ad.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedAd) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Ad updated successfully',
      data: updatedAd
    });
  } catch (error) {
    console.error('Error updating ad:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating ad',
      error: error.message
    });
  }
});

app.delete('/api/ads/:id', async (req, res) => {
  try {
    const deletedAd = await Ad.findByIdAndDelete(req.params.id);
    
    if (!deletedAd) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Ad deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ad:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting ad',
      error: error.message
    });
  }
});

// Photo upload endpoint
app.post('/api/upload/photo', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No photo uploaded'
      });
    }

    // Convert buffer to base64 for simple storage
    const photoData = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    res.json({
      success: true,
      photoUrl: photoData
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading photo',
      error: error.message
    });
  }
});

// Global user stats (for progress widget)
app.get('/api/user/stats', async (req, res) => {
  try {
    const reviews = await getReviews();
    const reviewCount = reviews.length;
    
    res.json({
      success: true,
      data: {
        reviewCount,
        level: Math.floor(reviewCount / 10) + 1,
        progress: Math.min(reviewCount * 10, 100)
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user stats',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Locations API: http://localhost:${PORT}/api/locations`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

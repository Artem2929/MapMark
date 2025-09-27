const User = require('../models/User');
const { getReviews } = require('../Repositories/ReviewRepository');

// Get user profile
async function getUserProfileHandler(req, res) {
  try {
    const { userId } = req.params;
    console.log('Looking for user with ID:', userId);
    
    let user = await User.findById(userId).select('-password');
    console.log('Found user:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found, creating default user');
      const mongoose = require('mongoose');
      
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format'
        });
      }
      
      // Create default user if not found
      user = new User({
        _id: new mongoose.Types.ObjectId(userId),
        email: `user${userId.slice(-4)}@example.com`,
        password: 'defaultpassword123',
        name: 'Новий користувач',
        username: 'user' + userId.slice(-4),
        city: 'Київ',
        country: 'Україна',
        bio: 'Привіт! Я новий користувач MapMark 👋'
      });
      await user.save();
      console.log('Created default user with ID:', userId);
    }

    // Get user reviews count
    const reviews = await getReviews();
    const userReviews = reviews.filter(review => review.username === user.username);

    const profileData = {
      id: user._id,
      name: user.name,
      username: `@${user.username}`,
      avatar: user.avatar,
      city: user.city,
      country: user.country,
      bio: user.bio,
      joinedAt: user.joinedAt,
      stats: {
        posts: userReviews.length,
        followers: user.followers.length,
        following: user.following.length,
        messages: 0
      }
    };

    res.json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
}

// Update user profile
async function updateUserProfileHandler(req, res) {
  try {
    const { userId } = req.params;
    const { name, city, country, bio } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name.trim();
    if (city !== undefined) user.city = city.trim();
    if (country !== undefined) user.country = country.trim();
    if (bio !== undefined) user.bio = bio.trim();

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        city: user.city,
        country: user.country,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user profile',
      error: error.message
    });
  }
}

module.exports = { getUserProfileHandler, updateUserProfileHandler };
const User = require('../models/User');
const { getReviews } = require('../Repositories/ReviewRepository');

// Get user profile
async function getUserProfileHandler(req, res) {
  try {
    const { userId } = req.params;
    console.log('Looking for user with ID:', userId);
    
    const mongoose = require('mongoose');
    let user;
    
    // Try to find by ObjectId first, then by username
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId).select('-password');
    } else {
      // Look for user by username (remove @ if present)
      const username = userId.replace('@', '');
      user = await User.findOne({ username }).select('-password');
    }
    
    console.log('Found user:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found, creating default user');
      
      // Create username from userId
      const username = userId.replace('@', '');
      
      // Check if user with this email already exists
      const existingUser = await User.findOne({ email: `${username}@example.com` });
      if (existingUser) {
        user = existingUser;
        console.log('Found existing user with email:', existingUser.email);
      } else {
        // Create default user if not found
        user = new User({
          email: `${username}@example.com`,
          name: 'Новий користувач',
          username: username,
          city: 'Київ',
          country: 'Україна',
          bio: 'Привіт! Я новий користувач MapMark 👋'
        });
        await user.save();
        console.log('Created default user with username:', username);
      }
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
      gender: user.gender,
      birthDate: user.birthDate,
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
    const { name, city, country, bio, gender, birthDate } = req.body;

    const mongoose = require('mongoose');
    let user;
    
    // Try to find by ObjectId first, then by username
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    } else {
      // Look for user by username (remove @ if present)
      const username = userId.replace('@', '');
      user = await User.findOne({ username });
    }

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
    if (gender !== undefined) user.gender = gender;
    if (birthDate !== undefined) user.birthDate = new Date(birthDate);

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        city: user.city,
        country: user.country,
        bio: user.bio,
        gender: user.gender,
        birthDate: user.birthDate
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
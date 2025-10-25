const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Friendship = require('../models/Friendship');

// Search users
router.get('/search', async (req, res) => {
  try {
    const { query, country, city, age, limit = 20, offset = 0 } = req.query;
    const currentUserId = req.headers['x-user-id'] || req.query.currentUserId;

    if (!query || query.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }

    // Build search criteria
    const searchCriteria = {
      $and: [
        {
          $or: [
            { firstName: { $regex: query, $options: 'i' } },
            { lastName: { $regex: query, $options: 'i' } },
            { name: { $regex: query, $options: 'i' } }
          ]
        },
        { _id: { $ne: currentUserId } }, // Exclude current user
        { isActive: true }
      ]
    };

    // Add filters
    if (country) {
      const countryMap = { 'ua': 'Україна', 'pl': 'Польща', 'de': 'Німеччина' };
      searchCriteria.$and.push({ country: countryMap[country] });
    }

    if (city) {
      searchCriteria.$and.push({ city });
    }

    if (age) {
      const [minAge, maxAge] = age.split('-').map(Number);
      searchCriteria.$and.push({ age: { $gte: minAge, $lte: maxAge } });
    }

    // Find users
    const users = await User.find(searchCriteria)
      .select('firstName lastName name age country city avatar isOnline lastSeen')
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .sort({ isOnline: -1, lastSeen: -1 });

    // Get friendship statuses
    const userIds = users.map(user => user._id);
    const friendships = await Friendship.find({
      $or: [
        { requester: currentUserId, recipient: { $in: userIds } },
        { requester: { $in: userIds }, recipient: currentUserId }
      ]
    });

    // Map friendship statuses
    const friendshipMap = {};
    friendships.forEach(friendship => {
      const otherUserId = friendship.requester.toString() === currentUserId 
        ? friendship.recipient.toString() 
        : friendship.requester.toString();
      
      friendshipMap[otherUserId] = {
        status: friendship.status,
        isRequester: friendship.requester.toString() === currentUserId
      };
    });

    // Format response
    const formattedUsers = users.map(user => {
      const friendship = friendshipMap[user._id.toString()];
      
      return {
        id: user._id,
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ')[1] || '',
        age: user.age,
        country: user.country,
        city: user.city,
        avatar: user.avatar,
        status: user.isOnline ? 'online' : 'offline',
        lastSeen: user.lastSeen,
        isFriend: friendship?.status === 'accepted',
        requestSent: friendship?.status === 'pending' && friendship?.isRequester,
        requestReceived: friendship?.status === 'pending' && !friendship?.isRequester
      };
    });

    res.json({ success: true, data: formattedUsers });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user's friends
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.headers['x-user-id'] || req.query.currentUserId;

    const friendships = await Friendship.find({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    }).populate('requester recipient', 'firstName lastName name age country city avatar isOnline lastSeen');

    const friends = friendships.map(friendship => {
      const friend = friendship.requester._id.toString() === userId 
        ? friendship.recipient 
        : friendship.requester;
      
      return {
        id: friend._id,
        name: friend.firstName && friend.lastName 
          ? `${friend.firstName} ${friend.lastName}` 
          : friend.name,
        firstName: friend.firstName,
        lastName: friend.lastName,
        age: friend.age,
        country: friend.country,
        city: friend.city,
        avatar: friend.avatar,
        isOnline: friend.isOnline,
        lastSeen: friend.lastSeen,
        mutualFriends: 0 // TODO: Calculate mutual friends
      };
    });

    res.json({ success: true, data: friends });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get friend requests
router.get('/:userId/requests', async (req, res) => {
  try {
    const { userId } = req.params;

    const requests = await Friendship.find({
      recipient: userId,
      status: 'pending'
    }).populate('requester', 'firstName lastName name age country city avatar');

    const formattedRequests = requests.map(request => ({
      id: request.requester._id,
      name: request.requester.firstName && request.requester.lastName 
        ? `${request.requester.firstName} ${request.requester.lastName}` 
        : request.requester.name,
      firstName: request.requester.firstName,
      lastName: request.requester.lastName,
      age: request.requester.age,
      country: request.requester.country,
      city: request.requester.city,
      avatar: request.requester.avatar,
      requestDate: request.createdAt,
      mutualFriends: 0 // TODO: Calculate mutual friends
    }));

    res.json({ success: true, data: formattedRequests });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send friend request
router.post('/:userId/request', async (req, res) => {
  try {
    const { userId } = req.params; // recipient
    const { requesterId } = req.body;

    if (userId === requesterId) {
      return res.status(400).json({ success: false, error: 'Cannot send friend request to yourself' });
    }

    // Check if friendship already exists
    const existingFriendship = await Friendship.findOne({
      $or: [
        { requester: requesterId, recipient: userId },
        { requester: userId, recipient: requesterId }
      ]
    });

    if (existingFriendship) {
      return res.status(400).json({ 
        success: false, 
        error: 'Friendship request already exists' 
      });
    }

    // Create new friendship request
    const friendship = new Friendship({
      requester: requesterId,
      recipient: userId,
      status: 'pending'
    });

    await friendship.save();

    res.json({ success: true, message: 'Friend request sent' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Accept friend request
router.post('/:userId/accept', async (req, res) => {
  try {
    const { userId } = req.params; // requester
    const { recipientId } = req.body;

    const friendship = await Friendship.findOneAndUpdate(
      { requester: userId, recipient: recipientId, status: 'pending' },
      { status: 'accepted', updatedAt: new Date() },
      { new: true }
    );

    if (!friendship) {
      return res.status(404).json({ success: false, error: 'Friend request not found' });
    }

    res.json({ success: true, message: 'Friend request accepted' });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reject friend request
router.post('/:userId/reject', async (req, res) => {
  try {
    const { userId } = req.params; // requester
    const { recipientId } = req.body;

    await Friendship.findOneAndDelete({
      requester: userId,
      recipient: recipientId,
      status: 'pending'
    });

    res.json({ success: true, message: 'Friend request rejected' });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove friend
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentUserId } = req.body;

    await Friendship.findOneAndDelete({
      $or: [
        { requester: currentUserId, recipient: userId },
        { requester: userId, recipient: currentUserId }
      ],
      status: 'accepted'
    });

    res.json({ success: true, message: 'Friend removed' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
// Mock reviews data
const mockReviews = [
  {
    _id: '1',
    username: 'testuser',
    text: 'Чудове місце для відпочинку!',
    rating: 5,
    lat: 50.4501,
    lng: 30.5234,
    createdAt: new Date('2024-01-15')
  },
  {
    _id: '2', 
    username: 'testuser',
    text: 'Гарний ресторан з смачною їжею',
    rating: 4,
    lat: 49.8397,
    lng: 24.0297,
    createdAt: new Date('2024-02-01')
  }
];

async function getUserStatsHandler(req, res) {
  try {
    const { userId } = req.params;
    
    // Mock user data
    const username = userId === '68d7f31af5d60ea8afa6962d' ? 'testuser' : userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
    const userReviews = mockReviews.filter(review => review.username === username);
    
    const stats = {
      messages: 0,
      posts: userReviews.length,
      followers: 12,
      following: 8
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user stats',
      error: error.message
    });
  }
}

async function getUserFollowersHandler(req, res) {
  try {
    const { userId } = req.params;
    
    // Mock data - implement with real database when follow system is ready
    const followers = [];

    res.json({
      success: true,
      count: followers.length,
      data: followers
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching followers',
      error: error.message
    });
  }
}

async function getUserFollowingHandler(req, res) {
  try {
    const { userId } = req.params;
    
    // Mock data - implement with real database when follow system is ready
    const following = [];

    res.json({
      success: true,
      count: following.length,
      data: following
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching following',
      error: error.message
    });
  }
}

async function followUserHandler(req, res) {
  try {
    const { userId } = req.params;
    const { followerId } = req.body;
    
    // Mock implementation - add to real database when follow system is ready
    res.json({
      success: true,
      message: 'User followed successfully',
      data: {
        userId,
        followerId,
        followedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({
      success: false,
      message: 'Error following user',
      error: error.message
    });
  }
}

async function unfollowUserHandler(req, res) {
  try {
    const { userId } = req.params;
    const { followerId } = req.body;
    
    // Mock implementation - remove from real database when follow system is ready
    res.json({
      success: true,
      message: 'User unfollowed successfully',
      data: {
        userId,
        followerId,
        unfollowedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({
      success: false,
      message: 'Error unfollowing user',
      error: error.message
    });
  }
}

module.exports = {
  getUserStatsHandler,
  getUserFollowersHandler,
  getUserFollowingHandler,
  followUserHandler,
  unfollowUserHandler
};
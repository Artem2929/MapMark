const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Mock data
const mockUsers = {
  '68d7f31af5d60ea8afa6962d': {
    id: '68d7f31af5d60ea8afa6962d',
    name: 'Тестовий користувач',
    username: '@testuser',
    email: 'test@example.com',
    city: 'Київ',
    country: 'Україна',
    bio: 'Це тестовий профіль користувача',
    joinedAt: new Date('2024-01-01'),
    stats: {
      posts: 5,
      followers: 12,
      following: 8,
      messages: 3
    }
  }
};

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

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/user/:userId/profile', (req, res) => {
  const { userId } = req.params;
  const user = mockUsers[userId];
  
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
});

app.put('/api/user/:userId/profile', (req, res) => {
  const { userId } = req.params;
  const { name, city, bio } = req.body;
  
  if (!mockUsers[userId]) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  mockUsers[userId] = {
    ...mockUsers[userId],
    name: name || mockUsers[userId].name,
    city: city || mockUsers[userId].city,
    bio: bio || mockUsers[userId].bio
  };
  
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: mockUsers[userId]
  });
});

app.get('/api/user/:userId/reviews', (req, res) => {
  const { userId } = req.params;
  const user = mockUsers[userId];
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  const userReviews = mockReviews.filter(review => review.username === user.username.replace('@', ''));
  
  res.json({
    success: true,
    data: userReviews
  });
});

app.get('/api/user/:userId/stats', (req, res) => {
  const { userId } = req.params;
  const user = mockUsers[userId];
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  res.json({
    success: true,
    data: user.stats
  });
});

app.get('/api/reviews', (req, res) => {
  res.json({
    success: true,
    data: mockReviews
  });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'test@example.com' && password === 'TestPass123') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: 'mock-jwt-token',
        user: {
          id: '507f1f77bcf86cd799439011',
          email: 'test@example.com',
          name: 'Тестовий користувач'
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }
  
  const newUserId = Date.now().toString();
  mockUsers[newUserId] = {
    id: newUserId,
    name,
    email,
    username: `@${email.split('@')[0]}`,
    city: '',
    country: '',
    bio: '',
    joinedAt: new Date(),
    stats: {
      posts: 0,
      followers: 0,
      following: 0,
      messages: 0
    }
  };
  
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      token: 'mock-jwt-token',
      user: {
        id: newUserId,
        email,
        name
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
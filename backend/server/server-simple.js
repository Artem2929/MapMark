const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Mock data
const mockUser = {
  id: '507f1f77bcf86cd799439011',
  name: 'Тестовий користувач',
  username: 'testuser',
  email: 'test@example.com',
  city: 'Київ',
  country: 'Україна',
  bio: 'Це тестовий профіль користувача',
  joinedAt: new Date().toISOString(),
  stats: {
    posts: 5,
    followers: 12,
    following: 8,
    messages: 3
  }
};

const mockReviews = [
  {
    _id: '1',
    text: 'Чудове місце!',
    rating: 5,
    lat: 50.4501,
    lng: 30.5234,
    createdAt: new Date().toISOString(),
    username: 'testuser'
  }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/api/user/:userId/profile', (req, res) => {
  res.json({ success: true, data: mockUser });
});

app.get('/api/user/:userId/reviews', (req, res) => {
  res.json({ success: true, data: mockReviews });
});

app.get('/api/reviews', (req, res) => {
  res.json({ success: true, data: mockReviews });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    res.json({
      success: true,
      data: {
        token: 'mock-token',
        user: { id: mockUser.id, email, name: mockUser.name }
      }
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (name && email && password) {
    res.json({
      success: true,
      data: {
        token: 'mock-token',
        user: { id: mockUser.id, email, name }
      }
    });
  } else {
    res.status(400).json({ success: false, message: 'All fields required' });
  }
});

app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
});
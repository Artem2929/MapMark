const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// In-memory storage (replace with database)
let profiles = {};

// GET profile
app.get('/api/profile/:userId', (req, res) => {
  const { userId } = req.params;
  const profile = profiles[userId] || {
    firstName: 'Артем',
    lastName: 'Поліщук',
    gender: 'чоловіча',
    birthDate: '1998-10-12',
    birthCity: 'Київ',
    about: 'Люблю подорожувати'
  };
  res.json({ success: true, data: profile });
});

// PUT update profile
app.put('/api/profile/:userId', (req, res) => {
  const { userId } = req.params;
  profiles[userId] = { ...profiles[userId], ...req.body };
  res.json({ success: true, data: profiles[userId] });
});

// PATCH update avatar
app.patch('/api/profile/:userId/avatar', upload.single('avatar'), (req, res) => {
  const { userId } = req.params;
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  
  const avatarUrl = `/uploads/${req.file.filename}`;
  if (!profiles[userId]) profiles[userId] = {};
  profiles[userId].avatar = avatarUrl;
  
  res.json({ success: true, data: { avatarUrl } });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
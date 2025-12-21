const jwt = require('jsonwebtoken');
const User = require('./auth.model');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

class AuthService {
  generateTokens(userId) {
    const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
    
    return { accessToken, refreshToken };
  }

  async login(email, password) {
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      throw new Error('Неправильний email або пароль');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Неправильний email або пароль');
    }

    const tokens = this.generateTokens(user._id);
    
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return {
      user,
      ...tokens
    };
  }

  async register(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('Користувач з таким email вже існує');
    }

    const user = new User(userData);
    await user.save();

    const tokens = this.generateTokens(user._id);
    
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return {
      user,
      ...tokens
    };
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user || user.refreshToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      const tokens = this.generateTokens(user._id);
      
      user.refreshToken = tokens.refreshToken;
      await user.save();

      return tokens;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }

  verifyAccessToken(token) {
    return jwt.verify(token, JWT_SECRET);
  }
}

module.exports = new AuthService();
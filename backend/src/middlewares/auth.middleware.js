const authService = require('../modules/auth/auth.service');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token не знайдено'
      });
    }

    const token = authHeader.substring(7);
    const decoded = authService.verifyAccessToken(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Недійсний access token'
    });
  }
};

module.exports = authMiddleware;
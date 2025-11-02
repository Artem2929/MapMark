const rateLimit = require('express-rate-limit');
const validator = require('validator');

const createRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { success: false, error: message },
  standardHeaders: true,
  legacyHeaders: false,
});

const postRateLimit = createRateLimit(15 * 60 * 1000, 10, 'Забагато запитів на створення постів');
const reactionRateLimit = createRateLimit(60 * 1000, 30, 'Забагато реакцій за хвилину');
const commentRateLimit = createRateLimit(60 * 1000, 20, 'Забагато коментарів за хвилину');

const validateInput = (req, res, next) => {
  const { content, location } = req.body;
  
  if (content && !validator.isLength(content, { min: 1, max: 5000 })) {
    return res.status(400).json({ success: false, error: 'Недійсна довжина контенту' });
  }
  
  if (location && !validator.isLength(location, { min: 1, max: 200 })) {
    return res.status(400).json({ success: false, error: 'Недійсна довжина локації' });
  }
  
  next();
};

const sanitizeInput = (req, res, next) => {
  if (req.body.content) {
    req.body.content = validator.escape(req.body.content);
  }
  if (req.body.location) {
    req.body.location = validator.escape(req.body.location);
  }
  next();
};

const generalLimiter = createRateLimit(15 * 60 * 1000, 100, 'Забагато запитів');

const securityMiddleware = (req, res, next) => {
  // Базові заголовки безпеки
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};

module.exports = {
  postRateLimit,
  reactionRateLimit,
  commentRateLimit,
  validateInput,
  sanitizeInput,
  securityMiddleware,
  generalLimiter
};
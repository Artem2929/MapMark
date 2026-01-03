const rateLimit = require('express-rate-limit')

// Rate limiter для auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 'fail',
    message: 'Забагато спроб входу. Спробуйте через 15 хвилин'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
})

// Rate limiter для API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 хвилин
  max: 100, // максимум 100 запитів
  message: {
    status: 'fail',
    message: 'Забагато запитів. Спробуйте пізніше'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Rate limiter для upload endpoints
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 година
  max: 10, // максимум 10 завантажень
  message: {
    status: 'fail',
    message: 'Забагато завантажень. Спробуйте через годину'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Strict rate limiter для критичних операцій
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 година
  max: 3, // максимум 3 спроби
  message: {
    status: 'fail',
    message: 'Забагато спроб. Спробуйте через годину'
  },
  standardHeaders: true,
  legacyHeaders: false
})

module.exports = {
  authLimiter,
  apiLimiter,
  uploadLimiter,
  strictLimiter
}

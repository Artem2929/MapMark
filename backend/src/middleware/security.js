const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cors = require('cors')
const config = require('../config')

// Rate limiting
const createRateLimiter = (windowMs = config.RATE_LIMIT_WINDOW_MS, max = config.RATE_LIMIT_MAX_REQUESTS) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      status: 'error',
      message: 'Too many requests from this IP, please try again later',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
  })
}

// Auth rate limiting (stricter)
const authLimiter = createRateLimiter(15 * 60 * 1000, 5) // 5 requests per 15 minutes

// General rate limiting
const generalLimiter = createRateLimiter()

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = config.CORS_ORIGIN.split(',')
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}

// Security middleware stack
const securityMiddleware = [
  // Basic security headers
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"]
      }
    }
  }),
  
  // CORS
  cors(corsOptions),
  
  // Rate limiting
  generalLimiter,
  
  // Data sanitization against NoSQL query injection
  mongoSanitize(),
  
  // Data sanitization against XSS
  xss(),
  
  // Prevent parameter pollution
  hpp({
    whitelist: ['sort', 'fields', 'page', 'limit']
  })
]

module.exports = {
  securityMiddleware,
  authLimiter,
  generalLimiter,
  corsOptions
}
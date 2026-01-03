const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const config = require('./config');
const logger = require('./utils/logger');
const { globalErrorHandler } = require('./utils/errorHandler');
const { securityMiddleware } = require('./middleware/security');
const {
  requestLogger,
  requestId,
  responseTime,
} = require('./middleware/logging');
const { apiLimiter } = require('./middleware/rateLimiter');
const updateActivity = require('./middleware/updateActivity');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const healthRoutes = require('./routes/healthRoutes');
const contactRoutes = require('./routes/contactRoutes');
const photosRoutes = require('./routes/photos');
const friendsRoutes = require('./routes/friendsRoutes');
const messagesRoutes = require('./routes/messagesRoutes');
const postsRoutes = require('./routes/postsRoutes');
const devRoutes = require('./routes/devRoutes');

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Request tracking middleware
app.use(requestId);
app.use(responseTime);

// Static files для фотографій та завантажень (before security middleware)
app.use(
  '/uploads',
  (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.join(__dirname, '../uploads'))
);

// Security middleware - skip rate limiting for photo uploads
app.use((req, res, next) => {
  if (req.path.includes('/photos/upload')) {
    const [helmet, cors, , mongoSanitize, xss, hpp] = securityMiddleware;
    helmet(req, res, () => {
      cors(req, res, () => {
        mongoSanitize(req, res, () => {
          xss(req, res, () => {
            hpp(req, res, next);
          });
        });
      });
    });
  } else {
    securityMiddleware.forEach(middleware => middleware(req, res, () => {}));
    next();
  }
});

// Request logging
app.use(requestLogger);

// Body parser middleware - skip JSON parsing for multipart requests
app.use((req, res, next) => {
  if (
    req.headers['content-type'] &&
    req.headers['content-type'].includes('multipart/form-data')
  ) {
    return next();
  }
  express.json({ limit: '10kb' })(req, res, next);
});
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Session middleware for CSRF
app.use(
  session({
    secret: config.JWT_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// API versioning
const API_VERSION = '/api/v1';

// Apply rate limiting to API routes
app.use(API_VERSION, apiLimiter);

// Update user activity for authenticated requests
app.use(updateActivity);

// Routes
app.use(`${API_VERSION}/auth`, authRoutes);
app.use(`${API_VERSION}/users`, userRoutes);
app.use(`${API_VERSION}/contact`, contactRoutes);
app.use(`${API_VERSION}/photos`, photosRoutes);
app.use(`${API_VERSION}/friends`, friendsRoutes);
app.use(`${API_VERSION}/messages`, messagesRoutes);
app.use(`${API_VERSION}/posts`, postsRoutes);
app.use(`${API_VERSION}/dev`, devRoutes);
app.use('/health', healthRoutes);

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'pinPointt API',
    version: '1.0.0',
    description: 'pinPointt Backend API',
    endpoints: {
      auth: `${API_VERSION}/auth`,
      users: `${API_VERSION}/users`,
      contact: `${API_VERSION}/contact`,
      photos: `${API_VERSION}/photos`,
      friends: `${API_VERSION}/friends`,
      messages: `${API_VERSION}/messages`,
      posts: `${API_VERSION}/posts`,
      health: '/health',
    },
    documentation: '/api/docs', // Future Swagger endpoint
  });
});

// Handle undefined routes
app.all('*', (req, res, next) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;

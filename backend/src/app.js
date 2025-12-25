const express = require('express')
const cookieParser = require('cookie-parser')
const config = require('./config')
const logger = require('./utils/logger')
const { globalErrorHandler } = require('./utils/errorHandler')
const { securityMiddleware } = require('./middleware/security')
const { requestLogger, requestId, responseTime } = require('./middleware/logging')
const authRoutes = require('./routes/authRoutes')
const healthRoutes = require('./routes/healthRoutes')

const app = express()

// Trust proxy
app.set('trust proxy', 1)

// Request tracking middleware
app.use(requestId)
app.use(responseTime)

// Security middleware
app.use(securityMiddleware)

// Request logging
app.use(requestLogger)

// Body parser middleware
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())

// API versioning
const API_VERSION = '/api/v1'

// Routes
app.use(`${API_VERSION}/auth`, authRoutes)
app.use('/health', healthRoutes)

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'MapMark API',
    version: '1.0.0',
    description: 'MapMark Backend API',
    endpoints: {
      auth: `${API_VERSION}/auth`,
      health: '/health'
    },
    documentation: '/api/docs' // Future Swagger endpoint
  })
})

// Handle undefined routes
app.all('*', (req, res, next) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })
  
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
    timestamp: new Date().toISOString()
  })
})

// Global error handling middleware
app.use(globalErrorHandler)

module.exports = app
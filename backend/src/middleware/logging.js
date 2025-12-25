const morgan = require('morgan')
const logger = require('../utils/logger')
const config = require('../config')

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req, res) => {
  const responseTime = res.getHeader('X-Response-Time')
  return responseTime ? `${responseTime}ms` : '-'
})

// Custom token for request ID
morgan.token('request-id', (req) => {
  return req.id || '-'
})

// Custom token for user ID
morgan.token('user-id', (req) => {
  return req.user?.id || 'anonymous'
})

// Development format
const developmentFormat = ':method :url :status :response-time ms - :res[content-length]'

// Production format with more details
const productionFormat = JSON.stringify({
  method: ':method',
  url: ':url',
  status: ':status',
  responseTime: ':response-time-ms',
  contentLength: ':res[content-length]',
  userAgent: ':user-agent',
  ip: ':remote-addr',
  userId: ':user-id',
  requestId: ':request-id'
})

// Skip logging for health checks in production
const skip = (req, res) => {
  if (config.NODE_ENV === 'production') {
    return req.url === '/health' || req.url === '/health/readiness' || req.url === '/health/liveness'
  }
  return false
}

// Create morgan middleware
const requestLogger = morgan(
  config.NODE_ENV === 'production' ? productionFormat : developmentFormat,
  {
    stream: logger.stream,
    skip
  }
)

// Request ID middleware
const requestId = (req, res, next) => {
  req.id = Math.random().toString(36).substr(2, 9)
  res.setHeader('X-Request-ID', req.id)
  next()
}

// Response time middleware
const responseTime = (req, res, next) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    // Only set header if response hasn't been sent
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', duration)
    }
  })
  
  next()
}

module.exports = {
  requestLogger,
  requestId,
  responseTime
}
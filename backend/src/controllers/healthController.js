const database = require('../utils/database')
const logger = require('../utils/logger')
const { catchAsync } = require('../utils/errorHandler')

const healthCheck = catchAsync(async (req, res) => {
  const startTime = Date.now()
  
  try {
    // Check database health
    const dbHealth = await database.healthCheck()
    
    // Check memory usage
    const memoryUsage = process.memoryUsage()
    const memoryUsageMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024)
    }
    
    // Calculate uptime
    const uptime = process.uptime()
    const uptimeFormatted = {
      days: Math.floor(uptime / 86400),
      hours: Math.floor((uptime % 86400) / 3600),
      minutes: Math.floor((uptime % 3600) / 60),
      seconds: Math.floor(uptime % 60)
    }
    
    const responseTime = Date.now() - startTime
    const isHealthy = dbHealth.status === 'healthy'
    
    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: uptimeFormatted,
      responseTime: `${responseTime}ms`,
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      node: process.version,
      memory: memoryUsageMB,
      database: dbHealth,
      services: {
        api: 'healthy',
        database: dbHealth.status
      }
    }
    
    logger.info('Health check performed', {
      status: healthData.status,
      responseTime: healthData.responseTime,
      dbStatus: dbHealth.status
    })
    
    res.status(isHealthy ? 200 : 503).json(healthData)
  } catch (error) {
    logger.error('Health check failed:', error)
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      responseTime: `${Date.now() - startTime}ms`
    })
  }
})

const readinessCheck = catchAsync(async (req, res) => {
  const dbHealth = await database.healthCheck()
  const isReady = dbHealth.status === 'healthy'
  
  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'not ready',
    timestamp: new Date().toISOString(),
    checks: {
      database: dbHealth.status
    }
  })
})

const livenessCheck = (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  })
}

module.exports = {
  healthCheck,
  readinessCheck,
  livenessCheck
}
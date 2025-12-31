const config = require('./config')
const logger = require('./utils/logger')
const database = require('./utils/database')
const socketService = require('./services/socketService')

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', {
    error: err.name,
    message: err.message,
    stack: err.stack
  })
  process.exit(1)
})

const app = require('./app')

// Connect to database
database.connect()
  .then(() => {
    // Start server only after successful database connection
    const server = app.listen(config.PORT, () => {
      logger.info(`🚀 Server running on port ${config.PORT} in ${config.NODE_ENV} mode`, {
        port: config.PORT,
        environment: config.NODE_ENV,
        nodeVersion: process.version,
        pid: process.pid
      })
    })

    // Initialize WebSocket
    socketService.init(server)

    // Graceful shutdown handlers
    const gracefulShutdown = (signal) => {
      logger.info(`👋 ${signal} RECEIVED. Shutting down gracefully`, { signal })
      
      server.close(async () => {
        logger.info('🔄 HTTP server closed')
        
        try {
          await database.disconnect()
          logger.info('💥 Process terminated gracefully!')
          process.exit(0)
        } catch (error) {
          logger.error('Error during graceful shutdown:', error)
          process.exit(1)
        }
      })
      
      // Force close server after 30 seconds
      setTimeout(() => {
        logger.error('⚠️ Could not close connections in time, forcefully shutting down')
        process.exit(1)
      }, 30000)
    }

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! 💥 Shutting down...', {
        error: err.name,
        message: err.message,
        stack: err.stack
      })
      gracefulShutdown('UNHANDLED_REJECTION')
    })

    // Handle SIGTERM
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))
    
  })
  .catch((error) => {
    logger.error('❌ Failed to start server:', error)
    process.exit(1)
  })
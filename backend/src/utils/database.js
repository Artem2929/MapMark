const mongoose = require('mongoose')
const logger = require('./logger')
const config = require('../config')

class Database {
  constructor() {
    this.connection = null
  }

  async connect() {
    try {
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        // bufferMaxEntries: 0, // Removed - deprecated option
        bufferCommands: false, // Disable mongoose buffering
        maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      }

      this.connection = await mongoose.connect(config.MONGODB_URI, options)
      
      logger.info('✅ Connected to MongoDB', {
        host: this.connection.connection.host,
        port: this.connection.connection.port,
        name: this.connection.connection.name
      })

      // Connection event listeners
      mongoose.connection.on('error', (err) => {
        logger.error('❌ MongoDB connection error:', err)
      })

      mongoose.connection.on('disconnected', () => {
        logger.warn('⚠️ MongoDB disconnected')
      })

      mongoose.connection.on('reconnected', () => {
        logger.info('🔄 MongoDB reconnected')
      })

      return this.connection
    } catch (error) {
      logger.error('❌ MongoDB connection failed:', error)
      throw error
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect()
      logger.info('👋 Disconnected from MongoDB')
    }
  }

  getConnectionState() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }
    return states[mongoose.connection.readyState] || 'unknown'
  }

  async healthCheck() {
    try {
      const state = this.getConnectionState()
      const isHealthy = state === 'connected'
      
      if (isHealthy) {
        // Test database operation
        await mongoose.connection.db.admin().ping()
      }

      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        state,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
      }
    } catch (error) {
      logger.error('Database health check failed:', error)
      return {
        status: 'unhealthy',
        state: this.getConnectionState(),
        error: error.message
      }
    }
  }
}

module.exports = new Database()
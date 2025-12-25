const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const config = require('./config')
const { globalErrorHandler } = require('./utils/errorHandler')
const { securityMiddleware } = require('./middleware/security')
const authRoutes = require('./routes/authRoutes')

const app = express()

// Trust proxy
app.set('trust proxy', 1)

// Security middleware
app.use(securityMiddleware)

// Body parser middleware
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())

// Routes
app.use('/api/auth', authRoutes)

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  })
})

// Handle undefined routes
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  })
})

// Global error handling middleware
app.use(globalErrorHandler)

module.exports = app
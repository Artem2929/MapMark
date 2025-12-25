const express = require('express')
const { healthCheck, readinessCheck, livenessCheck } = require('../controllers/healthController')

const router = express.Router()

// Health check endpoints
router.get('/', healthCheck)
router.get('/readiness', readinessCheck)
router.get('/liveness', livenessCheck)

module.exports = router
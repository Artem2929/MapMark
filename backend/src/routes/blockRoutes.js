const express = require('express')
const { blockUser } = require('../controllers/blockController')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()

router.post('/block/:userId', authenticateToken, blockUser)

module.exports = router
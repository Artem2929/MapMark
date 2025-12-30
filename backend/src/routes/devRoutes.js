const express = require('express')
const { clearTestUsers } = require('../controllers/devController')

const router = express.Router()

// Only available in development
if (process.env.NODE_ENV !== 'production') {
  router.delete('/clear-users', clearTestUsers)
}

module.exports = router
const csrf = require('csrf')
const { AppError } = require('../utils/errorHandler')

const tokens = new csrf()
const globalSecret = tokens.secretSync() // Глобальний секрет для спрощення

const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET requests
  if (req.method === 'GET') {
    return next()
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf

  if (!token) {
    return next(new AppError('Недійсний CSRF токен', 403, 'CSRF_TOKEN_MISSING'))
  }

  if (!tokens.verify(globalSecret, token)) {
    return next(new AppError('Недійсний CSRF токен', 403, 'INVALID_CSRF_TOKEN'))
  }

  next()
}

const generateCSRFToken = (req, res) => {
  const token = tokens.create(globalSecret)
  res.json({ csrfToken: token })
}

module.exports = {
  csrfProtection,
  generateCSRFToken
}
const csrf = require('csrf')
const { AppError } = require('../utils/errorHandler')

const tokens = new csrf()

const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET requests
  if (req.method === 'GET') {
    return next()
  }

  const secret = req.session?.csrfSecret || tokens.secretSync()
  const token = req.headers['x-csrf-token'] || req.body._csrf

  if (!token) {
    return next(new AppError('CSRF token missing', 403, 'CSRF_TOKEN_MISSING'))
  }

  if (!tokens.verify(secret, token)) {
    return next(new AppError('Invalid CSRF token', 403, 'INVALID_CSRF_TOKEN'))
  }

  // Store secret in session for future requests
  if (req.session) {
    req.session.csrfSecret = secret
  }

  next()
}

const generateCSRFToken = (req, res) => {
  const secret = req.session?.csrfSecret || tokens.secretSync()
  const token = tokens.create(secret)
  
  if (req.session) {
    req.session.csrfSecret = secret
  }

  res.json({ csrfToken: token })
}

module.exports = {
  csrfProtection,
  generateCSRFToken
}
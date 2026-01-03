const csrf = require('csurf')

// CSRF protection для форм
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
})

// Middleware для додавання CSRF токену в response
const addCsrfToken = (req, res, next) => {
  res.locals.csrfToken = req.csrfToken()
  next()
}

// Виключення CSRF для певних роутів (API з JWT)
const csrfExceptions = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/refresh'
]

const conditionalCsrf = (req, res, next) => {
  // Пропускаємо CSRF для виключених роутів
  if (csrfExceptions.some(path => req.path.startsWith(path))) {
    return next()
  }
  
  // Пропускаємо CSRF для GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next()
  }
  
  // Застосовуємо CSRF для інших запитів
  return csrfProtection(req, res, next)
}

module.exports = {
  csrfProtection,
  addCsrfToken,
  conditionalCsrf
}

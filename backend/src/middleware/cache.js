// Simple in-memory cache middleware
const cache = new Map()

const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      return next()
    }

    const key = req.originalUrl || req.url
    const cachedResponse = cache.get(key)

    if (cachedResponse && Date.now() - cachedResponse.timestamp < duration * 1000) {
      return res.json(cachedResponse.data)
    }

    const originalJson = res.json.bind(res)
    res.json = (data) => {
      cache.set(key, {
        data,
        timestamp: Date.now()
      })
      return originalJson(data)
    }

    next()
  }
}

const clearCache = (pattern) => {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key)
      }
    }
  } else {
    cache.clear()
  }
}

module.exports = { cacheMiddleware, clearCache }

/**
 * Middleware de logging
 */
export function loggerMiddleware(req, res, next) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Request received`)
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`)
  })

  next()
}

/**
 * Middleware para validar JSON
 */
export function jsonValidationMiddleware(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'JSON inválido',
    })
  }
  next(err)
}

/**
 * Middleware para rate limiting simples (em memória)
 */
const requestCounts = new Map()

export function rateLimitMiddleware(windowMs = 60000, maxRequests = 30) {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress
    const now = Date.now()

    if (!requestCounts.has(key)) {
      requestCounts.set(key, [])
    }

    const timestamps = requestCounts.get(key)
    const recentRequests = timestamps.filter((ts) => now - ts < windowMs)

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Muitas requisições. Tente novamente mais tarde.',
      })
    }

    recentRequests.push(now)
    requestCounts.set(key, recentRequests)

    // Limpeza periódica de IPs antigos
    if (requestCounts.size > 10000) {
      for (const [k, v] of requestCounts.entries()) {
        const recentTimestamps = v.filter((ts) => now - ts < windowMs)
        if (recentTimestamps.length === 0) {
          requestCounts.delete(k)
        } else {
          requestCounts.set(k, recentTimestamps)
        }
      }
    }

    next()
  }
}

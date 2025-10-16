/**
 * CORS middleware for Next.js API routes
 * Allows TeamGrid and other Grid apps to call SmartGrid APIs
 */

export function setCorsHeaders(res, origin) {
  // Allow requests from TeamGrid and other local origins
  const allowedOrigins = [
    'http://localhost:3000', // SmartGrid Dashboard
    'http://localhost:3001', // TeamGrid Backend
    'http://localhost:3002', // TeamGrid Frontend
    'http://localhost:3003', // CallGrid
    'http://localhost:3004', // SalesGrid
  ]

  // Check if origin is allowed
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Max-Age', '86400') // 24 hours
}

export function handleCors(req, res) {
  const origin = req.headers.origin || req.headers.referer
  
  setCorsHeaders(res, origin)

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return true // Indicates preflight was handled
  }

  return false // Continue with normal request
}


const helmet = require('helmet');
const cors = require('cors');
const { validationResult } = require('express-validator');

/**
 * CORS options
 */
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or same-origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('CORS policy does not allow access from the specified Origin.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Range',
    'x-drm-token',
    'x-student-uuid'
  ],
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length', 'Content-Disposition']
};

/**
 * Helmet Security Middleware configuration with Content Security Policy (CSP)
 */
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      mediaSrc: ["'self'", 'blob:', 'data:'],
      connectSrc: ["'self'", 'ws:', 'wss:'],
      frameAncestors: ["'none'"], // Prevent clickjacking & framing
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false, // Allows cross-origin video embedding when authorized
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  xssFilter: true
});

/**
 * Anti-screenshot & strict no-cache headers for sensitive / protected educational materials
 */
function antiScreenshotHeaders(req, res, next) {
  // Prevent any iframe framing
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Aggressive anti-caching so protected materials are never stored in browser disk cache
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  // Custom header indicating copy/screenshot protection active
  res.setHeader('X-Protected-Content', 'enabled');
  next();
}

/**
 * DRM Protection headers for video streams
 */
function drmVideoHeaders(req, res, next) {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-DRM-Protection', 'AES-128-Compatible');
  res.setHeader('Accept-Ranges', 'bytes');
  next();
}

/**
 * Request sanitization middleware: strips potential XSS tags and malicious script inputs from body and query
 */
function sanitizeInput(req, res, next) {
  const sanitizeValue = (val) => {
    if (typeof val === 'string') {
      // Remove raw HTML script and dangerous handlers
      return val
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/onload\s*=/gi, '')
        .replace(/onerror\s*=/gi, '');
    }
    if (typeof val === 'object' && val !== null) {
      for (const key of Object.keys(val)) {
        val[key] = sanitizeValue(val[key]);
      }
    }
    return val;
  };

  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);

  next();
}

/**
 * Express-validator middleware result validator
 * Returns 400 Bad Request with all validation errors if any exist
 */
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({
        field: e.path || e.param,
        message: e.msg,
        value: e.value
      }))
    });
  }
  next();
}

module.exports = {
  corsOptions,
  cors: cors(corsOptions),
  helmetConfig,
  antiScreenshotHeaders,
  drmVideoHeaders,
  sanitizeInput,
  validateRequest
};

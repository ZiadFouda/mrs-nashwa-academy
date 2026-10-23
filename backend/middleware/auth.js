const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { db, logAudit } = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
const SESSION_DURATION = process.env.SESSION_DURATION || '24h';
const REFRESH_DURATION = process.env.REFRESH_DURATION || '7d';

/**
 * Hash a token (SHA-256) for secure storage in the database sessions table
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Sign access token
 */
function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      uuid: user.uuid,
      username: user.username,
      role: user.role,
      grade: user.grade,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: SESSION_DURATION }
  );
}

/**
 * Sign refresh token
 */
function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user.id,
      uuid: user.uuid,
      username: user.username
    },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_DURATION }
  );
}

/**
 * Check if user account is currently locked
 */
function isAccountLocked(user) {
  if (!user || !user.locked_until) return false;
  const lockedUntil = new Date(user.locked_until).getTime();
  return lockedUntil > Date.now();
}

/**
 * Record a failed login attempt and lock if threshold (5) is reached for 30 minutes
 */
function recordFailedLogin(username) {
  const user = db.prepare('SELECT id, login_attempts FROM users WHERE username = ?').get(username);
  if (!user) return null;

  const newAttempts = (user.login_attempts || 0) + 1;
  let lockedUntil = null;

  if (newAttempts >= 5) {
    // 30-minute lockout
    lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  }

  db.prepare(`
    UPDATE users 
    SET login_attempts = ?, locked_until = ?
    WHERE id = ?
  `).run(newAttempts, lockedUntil, user.id);

  return {
    attempts: newAttempts,
    isLocked: newAttempts >= 5,
    lockedUntil
  };
}

/**
 * Reset failed attempts upon successful login
 */
function resetLoginAttempts(userId) {
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE users 
    SET login_attempts = 0, locked_until = NULL, last_login = ?
    WHERE id = ?
  `).run(now, userId);
}

/**
 * JWT Authentication Middleware
 * Validates token signature, session active status in db, user active status & lockout
 */
function authenticateToken(req, res, next) {
  let token = null;

  // Extract from Bearer Authorization header or cookie
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify user exists and is active in database
    const user = db.prepare(`
      SELECT id, uuid, username, email, full_name, role, grade, phone, parent_id, is_active, locked_until
      FROM users WHERE id = ?
    `).get(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User account no longer exists.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact administration.' });
    }

    if (isAccountLocked(user)) {
      return res.status(403).json({
        success: false,
        message: `Account is temporarily locked until ${user.locked_until}.`
      });
    }

    // Verify session in database is not revoked
    const tokenHash = hashToken(token);
    const session = db.prepare(`
      SELECT id, is_revoked, expires_at 
      FROM sessions 
      WHERE token_hash = ? AND user_id = ?
    `).get(tokenHash, user.id);

    if (session) {
      if (session.is_revoked) {
        return res.status(401).json({ success: false, message: 'Session has been revoked. Please log in again.' });
      }
      if (new Date(session.expires_at).getTime() < Date.now()) {
        return res.status(401).json({ success: false, message: 'Session has expired.' });
      }
    }

    req.user = user;
    req.token = token;
    req.tokenHash = tokenHash;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired. Please refresh your token.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
  }
}

/**
 * Optional authentication middleware: if token is present and valid, sets req.user; otherwise proceeds as guest
 */
function optionalAuthenticateToken(req, res, next) {
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, uuid, username, email, full_name, role, grade, parent_id, is_active FROM users WHERE id = ?').get(decoded.id);
    if (user && user.is_active) {
      req.user = user;
      req.token = token;
    } else {
      req.user = null;
    }
  } catch (err) {
    req.user = null;
  }
  next();
}

/**
 * Role-based authorization middleware
 * @param  {...string} roles - e.g. 'admin', 'manager', 'teacher'
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      logAudit(req.user.id, 'UNAUTHORIZED_ACCESS_ATTEMPT', {
        endpoint: req.originalUrl,
        method: req.method,
        requiredRoles: roles,
        userRole: req.user.role
      }, req.ip);

      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(', ')}].`
      });
    }

    next();
  };
}

/**
 * Rate Limiter for Authentication endpoints (100 requests per 15 minutes per IP)
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate Limiter for General API endpoints (1000 requests per 15 minutes per IP)
 */
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  hashToken,
  generateAccessToken,
  generateRefreshToken,
  isAccountLocked,
  recordFailedLogin,
  resetLoginAttempts,
  authenticateToken,
  optionalAuthenticateToken,
  requireRole,
  authRateLimiter,
  apiRateLimiter,
  JWT_SECRET,
  JWT_REFRESH_SECRET
};

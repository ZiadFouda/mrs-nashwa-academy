const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const { db, logAudit } = require('../database/db');
const {
  hashToken,
  generateAccessToken,
  generateRefreshToken,
  isAccountLocked,
  recordFailedLogin,
  resetLoginAttempts,
  authenticateToken,
  authRateLimiter,
  JWT_REFRESH_SECRET
} = require('../middleware/auth');
const { validateRequest } = require('../middleware/security');
const jwt = require('jsonwebtoken');

// Apply auth rate limiter
router.use(authRateLimiter);

/**
 * POST /api/auth/login
 * User login with username/email and password
 */
router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username or email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest
  ],
  (req, res) => {
    try {
      const { username, password, currentDevice } = req.body;
      const clientIp = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'Unknown';

      // Find user by username or email
      const user = db.prepare(`
        SELECT * FROM users 
        WHERE username = ? OR email = ?
      `).get(username, username);

      if (!user) {
        logAudit(null, 'LOGIN_FAILED_UNKNOWN_USER', { identifier: username }, clientIp);
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials.'
        });
      }

      // Check if account is locked
      if (isAccountLocked(user)) {
        logAudit(user.id, 'LOGIN_ATTEMPT_LOCKED_ACCOUNT', null, clientIp);
        return res.status(403).json({
          success: false,
          message: `Account is locked due to multiple failed login attempts. Please try again after ${new Date(user.locked_until).toLocaleTimeString()}.`
        });
      }

      // Check if account is active
      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated. Please contact administration.'
        });
      }

      // Verify password
      const passwordMatch = bcrypt.compareSync(password, user.password_hash);
      if (!passwordMatch) {
        const lockoutStatus = recordFailedLogin(user.username);
        logAudit(user.id, 'LOGIN_FAILED_BAD_PASSWORD', { attempts: lockoutStatus?.attempts }, clientIp);

        if (lockoutStatus && lockoutStatus.isLocked) {
          return res.status(403).json({
            success: false,
            message: 'Too many failed login attempts. Your account has been locked for 30 minutes.'
          });
        }

        const remaining = 5 - (lockoutStatus ? lockoutStatus.attempts : 1);
        return res.status(401).json({
          success: false,
          message: `Invalid credentials. ${remaining > 0 ? remaining + ' attempt(s) remaining before account lockout.' : ''}`
        });
      }

      // Single-Device Enforcement for students
      if (user.role === 'student' && user.device_lock_enabled) {
        if (currentDevice && currentDevice.deviceId) {
          if (!user.bound_device_id) {
            // First login: permanently bind device
            db.prepare('UPDATE users SET bound_device_id = ?, bound_device_label = ? WHERE id = ?')
              .run(currentDevice.deviceId, currentDevice.deviceLabel || 'Registered Browser', user.id);
            logAudit(user.id, 'DEVICE_BOUND_ON_FIRST_LOGIN', { deviceId: currentDevice.deviceId, label: currentDevice.deviceLabel }, clientIp);
          } else if (user.bound_device_id !== currentDevice.deviceId) {
            // Mismatched device attempt
            logAudit(user.id, 'DEVICE_MISMATCH_BLOCKED', {
              attemptedDevice: currentDevice.deviceId,
              boundDevice: user.bound_device_id
            }, clientIp);
            return res.status(403).json({
              success: false,
              code: 'DEVICE_LOCK_ERROR',
              message: `DEVICE_LOCK_ERROR: This student account is bound to an authorized device (${user.bound_device_label || user.bound_device_id}). To authorize this new device, contact the Academy Manager.`
            });
          }
        }
      }

      // Successful login: reset attempts and update last_login
      resetLoginAttempts(user.id);

      // Generate Tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Store active session in database
      const tokenHash = hashToken(accessToken);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

      db.prepare(`
        INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, created_at, expires_at, is_revoked)
        VALUES (?, ?, ?, ?, ?, ?, 0)
      `).run(user.id, tokenHash, clientIp, userAgent, new Date().toISOString(), expiresAt);

      logAudit(user.id, 'USER_LOGIN_SUCCESS', { role: user.role }, clientIp);

      // Set cookie for browser clients
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token: accessToken,
          refreshToken,
          user: {
            id: user.id,
            uuid: user.uuid,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            grade: user.grade,
            phone: user.phone,
            parent_id: user.parent_id
          }
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, message: 'An internal server error occurred during login.' });
    }
  }
);

/**
 * POST /api/auth/refresh
 * Refresh access token using valid refresh token
 */
router.post(
  '/refresh',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
    validateRequest
  ],
  (req, res) => {
    try {
      const { refreshToken } = req.body;
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

      const user = db.prepare('SELECT * FROM users WHERE id = ? AND is_active = 1').get(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid or inactive user.' });
      }

      if (isAccountLocked(user)) {
        return res.status(403).json({ success: false, message: 'Account is locked.' });
      }

      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      // Record new session
      const tokenHash = hashToken(newAccessToken);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const clientIp = req.ip || req.connection.remoteAddress;

      db.prepare(`
        INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, created_at, expires_at, is_revoked)
        VALUES (?, ?, ?, ?, ?, ?, 0)
      `).run(user.id, tokenHash, clientIp, req.headers['user-agent'] || 'Unknown', new Date().toISOString(), expiresAt);

      return res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: newAccessToken,
          refreshToken: newRefreshToken
        }
      });
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    }
  }
);

/**
 * POST /api/auth/logout
 * Invalidate session
 */
router.post('/logout', authenticateToken, (req, res) => {
  try {
    if (req.tokenHash) {
      db.prepare('UPDATE sessions SET is_revoked = 1 WHERE token_hash = ?').run(req.tokenHash);
    }
    logAudit(req.user.id, 'USER_LOGOUT', null, req.ip);
    res.clearCookie('accessToken');
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ success: false, message: 'Error logging out.' });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 */
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, uuid, username, email, full_name, role, grade, phone, parent_id, created_at, last_login
      FROM users WHERE id = ?
    `).get(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error fetching profile.' });
  }
});

/**
 * PUT /api/auth/change-password
 * Change user password
 */
router.put(
  '/change-password',
  authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
    validateRequest
  ],
  (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);

      if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
        return res.status(400).json({ success: false, message: 'Incorrect current password.' });
      }

      const newHash = bcrypt.hashSync(newPassword, 12);
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.user.id);

      // Invalidate existing sessions for security
      db.prepare('UPDATE sessions SET is_revoked = 1 WHERE user_id = ?').run(req.user.id);

      logAudit(req.user.id, 'PASSWORD_CHANGED', null, req.ip);

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully. Please log in with your new password.'
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Error updating password.' });
    }
  }
);

/**
 * POST /api/auth/forgot-password
 * Request password reset (managed by admin/support)
 */
router.post(
  '/forgot-password',
  [
    body('identifier').trim().notEmpty().withMessage('Username or email is required'),
    validateRequest
  ],
  (req, res) => {
    try {
      const { identifier } = req.body;
      const user = db.prepare('SELECT id, username, email FROM users WHERE username = ? OR email = ?').get(identifier, identifier);

      if (user) {
        logAudit(user.id, 'PASSWORD_RESET_REQUESTED', { identifier }, req.ip);
      }

      // Return consistent success message to avoid user enumeration
      return res.status(200).json({
        success: true,
        message: 'If your account is registered, a password reset request has been logged. Please contact the platform administration or Mrs. Nashwa Abdelhalim support team.'
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Error processing request.' });
    }
  }
);

module.exports = router;

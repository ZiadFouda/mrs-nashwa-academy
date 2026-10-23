const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbPath = process.env.DATABASE_PATH 
  ? path.resolve(__dirname, '..', process.env.DATABASE_PATH)
  : path.join(__dirname, 'nashwa_platform.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Open SQLite database with production performance pragmas
const db = new Database(dbPath, {
  // verbose: process.env.NODE_ENV === 'development' ? console.log : null
});

// Configure WAL mode and performance optimizations for 300+ concurrent users
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -64000'); // 64MB cache
db.pragma('busy_timeout = 5000');
db.pragma('temp_store = MEMORY');

/**
 * Audit log helper function
 * @param {number|null} userId - ID of the user performing the action
 * @param {string} action - Action name (e.g., 'USER_LOGIN', 'COURSE_CREATE')
 * @param {string|object} details - Extra context or details
 * @param {string|null} ipAddress - Client IP address
 */
function logAudit(userId, action, details, ipAddress = null) {
  try {
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : String(details || '');
    const stmt = db.prepare(`
      INSERT INTO audit_log (user_id, action, details, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(userId || null, action, detailsStr, ipAddress || null, new Date().toISOString());
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
}

module.exports = {
  db,
  logAudit,
  dbPath
};

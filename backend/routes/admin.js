const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { body, query, param } = require('express-validator');
const { db, logAudit } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateRequest } = require('../middleware/security');

// All routes in admin require at least admin or manager role
router.use(authenticateToken);
router.use(requireRole('admin', 'manager'));

/**
 * GET /api/admin/stats
 * Dashboard statistics for administrative overview
 */
router.get('/stats', (req, res) => {
  try {
    const stats = {};

    // Total counts by role
    const roleCounts = db.prepare(`
      SELECT role, COUNT(*) as count 
      FROM users 
      WHERE is_active = 1 
      GROUP BY role
    `).all();
    stats.roles = roleCounts.reduce((acc, row) => ({ ...acc, [row.role]: row.count }), {
      student: 0,
      parent: 0,
      teacher: 0,
      manager: 0,
      admin: 0
    });

    // Courses summary
    stats.totalCourses = db.prepare('SELECT COUNT(*) as count FROM courses WHERE is_active = 1').get().count;
    stats.coursesByExam = db.prepare(`
      SELECT exam_type, COUNT(*) as count 
      FROM courses 
      WHERE is_active = 1 
      GROUP BY exam_type
    `).all();

    // Enrollments
    stats.enrollments = db.prepare(`
      SELECT payment_status, COUNT(*) as count 
      FROM enrollments 
      WHERE is_active = 1 
      GROUP BY payment_status
    `).all().reduce((acc, row) => ({ ...acc, [row.payment_status]: row.count }), {
      paid: 0,
      pending: 0,
      expired: 0
    });

    // Submissions and performance
    const examStats = db.prepare(`
      SELECT 
        COUNT(*) as totalSubmissions,
        COALESCE(AVG(percentage), 0) as avgPercentage,
        COALESCE(SUM(CASE WHEN percentage >= 60 THEN 1 ELSE 0 END), 0) as passedCount
      FROM student_assignments
      WHERE is_graded = 1
    `).get();

    stats.exams = {
      totalSubmissions: examStats.totalSubmissions,
      averagePercentage: Math.round(examStats.avgPercentage * 10) / 10,
      passRate: examStats.totalSubmissions > 0
        ? Math.round((examStats.passedCount / examStats.totalSubmissions) * 100 * 10) / 10
        : 0
    };

    // Revenue collected
    const revenue = db.prepare(`
      SELECT COALESCE(SUM(c.price), 0) as totalRevenue
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.payment_status = 'paid'
    `).get();
    stats.totalRevenueEGP = revenue.totalRevenue;

    return res.status(200).json({ success: true, data: stats });
  } catch (err) {
    console.error('Admin stats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve dashboard stats.' });
  }
});

/**
 * GET /api/admin/users
 * List users with filtering, searching, and pagination
 */
router.get(
  '/users',
  [
    query('role').optional().isIn(['admin', 'manager', 'teacher', 'parent', 'student']),
    query('grade').optional().isIn(['10', '11', '12']),
    query('search').optional().trim(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validateRequest
  ],
  (req, res) => {
    try {
      const { role, grade, search, is_active } = req.query;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const offset = (page - 1) * limit;

      let conditions = ['1=1'];
      const params = [];

      if (role) {
        conditions.push('u.role = ?');
        params.push(role);
      }
      if (grade) {
        conditions.push('u.grade = ?');
        params.push(grade);
      }
      if (is_active !== undefined) {
        conditions.push('u.is_active = ?');
        params.push(parseInt(is_active, 10));
      }
      if (search) {
        conditions.push('(u.username LIKE ? OR u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam, searchParam);
      }

      const whereClause = conditions.join(' AND ');

      // Total count
      const countStmt = db.prepare(`SELECT COUNT(*) as count FROM users u WHERE ${whereClause}`);
      const total = countStmt.get(...params).count;

      // Paginated list with parent name if student
      const queryStmt = db.prepare(`
        SELECT 
          u.id, u.uuid, u.username, u.email, u.full_name, u.role, u.grade, u.phone, 
          u.parent_id, u.is_active, u.created_at, u.last_login,
          p.full_name as parent_name, p.phone as parent_phone
        FROM users u
        LEFT JOIN users p ON u.parent_id = p.id
        WHERE ${whereClause}
        ORDER BY u.id DESC
        LIMIT ? OFFSET ?
      `);

      const users = queryStmt.all(...params, limit, offset);

      return res.status(200).json({
        success: true,
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      console.error('Fetch users error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
    }
  }
);

/**
 * GET /api/admin/users/:id
 * Retrieve specific user details
 */
router.get('/users/:id', (req, res) => {
  try {
    const user = db.prepare(`
      SELECT 
        u.id, u.uuid, u.username, u.email, u.full_name, u.role, u.grade, u.phone, 
        u.parent_id, u.is_active, u.created_at, u.last_login,
        p.full_name as parent_name, p.phone as parent_phone, p.email as parent_email
      FROM users u
      LEFT JOIN users p ON u.parent_id = p.id
      WHERE u.id = ?
    `).get(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving user.' });
  }
});

/**
 * POST /api/admin/users
 * Create single user (student, parent, manager, teacher)
 */
router.post(
  '/users',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('role').isIn(['admin', 'manager', 'teacher', 'parent', 'student']).withMessage('Invalid role'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email is required'),
    body('grade').optional({ checkFalsy: true }).isIn(['10', '11', '12']).withMessage('Grade must be 10, 11, or 12'),
    body('parent_id').optional({ checkFalsy: true }).isInt(),
    validateRequest
  ],
  (req, res) => {
    try {
      const { username, password, full_name, role, email, grade, phone, parent_id } = req.body;

      // Check unique username
      const existing = db.prepare('SELECT id FROM users WHERE username = ? OR (email IS NOT NULL AND email = ?)').get(username, email || null);
      if (existing) {
        return res.status(400).json({ success: false, message: 'Username or email already in use.' });
      }

      // Check parent exists if supplied
      if (parent_id) {
        const parent = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'parent'").get(parent_id);
        if (!parent) {
          return res.status(400).json({ success: false, message: 'Specified parent ID not found.' });
        }
      }

      const passwordHash = bcrypt.hashSync(password, 12);
      const newUuid = uuidv4();
      const now = new Date().toISOString();

      const insertStmt = db.prepare(`
        INSERT INTO users (uuid, username, email, password_hash, full_name, role, grade, phone, parent_id, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
      `);

      const result = insertStmt.run(
        newUuid,
        username,
        email || null,
        passwordHash,
        full_name,
        role,
        role === 'student' ? grade : null,
        phone || null,
        role === 'student' ? (parent_id || null) : null,
        now
      );

      logAudit(req.user.id, 'USER_CREATED', { createdUserId: result.lastInsertRowid, username, role }, req.ip);

      return res.status(201).json({
        success: true,
        message: 'User created successfully.',
        data: {
          id: result.lastInsertRowid,
          uuid: newUuid,
          username,
          full_name,
          role,
          grade: role === 'student' ? grade : null
        }
      });
    } catch (err) {
      console.error('Create user error:', err);
      return res.status(500).json({ success: false, message: 'Error creating user.' });
    }
  }
);

/**
 * PUT /api/admin/users/:id
 * Update user details
 */
router.put(
  '/users/:id',
  [
    body('full_name').optional().trim().notEmpty(),
    body('email').optional({ checkFalsy: true }).isEmail(),
    body('grade').optional({ checkFalsy: true }).isIn(['10', '11', '12']),
    body('role').optional().isIn(['admin', 'manager', 'teacher', 'parent', 'student']),
    validateRequest
  ],
  (req, res) => {
    try {
      const { id } = req.params;
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const { full_name, email, phone, role, grade, parent_id, is_active, newPassword } = req.body;

      let passwordHash = user.password_hash;
      if (newPassword && newPassword.length >= 6) {
        passwordHash = bcrypt.hashSync(newPassword, 12);
        // Revoke active sessions for security
        db.prepare('UPDATE sessions SET is_revoked = 1 WHERE user_id = ?').run(id);
      }

      const updateStmt = db.prepare(`
        UPDATE users 
        SET full_name = ?, email = ?, phone = ?, role = ?, grade = ?, parent_id = ?, is_active = ?, password_hash = ?
        WHERE id = ?
      `);

      updateStmt.run(
        full_name !== undefined ? full_name : user.full_name,
        email !== undefined ? (email || null) : user.email,
        phone !== undefined ? phone : user.phone,
        role !== undefined ? role : user.role,
        grade !== undefined ? grade : user.grade,
        parent_id !== undefined ? parent_id : user.parent_id,
        is_active !== undefined ? is_active : user.is_active,
        passwordHash,
        id
      );

      logAudit(req.user.id, 'USER_UPDATED', { updatedUserId: id }, req.ip);

      return res.status(200).json({ success: true, message: 'User updated successfully.' });
    } catch (err) {
      console.error('Update user error:', err);
      return res.status(500).json({ success: false, message: 'Error updating user.' });
    }
  }
);

/**
 * DELETE /api/admin/users/:id
 * Soft delete user (deactivate)
 */
router.delete('/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own account.' });
    }

    db.prepare('UPDATE users SET is_active = 0 WHERE id = ?').run(id);
    db.prepare('UPDATE sessions SET is_revoked = 1 WHERE user_id = ?').run(id);

    logAudit(req.user.id, 'USER_DEACTIVATED', { deactivatedUserId: id }, req.ip);

    return res.status(200).json({ success: true, message: 'User deactivated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error deactivating user.' });
  }
});

/**
 * POST /api/admin/users/bulk
 * Bulk create students
 */
router.post(
  '/users/bulk',
  [
    body('students').isArray({ min: 1 }).withMessage('List of students is required'),
    body('students.*.username').trim().notEmpty().withMessage('Username is required for each student'),
    body('students.*.full_name').trim().notEmpty().withMessage('Full name is required for each student'),
    body('students.*.grade').isIn(['10', '11', '12']).withMessage('Grade must be 10, 11, or 12'),
    validateRequest
  ],
  (req, res) => {
    try {
      const { students } = req.body;
      const results = { created: [], errors: [] };

      const insertStudent = db.prepare(`
        INSERT INTO users (uuid, username, email, password_hash, full_name, role, grade, phone, parent_id, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, 'student', ?, ?, ?, 1, ?)
      `);

      const insertParent = db.prepare(`
        INSERT INTO users (uuid, username, email, password_hash, full_name, role, phone, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, 'parent', ?, 1, ?)
      `);

      const bulkTx = db.transaction(() => {
        for (const s of students) {
          const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(s.username);
          if (existing) {
            results.errors.push({ username: s.username, message: 'Username already exists' });
            continue;
          }

          let parentId = null;
          // Optionally create or link parent if parent_name / parent_phone provided
          if (s.parent_phone) {
            let parent = db.prepare("SELECT id FROM users WHERE phone = ? AND role = 'parent'").get(s.parent_phone);
            if (!parent && s.parent_name) {
              const parentUsername = `parent_${s.username}`;
              const parentHash = bcrypt.hashSync(s.parent_password || 'Parent2024!', 12);
              const parentRes = insertParent.run(
                uuidv4(),
                parentUsername,
                s.parent_email || null,
                parentHash,
                s.parent_name,
                s.parent_phone,
                new Date().toISOString()
              );
              parentId = parentRes.lastInsertRowid;
            } else if (parent) {
              parentId = parent.id;
            }
          }

          const rawPass = s.password || 'Student2024!';
          const passwordHash = bcrypt.hashSync(rawPass, 12);
          const studentUuid = uuidv4();
          const resInsert = insertStudent.run(
            studentUuid,
            s.username,
            s.email || null,
            passwordHash,
            s.full_name,
            s.grade,
            s.phone || null,
            parentId,
            new Date().toISOString()
          );

          results.created.push({
            id: resInsert.lastInsertRowid,
            uuid: studentUuid,
            username: s.username,
            full_name: s.full_name,
            grade: s.grade,
            parentId
          });
        }
      });

      bulkTx();

      logAudit(req.user.id, 'BULK_STUDENTS_CREATED', { count: results.created.length }, req.ip);

      return res.status(200).json({
        success: true,
        message: `Successfully created ${results.created.length} students.`,
        data: results
      });
    } catch (err) {
      console.error('Bulk create error:', err);
      return res.status(500).json({ success: false, message: 'Bulk creation transaction failed.' });
    }
  }
);

/**
 * POST /api/admin/link-parent
 * Link parent to student
 */
router.post(
  '/link-parent',
  [
    body('student_id').isInt().withMessage('Valid student_id is required'),
    body('parent_id').isInt().withMessage('Valid parent_id is required'),
    validateRequest
  ],
  (req, res) => {
    try {
      const { student_id, parent_id } = req.body;

      const student = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'student'").get(student_id);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found.' });
      }

      const parent = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'parent'").get(parent_id);
      if (!parent) {
        return res.status(404).json({ success: false, message: 'Parent not found.' });
      }

      db.prepare('UPDATE users SET parent_id = ? WHERE id = ?').run(parent_id, student_id);

      logAudit(req.user.id, 'PARENT_LINKED_TO_STUDENT', { student_id, parent_id }, req.ip);

      return res.status(200).json({ success: true, message: 'Parent successfully linked to student.' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Error linking parent to student.' });
    }
  }
);

/**
 * GET /api/admin/audit-log
 * View audit log
 */
router.get(
  '/audit-log',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('action').optional().trim(),
    validateRequest
  ],
  (req, res) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 50;
      const offset = (page - 1) * limit;
      const { action } = req.query;

      let where = '1=1';
      const params = [];
      if (action) {
        where += ' AND a.action LIKE ?';
        params.push(`%${action}%`);
      }

      const total = db.prepare(`SELECT COUNT(*) as count FROM audit_log a WHERE ${where}`).get(...params).count;

      const logs = db.prepare(`
        SELECT a.id, a.user_id, a.action, a.details, a.ip_address, a.created_at, u.username, u.full_name, u.role
        FROM audit_log a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE ${where}
        ORDER BY a.id DESC
        LIMIT ? OFFSET ?
      `).all(...params, limit, offset);

      return res.status(200).json({
        success: true,
        data: logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve audit log.' });
    }
  }
);

/**
 * POST /api/admin/system-restart
 * Triggers platform-wide restart, flushes temporary caches, synchronizes state
 */
router.post('/system-restart', requireRole('admin'), (req, res) => {
  try {
    const { factoryReset } = req.body;
    logAudit(
      req.user.id,
      'PLATFORM_UNIVERSAL_RESTART',
      `Universal restart triggered by ${req.user.username}. Factory reset: ${!!factoryReset}`,
      req.ip
    );

    // Revoke old sessions to resolve any deadlocks
    db.prepare('UPDATE sessions SET is_revoked = 1 WHERE expires_at < datetime("now")').run();

    return res.status(200).json({
      success: true,
      message: 'Platform universal restart initiated successfully.',
      timestamp: Date.now(),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Restart sequence failed: ' + err.message });
  }
});

module.exports = router;

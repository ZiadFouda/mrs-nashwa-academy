const express = require('express');
const router = express.Router();
const path = require('path');
const { body, query } = require('express-validator');
const { db, logAudit } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateRequest } = require('../middleware/security');
const { upload, virusScanPlaceholder } = require('../middleware/upload');

router.use(authenticateToken);

/**
 * POST /api/payments/instapay
 * Record an InstaPay payment transfer submission from student or parent
 */
router.post(
  '/instapay',
  upload.single('receipt'),
  virusScanPlaceholder,
  [
    body('course_id').isInt().withMessage('Valid course_id is required'),
    body('payment_reference').trim().notEmpty().withMessage('InstaPay reference / transaction code is required'),
    validateRequest
  ],
  (req, res) => {
    try {
      const { course_id, payment_reference, subscription_type, notes } = req.body;
      const studentId = req.user.role === 'student' ? req.user.id : (req.body.student_id ? parseInt(req.body.student_id, 10) : req.user.id);

      const course = db.prepare('SELECT * FROM courses WHERE id = ? AND is_active = 1').get(course_id);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found.' });
      }

      const receiptPath = req.file ? path.relative(path.resolve(__dirname, '..'), req.file.path).replace(/\\/g, '/') : null;
      const subType = subscription_type || course.subscription_type;
      const now = new Date().toISOString();

      // Check if enrollment exists
      const existingEnrollment = db.prepare('SELECT id, payment_status FROM enrollments WHERE student_id = ? AND course_id = ?').get(studentId, course_id);

      let enrollmentId;
      if (existingEnrollment) {
        enrollmentId = existingEnrollment.id;
        db.prepare(`
          UPDATE enrollments 
          SET payment_method = 'instapay', payment_status = 'pending', payment_reference = ?, subscription_type = ?
          WHERE id = ?
        `).run(payment_reference, subType, enrollmentId);
      } else {
        const insertRes = db.prepare(`
          INSERT INTO enrollments (
            student_id, course_id, subscription_type, start_date, payment_method, 
            payment_status, payment_reference, is_active, created_at
          ) VALUES (?, ?, ?, ?, 'instapay', 'pending', ?, 1, ?)
        `).run(studentId, course_id, subType, now, payment_reference, now);
        enrollmentId = insertRes.lastInsertRowid;
      }

      logAudit(req.user.id, 'INSTAPAY_PAYMENT_SUBMITTED', {
        enrollmentId,
        courseId: course_id,
        reference: payment_reference,
        receiptPath,
        notes
      }, req.ip);

      return res.status(200).json({
        success: true,
        message: 'InstaPay payment submitted successfully! Our team will verify the transaction shortly.',
        data: {
          enrollment_id: enrollmentId,
          course_title: course.title,
          amount_egp: course.price,
          payment_reference,
          status: 'pending'
        }
      });
    } catch (err) {
      console.error('InstaPay submission error:', err);
      return res.status(500).json({ success: false, message: 'Failed to record InstaPay payment.' });
    }
  }
);

/**
 * GET /api/payments/pending
 * Retrieve pending payments waiting for administrative review
 */
router.get('/pending', requireRole('admin', 'manager'), (req, res) => {
  try {
    const pendingList = db.prepare(`
      SELECT 
        e.id as enrollment_id,
        e.student_id,
        e.course_id,
        e.subscription_type,
        e.payment_method,
        e.payment_reference,
        e.payment_status,
        e.created_at,
        u.full_name as student_name,
        u.username as student_username,
        u.phone as student_phone,
        u.grade,
        c.title as course_title,
        c.price,
        c.currency
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      JOIN courses c ON e.course_id = c.id
      WHERE e.payment_status = 'pending'
      ORDER BY e.created_at DESC
    `).all();

    return res.status(200).json({ success: true, count: pendingList.length, data: pendingList });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve pending payments.' });
  }
});

/**
 * PUT /api/payments/:id/verify
 * Admin/Manager verifies or rejects payment
 */
router.put(
  '/:id/verify',
  requireRole('admin', 'manager'),
  [
    body('status').isIn(['paid', 'pending', 'expired']).withMessage('Status must be paid, pending, or expired'),
    validateRequest
  ],
  (req, res) => {
    try {
      const enrollmentId = req.params.id;
      const { status, notes } = req.body;

      const enrollment = db.prepare(`
        SELECT e.*, c.subscription_type as course_sub_type 
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.id = ?
      `).get(enrollmentId);

      if (!enrollment) {
        return res.status(404).json({ success: false, message: 'Enrollment record not found.' });
      }

      const now = new Date();
      let endDate = null;

      // If verifying as 'paid' and monthly subscription, set end date +30 days
      if (status === 'paid' && enrollment.subscription_type === 'monthly') {
        const end = new Date(now);
        end.setDate(end.getDate() + 30);
        endDate = end.toISOString();
      }

      db.prepare(`
        UPDATE enrollments 
        SET payment_status = ?, start_date = ?, end_date = ?, is_active = ?
        WHERE id = ?
      `).run(
        status,
        now.toISOString(),
        endDate,
        status === 'paid' ? 1 : 0,
        enrollmentId
      );

      logAudit(req.user.id, 'PAYMENT_VERIFIED', {
        enrollmentId,
        newStatus: status,
        notes,
        studentId: enrollment.student_id,
        courseId: enrollment.course_id
      }, req.ip);

      return res.status(200).json({
        success: true,
        message: `Payment status updated to '${status}'. Student access has been ${status === 'paid' ? 'activated' : 'updated'}.`,
        data: {
          enrollment_id: enrollmentId,
          status,
          start_date: now.toISOString(),
          end_date: endDate
        }
      });
    } catch (err) {
      console.error('Verify payment error:', err);
      return res.status(500).json({ success: false, message: 'Failed to verify payment.' });
    }
  }
);

/**
 * GET /api/payments/history
 * Payment and transaction history for the user (or all if admin/manager)
 */
router.get('/history', (req, res) => {
  try {
    const isStaff = ['admin', 'manager'].includes(req.user.role);
    const targetUserId = isStaff && req.query.student_id ? parseInt(req.query.student_id, 10) : req.user.id;

    let query = `
      SELECT 
        e.id as enrollment_id,
        e.payment_method,
        e.payment_reference,
        e.payment_status,
        e.subscription_type,
        e.start_date,
        e.end_date,
        e.created_at,
        c.title as course_title,
        c.price,
        c.currency,
        u.full_name as student_name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON e.student_id = u.id
    `;

    const params = [];
    if (!isStaff || req.query.student_id) {
      query += ' WHERE e.student_id = ?';
      params.push(targetUserId);
    }

    query += ' ORDER BY e.created_at DESC';

    const history = db.prepare(query).all(...params);

    return res.status(200).json({ success: true, data: history });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve payment history.' });
  }
});

module.exports = router;

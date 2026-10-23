const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { body, query, param } = require('express-validator');
const { db, logAudit } = require('../database/db');
const { authenticateToken, optionalAuthenticateToken, requireRole } = require('../middleware/auth');
const { validateRequest } = require('../middleware/security');

/**
 * GET /api/courses
 * List all active courses (or all for admin/manager) with filtering
 */
router.get(
  '/',
  optionalAuthenticateToken,
  [
    query('grade').optional().isIn(['10', '11', '12']),
    query('exam_type').optional().isIn(['SAT', 'EST']),
    query('subscription_type').optional().isIn(['course', 'monthly']),
    query('search').optional().trim(),
    validateRequest
  ],
  (req, res) => {
    try {
      const { grade, exam_type, subscription_type, search } = req.query;
      const isAdminOrManager = req.user && ['admin', 'manager', 'teacher'].includes(req.user.role);

      let conditions = [];
      const params = [];

      // Non-staff only see active courses
      if (!isAdminOrManager) {
        conditions.push('c.is_active = 1');
      }

      if (grade) {
        conditions.push('c.grade = ?');
        params.push(grade);
      }
      if (exam_type) {
        conditions.push('c.exam_type = ?');
        params.push(exam_type);
      }
      if (subscription_type) {
        conditions.push('c.subscription_type = ?');
        params.push(subscription_type);
      }
      if (search) {
        conditions.push('(c.title LIKE ? OR c.description LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const courses = db.prepare(`
        SELECT 
          c.id, c.uuid, c.title, c.description, c.grade, c.exam_type, 
          c.subscription_type, c.price, c.currency, c.is_active, c.created_at,
          (SELECT COUNT(*) FROM lessons WHERE course_id = c.id AND is_active = 1) as lesson_count,
          (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND is_active = 1 AND payment_status = 'paid') as enrolled_count
        FROM courses c
        ${whereClause}
        ORDER BY c.grade ASC, c.exam_type ASC, c.created_at DESC
      `).all(...params);

      // If user is a student, attach their enrollment status
      if (req.user && req.user.role === 'student') {
        const studentEnrollments = db.prepare(`
          SELECT course_id, payment_status, is_active, start_date, end_date
          FROM enrollments 
          WHERE student_id = ?
        `).all(req.user.id);

        const enrollMap = new Map();
        studentEnrollments.forEach(e => enrollMap.set(e.course_id, e));

        courses.forEach(c => {
          const enroll = enrollMap.get(c.id);
          c.is_enrolled = !!(enroll && enroll.payment_status === 'paid' && enroll.is_active);
          c.enrollment_status = enroll ? enroll.payment_status : 'none';
        });
      }

      return res.status(200).json({ success: true, data: courses });
    } catch (err) {
      console.error('Fetch courses error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve courses.' });
    }
  }
);

/**
 * GET /api/courses/:id
 * Retrieve course details with lesson outline and user enrollment
 */
router.get('/:id', optionalAuthenticateToken, (req, res) => {
  try {
    const courseId = req.params.id;
    const course = db.prepare(`
      SELECT c.*, u.full_name as creator_name
      FROM courses c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ? OR c.uuid = ?
    `).get(courseId, courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // Get lessons list (ordered)
    const lessons = db.prepare(`
      SELECT 
        id, uuid, course_id, title, description, lesson_order, 
        video_type, is_live, live_date, duration_minutes, is_protected, prerequisite_lesson_id
      FROM lessons 
      WHERE course_id = ? AND is_active = 1 
      ORDER BY lesson_order ASC
    `).all(course.id);

    // If user is logged in, attach lesson completion progress and enrollment info
    let enrollment = null;
    let completedLessonIds = new Set();

    if (req.user) {
      enrollment = db.prepare(`
        SELECT * FROM enrollments 
        WHERE student_id = ? AND course_id = ?
      `).get(req.user.id, course.id);

      const progress = db.prepare(`
        SELECT lesson_id, is_completed, watched_percentage
        FROM student_lesson_progress
        WHERE student_id = ?
      `).all(req.user.id);

      const progressMap = new Map();
      progress.forEach(p => {
        progressMap.set(p.lesson_id, p);
        if (p.is_completed) completedLessonIds.add(p.lesson_id);
      });

      lessons.forEach(l => {
        const prog = progressMap.get(l.id);
        l.is_completed = prog ? !!prog.is_completed : false;
        l.watched_percentage = prog ? prog.watched_percentage : 0;
        // Check if unlocked (no prerequisite or prerequisite is completed, or user is teacher/admin)
        if (['admin', 'manager', 'teacher'].includes(req.user.role)) {
          l.is_unlocked = true;
        } else {
          l.is_unlocked = !l.prerequisite_lesson_id || completedLessonIds.has(l.prerequisite_lesson_id);
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...course,
        lessons,
        enrollment: enrollment || null
      }
    });
  } catch (err) {
    console.error('Fetch course details error:', err);
    return res.status(500).json({ success: false, message: 'Error retrieving course details.' });
  }
});

/**
 * POST /api/courses
 * Create new course (admin or manager)
 */
router.post(
  '/',
  authenticateToken,
  requireRole('admin', 'manager'),
  [
    body('title').trim().notEmpty().withMessage('Course title is required'),
    body('grade').isIn(['10', '11', '12']).withMessage('Grade must be 10, 11, or 12'),
    body('exam_type').isIn(['SAT', 'EST']).withMessage('Exam type must be SAT or EST'),
    body('subscription_type').isIn(['course', 'monthly']).withMessage('Subscription type must be course or monthly'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    validateRequest
  ],
  (req, res) => {
    try {
      const { title, description, grade, exam_type, subscription_type, price, currency } = req.body;
      const uuid = uuidv4();
      const now = new Date().toISOString();

      const stmt = db.prepare(`
        INSERT INTO courses (uuid, title, description, grade, exam_type, subscription_type, price, currency, is_active, created_at, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `);

      const result = stmt.run(
        uuid,
        title,
        description || '',
        grade,
        exam_type,
        subscription_type,
        price,
        currency || 'EGP',
        now,
        req.user.id
      );

      logAudit(req.user.id, 'COURSE_CREATED', { courseId: result.lastInsertRowid, title, exam_type, grade }, req.ip);

      return res.status(201).json({
        success: true,
        message: 'Course created successfully.',
        data: {
          id: result.lastInsertRowid,
          uuid,
          title,
          grade,
          exam_type,
          subscription_type,
          price
        }
      });
    } catch (err) {
      console.error('Course create error:', err);
      return res.status(500).json({ success: false, message: 'Failed to create course.' });
    }
  }
);

/**
 * PUT /api/courses/:id
 * Update course details
 */
router.put(
  '/:id',
  authenticateToken,
  requireRole('admin', 'manager'),
  [
    body('title').optional().trim().notEmpty(),
    body('grade').optional().isIn(['10', '11', '12']),
    body('exam_type').optional().isIn(['SAT', 'EST']),
    body('subscription_type').optional().isIn(['course', 'monthly']),
    body('price').optional().isFloat({ min: 0 }),
    validateRequest
  ],
  (req, res) => {
    try {
      const courseId = req.params.id;
      const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found.' });
      }

      const { title, description, grade, exam_type, subscription_type, price, currency, is_active } = req.body;

      db.prepare(`
        UPDATE courses 
        SET title = ?, description = ?, grade = ?, exam_type = ?, subscription_type = ?, price = ?, currency = ?, is_active = ?
        WHERE id = ?
      `).run(
        title !== undefined ? title : course.title,
        description !== undefined ? description : course.description,
        grade !== undefined ? grade : course.grade,
        exam_type !== undefined ? exam_type : course.exam_type,
        subscription_type !== undefined ? subscription_type : course.subscription_type,
        price !== undefined ? price : course.price,
        currency !== undefined ? currency : course.currency,
        is_active !== undefined ? is_active : course.is_active,
        courseId
      );

      logAudit(req.user.id, 'COURSE_UPDATED', { courseId }, req.ip);

      return res.status(200).json({ success: true, message: 'Course updated successfully.' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to update course.' });
    }
  }
);

/**
 * DELETE /api/courses/:id
 * Soft delete / deactivate course
 */
router.delete('/:id', authenticateToken, requireRole('admin', 'manager'), (req, res) => {
  try {
    const courseId = req.params.id;
    db.prepare('UPDATE courses SET is_active = 0 WHERE id = ?').run(courseId);
    logAudit(req.user.id, 'COURSE_DEACTIVATED', { courseId }, req.ip);
    return res.status(200).json({ success: true, message: 'Course deactivated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to deactivate course.' });
  }
});

/**
 * POST /api/courses/:id/enroll
 * Enroll student in course (student self-enrollment or admin/manager enrolling student)
 */
router.post(
  '/:id/enroll',
  authenticateToken,
  [
    body('student_id').optional().isInt(),
    body('payment_method').optional().isIn(['instapay', 'cash', 'card', 'vodafone_cash']),
    body('payment_status').optional().isIn(['pending', 'paid', 'expired']),
    body('payment_reference').optional().trim(),
    validateRequest
  ],
  (req, res) => {
    try {
      const courseId = req.params.id;
      const course = db.prepare('SELECT * FROM courses WHERE id = ? AND is_active = 1').get(courseId);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Active course not found.' });
      }

      // Determine target student: if admin/manager, can pass student_id; otherwise current user
      let targetStudentId = req.user.id;
      let paymentStatus = 'pending';

      if (['admin', 'manager'].includes(req.user.role)) {
        if (req.body.student_id) {
          targetStudentId = req.body.student_id;
        }
        if (req.body.payment_status) {
          paymentStatus = req.body.payment_status;
        }
      } else {
        if (req.user.role !== 'student') {
          return res.status(403).json({ success: false, message: 'Only students can enroll in courses.' });
        }
      }

      // Check existing enrollment
      const existing = db.prepare('SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?').get(targetStudentId, courseId);
      if (existing) {
        if (existing.payment_status === 'paid' && existing.is_active) {
          return res.status(400).json({ success: false, message: 'Already enrolled and active in this course.' });
        }
        // Update existing enrollment
        db.prepare(`
          UPDATE enrollments 
          SET payment_status = ?, payment_reference = ?, is_active = 1, start_date = ?
          WHERE id = ?
        `).run(
          paymentStatus,
          req.body.payment_reference || existing.payment_reference,
          new Date().toISOString(),
          existing.id
        );

        return res.status(200).json({
          success: true,
          message: 'Enrollment updated successfully.',
          data: { enrollment_id: existing.id, payment_status: paymentStatus }
        });
      }

      const startDate = new Date().toISOString();
      // Calculate end date if monthly subscription (30 days)
      let endDate = null;
      if (course.subscription_type === 'monthly') {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        endDate = d.toISOString();
      }

      const stmt = db.prepare(`
        INSERT INTO enrollments (student_id, course_id, subscription_type, start_date, end_date, payment_method, payment_status, payment_reference, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
      `);

      const result = stmt.run(
        targetStudentId,
        courseId,
        course.subscription_type,
        startDate,
        endDate,
        req.body.payment_method || 'instapay',
        paymentStatus,
        req.body.payment_reference || null,
        new Date().toISOString()
      );

      logAudit(req.user.id, 'COURSE_ENROLLMENT_CREATED', {
        enrollmentId: result.lastInsertRowid,
        courseId,
        studentId: targetStudentId,
        status: paymentStatus
      }, req.ip);

      return res.status(201).json({
        success: true,
        message: paymentStatus === 'paid' ? 'Enrolled successfully!' : 'Enrollment registered. Pending payment confirmation.',
        data: {
          enrollment_id: result.lastInsertRowid,
          student_id: targetStudentId,
          course_id: courseId,
          payment_status: paymentStatus
        }
      });
    } catch (err) {
      console.error('Enrollment error:', err);
      return res.status(500).json({ success: false, message: 'Failed to enroll in course.' });
    }
  }
);

/**
 * GET /api/courses/:id/students
 * List enrolled students in this course
 */
router.get('/:id/students', authenticateToken, requireRole('admin', 'manager', 'teacher'), (req, res) => {
  try {
    const courseId = req.params.id;

    const students = db.prepare(`
      SELECT 
        e.id as enrollment_id, e.subscription_type, e.start_date, e.end_date, 
        e.payment_status, e.payment_method, e.created_at as enrolled_at,
        u.id as student_id, u.uuid, u.username, u.full_name, u.grade, u.phone, u.email,
        (SELECT COUNT(*) FROM student_lesson_progress WHERE student_id = u.id AND is_completed = 1) as completed_lessons,
        (SELECT AVG(percentage) FROM student_assignments sa JOIN assignments a ON sa.assignment_id = a.id WHERE a.course_id = ? AND sa.student_id = u.id AND sa.is_graded = 1) as average_score
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      WHERE e.course_id = ?
      ORDER BY e.created_at DESC
    `).all(courseId, courseId);

    return res.status(200).json({ success: true, data: students });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving students.' });
  }
});

/**
 * PUT /api/courses/:id/subscription
 * Update course subscription parameters
 */
router.put(
  '/:id/subscription',
  authenticateToken,
  requireRole('admin', 'manager'),
  [
    body('subscription_type').optional().isIn(['course', 'monthly']),
    body('price').optional().isFloat({ min: 0 }),
    body('currency').optional().isString(),
    validateRequest
  ],
  (req, res) => {
    try {
      const courseId = req.params.id;
      const { subscription_type, price, currency } = req.body;

      const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found.' });
      }

      db.prepare(`
        UPDATE courses 
        SET subscription_type = ?, price = ?, currency = ?
        WHERE id = ?
      `).run(
        subscription_type !== undefined ? subscription_type : course.subscription_type,
        price !== undefined ? price : course.price,
        currency !== undefined ? currency : course.currency,
        courseId
      );

      logAudit(req.user.id, 'COURSE_SUBSCRIPTION_UPDATED', { courseId, price, subscription_type }, req.ip);

      return res.status(200).json({ success: true, message: 'Subscription settings updated.' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to update subscription.' });
    }
  }
);

module.exports = router;

const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Require authentication and parent role (or admin/manager)
router.use(authenticateToken);
router.use(requireRole('parent', 'admin', 'manager'));

/**
 * Middleware to verify that the target child belongs to the requesting parent
 */
function verifyChildBelongsToParent(req, res, next) {
  const childId = parseInt(req.params.id, 10);

  // Admin/manager can inspect any child
  if (['admin', 'manager'].includes(req.user.role)) {
    const student = db.prepare("SELECT * FROM users WHERE id = ? AND role = 'student'").get(childId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    req.targetChild = student;
    return next();
  }

  // Parent can only inspect their own children
  const child = db.prepare(`
    SELECT * FROM users 
    WHERE id = ? AND parent_id = ? AND role = 'student'
  `).get(childId, req.user.id);

  if (!child) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: You are not authorized to view details for this student.'
    });
  }

  req.targetChild = child;
  next();
}

/**
 * GET /api/parent/children
 * Get all linked children for the current parent
 */
router.get('/children', (req, res) => {
  try {
    let children = [];
    if (['admin', 'manager'].includes(req.user.role)) {
      children = db.prepare(`
        SELECT u.id, u.uuid, u.username, u.full_name, u.grade, u.phone, u.created_at, u.last_login,
               p.full_name as parent_name, p.phone as parent_phone
        FROM users u
        LEFT JOIN users p ON u.parent_id = p.id
        WHERE u.role = 'student' AND u.is_active = 1
        ORDER BY u.id DESC
      `).all();
    } else {
      children = db.prepare(`
        SELECT id, uuid, username, full_name, grade, phone, created_at, last_login
        FROM users 
        WHERE parent_id = ? AND role = 'student' AND is_active = 1
        ORDER BY full_name ASC
      `).all(req.user.id);
    }

    return res.status(200).json({ success: true, data: children });
  } catch (err) {
    console.error('Fetch children error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve linked children.' });
  }
});

/**
 * GET /api/parent/children/:id/progress
 * Child's overall educational progress across enrolled courses
 */
router.get('/children/:id/progress', verifyChildBelongsToParent, (req, res) => {
  try {
    const childId = req.targetChild.id;

    // Enrolled courses with lesson completion stats
    const coursesProgress = db.prepare(`
      SELECT 
        c.id as course_id, c.title as course_title, c.grade, c.exam_type,
        e.subscription_type, e.start_date, e.payment_status,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id AND is_active = 1) as total_lessons,
        (SELECT COUNT(slp.id) FROM student_lesson_progress slp 
         JOIN lessons l ON slp.lesson_id = l.id 
         WHERE l.course_id = c.id AND slp.student_id = ? AND slp.is_completed = 1) as completed_lessons,
        (SELECT ROUND(AVG(sa.percentage), 1) FROM student_assignments sa
         JOIN assignments a ON sa.assignment_id = a.id
         WHERE a.course_id = c.id AND sa.student_id = ? AND sa.is_graded = 1) as average_grade
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.student_id = ? AND e.is_active = 1
    `).all(childId, childId, childId);

    const formatted = coursesProgress.map(c => ({
      ...c,
      completion_percentage: c.total_lessons > 0
        ? Math.round((c.completed_lessons / c.total_lessons) * 100)
        : 0
    }));

    return res.status(200).json({
      success: true,
      data: {
        child: {
          id: req.targetChild.id,
          full_name: req.targetChild.full_name,
          grade: req.targetChild.grade
        },
        courses: formatted
      }
    });
  } catch (err) {
    console.error('Child progress error:', err);
    return res.status(500).json({ success: false, message: 'Error retrieving child progress.' });
  }
});

/**
 * GET /api/parent/children/:id/grades
 * Child's exam, quiz, and homework grades
 */
router.get('/children/:id/grades', verifyChildBelongsToParent, (req, res) => {
  try {
    const childId = req.targetChild.id;

    const grades = db.prepare(`
      SELECT 
        sa.id as submission_id,
        sa.started_at,
        sa.submitted_at,
        sa.score,
        sa.max_score,
        sa.percentage,
        sa.is_auto_submitted,
        a.id as assignment_id,
        a.title as assignment_title,
        a.assignment_type,
        c.title as course_title,
        c.exam_type
      FROM student_assignments sa
      JOIN assignments a ON sa.assignment_id = a.id
      JOIN courses c ON a.course_id = c.id
      WHERE sa.student_id = ? AND sa.is_graded = 1
      ORDER BY sa.submitted_at DESC
    `).all(childId);

    const overallAverage = grades.length > 0
      ? Math.round((grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length) * 10) / 10
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        overallAverage,
        totalExamsTaken: grades.length,
        grades
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving child grades.' });
  }
});

/**
 * GET /api/parent/children/:id/attendance
 * Child's lesson attendance and completion history
 */
router.get('/children/:id/attendance', verifyChildBelongsToParent, (req, res) => {
  try {
    const childId = req.targetChild.id;

    const attendance = db.prepare(`
      SELECT 
        l.id as lesson_id,
        l.title as lesson_title,
        l.lesson_order,
        l.duration_minutes,
        c.title as course_title,
        slp.watched_percentage,
        slp.is_completed,
        slp.completed_at
      FROM student_lesson_progress slp
      JOIN lessons l ON slp.lesson_id = l.id
      JOIN courses c ON l.course_id = c.id
      WHERE slp.student_id = ?
      ORDER BY slp.completed_at DESC
    `).all(childId);

    return res.status(200).json({
      success: true,
      data: {
        totalLessonsAttended: attendance.length,
        attendance
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving child attendance.' });
  }
});

/**
 * GET /api/parent/children/:id/analytics
 * Child's improvement analytics and trend evaluation
 */
router.get('/children/:id/analytics', verifyChildBelongsToParent, (req, res) => {
  try {
    const childId = req.targetChild.id;

    const records = db.prepare(`
      SELECT 
        a.score, a.max_score, a.percentage, a.assessment_type, a.recorded_at,
        asn.title as assessment_title,
        c.title as course_title
      FROM analytics a
      JOIN courses c ON a.course_id = c.id
      LEFT JOIN assignments asn ON a.assessment_id = asn.id
      WHERE a.student_id = ?
      ORDER BY a.recorded_at ASC
    `).all(childId);

    // Calculate trend
    let trend = 'stable';
    let summaryMessage = 'Child shows consistent attendance and performance.';

    if (records.length >= 2) {
      const mid = Math.floor(records.length / 2);
      const firstHalf = records.slice(0, mid);
      const secondHalf = records.slice(mid);
      const avg1 = firstHalf.reduce((sum, r) => sum + r.percentage, 0) / firstHalf.length;
      const avg2 = secondHalf.reduce((sum, r) => sum + r.percentage, 0) / secondHalf.length;
      const diff = Math.round((avg2 - avg1) * 10) / 10;

      if (diff >= 4.0) {
        trend = 'improving';
        summaryMessage = `Excellent progress! Your child has improved by ${diff}% in recent evaluations.`;
      } else if (diff <= -4.0) {
        trend = 'declining';
        summaryMessage = `Attention required: A drop of ${Math.abs(diff)}% was noted in recent assessments. Please encourage additional review with Mrs. Nashwa's materials.`;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        trend,
        summaryMessage,
        assessments: records
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving child analytics.' });
  }
});

module.exports = router;

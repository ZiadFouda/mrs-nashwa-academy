const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All analytics require authentication
router.use(authenticateToken);

/**
 * Helper to ensure student/parent only accesses permitted student data
 */
function canAccessStudent(user, targetStudentId) {
  if (['admin', 'manager', 'teacher'].includes(user.role)) return true;
  if (user.role === 'student' && user.id === targetStudentId) return true;
  if (user.role === 'parent') {
    const child = db.prepare('SELECT id FROM users WHERE id = ? AND parent_id = ?').get(targetStudentId, user.id);
    return !!child;
  }
  return false;
}

/**
 * GET /api/analytics/student/:id
 * Overall student performance over time across all assessments
 */
router.get('/student/:id', (req, res) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (!canAccessStudent(req.user, studentId)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this student analytics.' });
    }

    const student = db.prepare('SELECT id, full_name, username, grade FROM users WHERE id = ?').get(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Historical records from analytics table
    const records = db.prepare(`
      SELECT 
        a.id, a.assessment_type, a.score, a.max_score, a.percentage, a.recorded_at,
        c.title as course_title, c.exam_type,
        asn.title as assignment_title
      FROM analytics a
      JOIN courses c ON a.course_id = c.id
      LEFT JOIN assignments asn ON a.assessment_id = asn.id
      WHERE a.student_id = ?
      ORDER BY a.recorded_at ASC
    `).all(studentId);

    // Summary statistics
    const totalAssessments = records.length;
    const avgPercentage = totalAssessments > 0
      ? Math.round((records.reduce((sum, r) => sum + r.percentage, 0) / totalAssessments) * 10) / 10
      : 0;

    const highestScore = totalAssessments > 0
      ? Math.max(...records.map(r => r.percentage))
      : 0;

    const lowestScore = totalAssessments > 0
      ? Math.min(...records.map(r => r.percentage))
      : 0;

    // By assessment type
    const byType = {};
    records.forEach(r => {
      if (!byType[r.assessment_type]) {
        byType[r.assessment_type] = { count: 0, totalPercentage: 0 };
      }
      byType[r.assessment_type].count++;
      byType[r.assessment_type].totalPercentage += r.percentage;
    });

    const categoryBreakdown = Object.keys(byType).map(type => ({
      type,
      count: byType[type].count,
      averagePercentage: Math.round((byType[type].totalPercentage / byType[type].count) * 10) / 10
    }));

    return res.status(200).json({
      success: true,
      data: {
        student,
        summary: {
          totalAssessments,
          averagePercentage: avgPercentage,
          highestScore,
          lowestScore
        },
        categoryBreakdown,
        timeline: records
      }
    });
  } catch (err) {
    console.error('Student analytics error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve student analytics.' });
  }
});

/**
 * GET /api/analytics/student/:id/improvement
 * Improvement analysis with trend detection (improving / declining / stable)
 */
router.get('/student/:id/improvement', (req, res) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (!canAccessStudent(req.user, studentId)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this student analytics.' });
    }

    const records = db.prepare(`
      SELECT percentage, recorded_at, assessment_type, assessment_id 
      FROM analytics 
      WHERE student_id = ? 
      ORDER BY recorded_at ASC
    `).all(studentId);

    if (records.length < 2) {
      return res.status(200).json({
        success: true,
        data: {
          status: 'stable',
          trendDescription: 'Insufficient data points (minimum 2 required) to determine performance trend.',
          percentageChange: 0,
          currentAverage: records.length === 1 ? records[0].percentage : 0,
          priorAverage: records.length === 1 ? records[0].percentage : 0,
          datapoints: records
        }
      });
    }

    // Split timeline into first half vs second half
    const mid = Math.floor(records.length / 2);
    const firstHalf = records.slice(0, mid);
    const secondHalf = records.slice(mid);

    const firstHalfAvg = firstHalf.reduce((sum, r) => sum + r.percentage, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, r) => sum + r.percentage, 0) / secondHalf.length;

    const diff = secondHalfAvg - firstHalfAvg;
    const percentageChange = Math.round(diff * 10) / 10;

    let trend = 'stable';
    let trendDescription = 'Performance is steady and consistent across recent assessments.';

    if (percentageChange >= 4.0) {
      trend = 'improving';
      trendDescription = `Student demonstrates a solid upward progression with an average improvement of +${percentageChange}% in recent exams.`;
    } else if (percentageChange <= -4.0) {
      trend = 'declining';
      trendDescription = `Student performance has declined by ${Math.abs(percentageChange)}% in recent assessments. Recommended: Review targeted lesson concepts and homework.`;
    }

    return res.status(200).json({
      success: true,
      data: {
        trend,
        trendDescription,
        percentageChange,
        currentAverage: Math.round(secondHalfAvg * 10) / 10,
        priorAverage: Math.round(firstHalfAvg * 10) / 10,
        totalAssessments: records.length,
        datapoints: records
      }
    });
  } catch (err) {
    console.error('Improvement analytics error:', err);
    return res.status(500).json({ success: false, message: 'Failed to analyze student improvement.' });
  }
});

/**
 * GET /api/analytics/course/:id
 * Course-wide analytics for Mrs. Nashwa and staff
 */
router.get('/course/:id', requireRole('admin', 'manager', 'teacher'), (req, res) => {
  try {
    const courseId = req.params.id;
    const course = db.prepare('SELECT id, title, grade, exam_type FROM courses WHERE id = ?').get(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // Enrollment metrics
    const totalEnrolled = db.prepare(`
      SELECT COUNT(*) as count 
      FROM enrollments 
      WHERE course_id = ? AND payment_status = 'paid' AND is_active = 1
    `).get(courseId).count;

    // Exam statistics
    const stats = db.prepare(`
      SELECT 
        COUNT(a.id) as totalSubmissions,
        COALESCE(AVG(a.percentage), 0) as averagePercentage,
        COALESCE(MAX(a.percentage), 0) as highestPercentage,
        COALESCE(MIN(a.percentage), 0) as lowestPercentage,
        COALESCE(SUM(CASE WHEN a.percentage >= 60 THEN 1 ELSE 0 END), 0) as passCount
      FROM analytics a
      WHERE a.course_id = ?
    `).get(courseId);

    const passRate = stats.totalSubmissions > 0
      ? Math.round((stats.passCount / stats.totalSubmissions) * 100 * 10) / 10
      : 0;

    // Lesson completion rates
    const lessons = db.prepare(`
      SELECT 
        l.id, l.title, l.lesson_order,
        COUNT(slp.id) as students_completed
      FROM lessons l
      LEFT JOIN student_lesson_progress slp ON l.id = slp.lesson_id AND slp.is_completed = 1
      WHERE l.course_id = ? AND l.is_active = 1
      GROUP BY l.id
      ORDER BY l.lesson_order ASC
    `).all(courseId);

    return res.status(200).json({
      success: true,
      data: {
        course,
        totalEnrolled,
        totalSubmissions: stats.totalSubmissions,
        averagePercentage: Math.round(stats.averagePercentage * 10) / 10,
        highestPercentage: Math.round(stats.highestPercentage * 10) / 10,
        lowestPercentage: Math.round(stats.lowestPercentage * 10) / 10,
        passRate,
        lessonsCompletion: lessons.map(l => ({
          ...l,
          completion_rate: totalEnrolled > 0 ? Math.round((l.students_completed / totalEnrolled) * 100) : 0
        }))
      }
    });
  } catch (err) {
    console.error('Course analytics error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve course analytics.' });
  }
});

/**
 * GET /api/analytics/comparison
 * Compare student performance across assignments vs class average
 */
router.get('/comparison', (req, res) => {
  try {
    const studentId = req.query.student_id ? parseInt(req.query.student_id, 10) : req.user.id;
    if (!canAccessStudent(req.user, studentId)) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const comparisonData = db.prepare(`
      SELECT 
        asn.id as assignment_id,
        asn.title as assignment_title,
        asn.assignment_type,
        c.title as course_title,
        sa.percentage as student_score,
        (SELECT ROUND(AVG(sa2.percentage), 1) FROM student_assignments sa2 WHERE sa2.assignment_id = asn.id AND sa2.is_graded = 1) as class_average,
        (SELECT ROUND(MAX(sa3.percentage), 1) FROM student_assignments sa3 WHERE sa3.assignment_id = asn.id AND sa3.is_graded = 1) as class_highest
      FROM student_assignments sa
      JOIN assignments asn ON sa.assignment_id = asn.id
      JOIN courses c ON asn.course_id = c.id
      WHERE sa.student_id = ? AND sa.is_graded = 1
      ORDER BY sa.submitted_at ASC
    `).all(studentId);

    return res.status(200).json({ success: true, data: comparisonData });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve comparison analytics.' });
  }
});

/**
 * GET /api/analytics/grade-distribution/:assignmentId
 * Grade distribution histogram for a specific exam or assignment
 */
router.get('/grade-distribution/:assignmentId', (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;
    const assign = db.prepare('SELECT id, title, max_score FROM assignments WHERE id = ?').get(assignmentId);
    if (!assign) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    const submissions = db.prepare(`
      SELECT percentage FROM student_assignments 
      WHERE assignment_id = ? AND is_graded = 1
    `).all(assignmentId);

    // Distribution Brackets:
    // A: 90 - 100%
    // B: 80 - 89%
    // C: 70 - 79%
    // D: 60 - 69%
    // F: < 60%
    const distribution = {
      '90-100% (A)': 0,
      '80-89% (B)': 0,
      '70-79% (C)': 0,
      '60-69% (D)': 0,
      'Below 60% (F)': 0
    };

    submissions.forEach(sub => {
      const p = sub.percentage;
      if (p >= 90) distribution['90-100% (A)']++;
      else if (p >= 80) distribution['80-89% (B)']++;
      else if (p >= 70) distribution['70-79% (C)']++;
      else if (p >= 60) distribution['60-69% (D)']++;
      else distribution['Below 60% (F)']++;
    });

    const totalSubmissions = submissions.length;
    const avgScore = totalSubmissions > 0
      ? Math.round((submissions.reduce((acc, cur) => acc + cur.percentage, 0) / totalSubmissions) * 10) / 10
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        assignment: assign,
        totalSubmissions,
        averagePercentage: avgScore,
        distribution
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to calculate grade distribution.' });
  }
});

module.exports = router;

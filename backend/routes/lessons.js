const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { body, query } = require('express-validator');
const { db, logAudit } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { antiScreenshotHeaders, drmVideoHeaders, validateRequest } = require('../middleware/security');

/**
 * Helper to check student enrollment and prerequisite satisfaction
 */
function verifyStudentAccessToLesson(userId, role, lesson) {
  // Staff bypass enrollment & prerequisite checks
  if (['admin', 'manager', 'teacher'].includes(role)) {
    return { allowed: true };
  }

  // 1. Verify active paid enrollment in course
  const enrollment = db.prepare(`
    SELECT id, payment_status, is_active, end_date
    FROM enrollments 
    WHERE student_id = ? AND course_id = ?
  `).get(userId, lesson.course_id);

  if (!enrollment || enrollment.payment_status !== 'paid' || !enrollment.is_active) {
    return {
      allowed: false,
      statusCode: 403,
      message: 'Active enrollment is required to access this lesson. Please complete course payment.'
    };
  }

  // Check expiration if monthly
  if (enrollment.end_date && new Date(enrollment.end_date).getTime() < Date.now()) {
    return {
      allowed: false,
      statusCode: 403,
      message: 'Your course subscription has expired. Please renew your enrollment.'
    };
  }

  // 2. Check prerequisite lesson if specified
  let prereqId = lesson.prerequisite_lesson_id;

  // If no explicit prerequisite_lesson_id, check preceding lesson in order
  if (!prereqId && lesson.lesson_order > 1) {
    const prevLesson = db.prepare(`
      SELECT id, title, lesson_order 
      FROM lessons 
      WHERE course_id = ? AND lesson_order < ? AND is_active = 1
      ORDER BY lesson_order DESC 
      LIMIT 1
    `).get(lesson.course_id, lesson.lesson_order);

    if (prevLesson) {
      prereqId = prevLesson.id;
    }
  }

  if (prereqId) {
    const prereqProgress = db.prepare(`
      SELECT is_completed 
      FROM student_lesson_progress 
      WHERE student_id = ? AND lesson_id = ?
    `).get(userId, prereqId);

    if (!prereqProgress || !prereqProgress.is_completed) {
      const prereqLesson = db.prepare('SELECT title, lesson_order FROM lessons WHERE id = ?').get(prereqId);
      return {
        allowed: false,
        statusCode: 403,
        message: `Prerequisite incomplete: You must complete Lesson ${prereqLesson ? prereqLesson.lesson_order + ' (' + prereqLesson.title + ')' : prereqId} before unlocking this lesson.`,
        prerequisite_id: prereqId
      };
    }
  }

  return { allowed: true };
}

/**
 * GET /api/lessons/:id
 * Retrieve lesson details, materials, assignments, and check prerequisites
 */
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const lessonId = req.params.id;
    const lesson = db.prepare(`
      SELECT l.*, c.title as course_title, c.grade, c.exam_type
      FROM lessons l
      JOIN courses c ON l.course_id = c.id
      WHERE (l.id = ? OR l.uuid = ?) AND l.is_active = 1
    `).get(lessonId, lessonId);

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found.' });
    }

    // Enforce student prerequisites and enrollment
    const access = verifyStudentAccessToLesson(req.user.id, req.user.role, lesson);
    if (!access.allowed) {
      return res.status(access.statusCode).json({
        success: false,
        message: access.message,
        prerequisite_id: access.prerequisite_id
      });
    }

    // Attach student progress
    const progress = db.prepare(`
      SELECT is_completed, watched_percentage, completed_at
      FROM student_lesson_progress 
      WHERE student_id = ? AND lesson_id = ?
    `).get(req.user.id, lesson.id);

    // Attach materials for this lesson
    const materials = db.prepare(`
      SELECT id, uuid, title, file_path, file_type, is_protected, created_at
      FROM materials 
      WHERE lesson_id = ?
    `).all(lesson.id);

    // Attach assignments associated with this lesson
    const assignments = db.prepare(`
      SELECT 
        a.id, a.uuid, a.title, a.description, a.assignment_type, 
        a.time_limit_minutes, a.max_score, a.due_date, a.is_timed,
        sa.submitted_at, sa.score, sa.percentage, sa.is_graded
      FROM assignments a
      LEFT JOIN student_assignments sa ON sa.assignment_id = a.id AND sa.student_id = ?
      WHERE a.lesson_id = ? AND a.is_active = 1
    `).all(req.user.id, lesson.id);

    return res.status(200).json({
      success: true,
      data: {
        ...lesson,
        progress: progress || { is_completed: 0, watched_percentage: 0, completed_at: null },
        materials,
        assignments
      }
    });
  } catch (err) {
    console.error('Fetch lesson error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve lesson.' });
  }
});

/**
 * POST /api/lessons
 * Create new lesson (manager/teacher/admin)
 */
router.post(
  '/',
  authenticateToken,
  requireRole('admin', 'manager', 'teacher'),
  [
    body('course_id').isInt().withMessage('Valid course_id is required'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('lesson_order').isInt({ min: 1 }).withMessage('Lesson order must be a positive integer'),
    body('video_type').optional().isIn(['live', 'recorded']),
    validateRequest
  ],
  (req, res) => {
    try {
      const {
        course_id,
        title,
        description,
        lesson_order,
        video_url,
        video_type,
        is_live,
        live_date,
        duration_minutes,
        is_protected,
        prerequisite_lesson_id
      } = req.body;

      const course = db.prepare('SELECT id FROM courses WHERE id = ?').get(course_id);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Target course not found.' });
      }

      const uuid = uuidv4();
      const now = new Date().toISOString();

      const stmt = db.prepare(`
        INSERT INTO lessons (
          uuid, course_id, title, description, lesson_order, video_url, video_type, 
          is_live, live_date, duration_minutes, is_protected, prerequisite_lesson_id, 
          is_active, created_at, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `);

      const result = stmt.run(
        uuid,
        course_id,
        title,
        description || '',
        lesson_order,
        video_url || '',
        video_type || 'recorded',
        is_live ? 1 : 0,
        live_date || null,
        duration_minutes || 0,
        is_protected !== undefined ? (is_protected ? 1 : 0) : 1,
        prerequisite_lesson_id || null,
        now,
        req.user.id
      );

      logAudit(req.user.id, 'LESSON_CREATED', { lessonId: result.lastInsertRowid, title, course_id }, req.ip);

      return res.status(201).json({
        success: true,
        message: 'Lesson created successfully.',
        data: {
          id: result.lastInsertRowid,
          uuid,
          course_id,
          title,
          lesson_order
        }
      });
    } catch (err) {
      console.error('Create lesson error:', err);
      return res.status(500).json({ success: false, message: 'Failed to create lesson.' });
    }
  }
);

/**
 * PUT /api/lessons/:id
 * Update lesson
 */
router.put(
  '/:id',
  authenticateToken,
  requireRole('admin', 'manager', 'teacher'),
  [
    body('title').optional().trim().notEmpty(),
    body('lesson_order').optional().isInt({ min: 1 }),
    validateRequest
  ],
  (req, res) => {
    try {
      const lessonId = req.params.id;
      const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(lessonId);
      if (!lesson) {
        return res.status(404).json({ success: false, message: 'Lesson not found.' });
      }

      const {
        title,
        description,
        lesson_order,
        video_url,
        video_type,
        is_live,
        live_date,
        duration_minutes,
        is_protected,
        prerequisite_lesson_id,
        is_active
      } = req.body;

      db.prepare(`
        UPDATE lessons 
        SET title = ?, description = ?, lesson_order = ?, video_url = ?, video_type = ?, 
            is_live = ?, live_date = ?, duration_minutes = ?, is_protected = ?, 
            prerequisite_lesson_id = ?, is_active = ?
        WHERE id = ?
      `).run(
        title !== undefined ? title : lesson.title,
        description !== undefined ? description : lesson.description,
        lesson_order !== undefined ? lesson_order : lesson.lesson_order,
        video_url !== undefined ? video_url : lesson.video_url,
        video_type !== undefined ? video_type : lesson.video_type,
        is_live !== undefined ? (is_live ? 1 : 0) : lesson.is_live,
        live_date !== undefined ? live_date : lesson.live_date,
        duration_minutes !== undefined ? duration_minutes : lesson.duration_minutes,
        is_protected !== undefined ? (is_protected ? 1 : 0) : lesson.is_protected,
        prerequisite_lesson_id !== undefined ? prerequisite_lesson_id : lesson.prerequisite_lesson_id,
        is_active !== undefined ? is_active : lesson.is_active,
        lessonId
      );

      logAudit(req.user.id, 'LESSON_UPDATED', { lessonId }, req.ip);

      return res.status(200).json({ success: true, message: 'Lesson updated successfully.' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to update lesson.' });
    }
  }
);

/**
 * DELETE /api/lessons/:id
 * Soft delete lesson
 */
router.delete('/:id', authenticateToken, requireRole('admin', 'manager', 'teacher'), (req, res) => {
  try {
    const lessonId = req.params.id;
    db.prepare('UPDATE lessons SET is_active = 0 WHERE id = ?').run(lessonId);
    logAudit(req.user.id, 'LESSON_DEACTIVATED', { lessonId }, req.ip);
    return res.status(200).json({ success: true, message: 'Lesson deactivated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to deactivate lesson.' });
  }
});

/**
 * POST /api/lessons/:id/progress
 * Update student watch progress percentage
 */
router.post(
  '/:id/progress',
  authenticateToken,
  [
    body('percentage').isFloat({ min: 0, max: 100 }).withMessage('Percentage must be between 0 and 100'),
    validateRequest
  ],
  (req, res) => {
    try {
      const lessonId = req.params.id;
      const { percentage } = req.body;
      const studentId = req.user.id;

      const lesson = db.prepare('SELECT id, course_id FROM lessons WHERE id = ?').get(lessonId);
      if (!lesson) {
        return res.status(404).json({ success: false, message: 'Lesson not found.' });
      }

      // Upsert progress
      const existing = db.prepare('SELECT * FROM student_lesson_progress WHERE student_id = ? AND lesson_id = ?').get(studentId, lessonId);

      const isCompleted = percentage >= 90 ? 1 : (existing ? existing.is_completed : 0);
      const completedAt = isCompleted && (!existing || !existing.is_completed) ? new Date().toISOString() : (existing ? existing.completed_at : null);

      if (existing) {
        // Keep highest watched percentage
        const highestPct = Math.max(existing.watched_percentage, percentage);
        db.prepare(`
          UPDATE student_lesson_progress 
          SET watched_percentage = ?, is_completed = ?, completed_at = ?
          WHERE id = ?
        `).run(highestPct, isCompleted, completedAt, existing.id);
      } else {
        db.prepare(`
          INSERT INTO student_lesson_progress (student_id, lesson_id, watched_percentage, is_completed, completed_at)
          VALUES (?, ?, ?, ?, ?)
        `).run(studentId, lessonId, percentage, isCompleted, completedAt);
      }

      return res.status(200).json({
        success: true,
        message: 'Watch progress updated.',
        data: {
          lesson_id: lessonId,
          watched_percentage: percentage,
          is_completed: !!isCompleted
        }
      });
    } catch (err) {
      console.error('Update progress error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update watch progress.' });
    }
  }
);

/**
 * POST /api/lessons/:id/complete
 * Explicitly mark lesson as completed
 */
router.post('/:id/complete', authenticateToken, (req, res) => {
  try {
    const lessonId = req.params.id;
    const studentId = req.user.id;
    const now = new Date().toISOString();

    const lesson = db.prepare('SELECT id FROM lessons WHERE id = ?').get(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found.' });
    }

    const existing = db.prepare('SELECT * FROM student_lesson_progress WHERE student_id = ? AND lesson_id = ?').get(studentId, lessonId);
    if (existing) {
      db.prepare(`
        UPDATE student_lesson_progress 
        SET is_completed = 1, watched_percentage = 100, completed_at = ?
        WHERE id = ?
      `).run(now, existing.id);
    } else {
      db.prepare(`
        INSERT INTO student_lesson_progress (student_id, lesson_id, is_completed, watched_percentage, completed_at)
        VALUES (?, ?, 1, 100, ?)
      `).run(studentId, lessonId, now);
    }

    logAudit(studentId, 'LESSON_COMPLETED', { lessonId }, req.ip);

    return res.status(200).json({
      success: true,
      message: 'Lesson marked as completed successfully.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to complete lesson.' });
  }
});

/**
 * GET /api/lessons/:id/stream
 * Protected video streaming endpoint with DRM & Anti-screenshot protection
 */
router.get('/:id/stream', authenticateToken, antiScreenshotHeaders, drmVideoHeaders, (req, res) => {
  try {
    const lessonId = req.params.id;
    const lesson = db.prepare('SELECT * FROM lessons WHERE id = ? AND is_active = 1').get(lessonId);

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found.' });
    }

    // Verify student permissions & prerequisites
    const access = verifyStudentAccessToLesson(req.user.id, req.user.role, lesson);
    if (!access.allowed) {
      return res.status(access.statusCode).json({ success: false, message: access.message });
    }

    if (!lesson.video_url) {
      return res.status(404).json({ success: false, message: 'No video stream configured for this lesson.' });
    }

    // If external URL (e.g. YouTube, Vimeo, HLS m3u8 stream), redirect or serve signed metadata
    if (lesson.video_url.startsWith('http://') || lesson.video_url.startsWith('https://')) {
      return res.status(200).json({
        success: true,
        streamType: 'external',
        url: lesson.video_url,
        is_protected: lesson.is_protected,
        watermark: {
          text: `${req.user.username} - ${req.user.phone || ''} - ${new Date().toISOString().split('T')[0]}`
        }
      });
    }

    // Local file streaming with HTTP 206 Partial Content support
    const videoFilePath = path.resolve(__dirname, '..', lesson.video_url);
    if (!fs.existsSync(videoFilePath)) {
      return res.status(404).json({ success: false, message: 'Video media file not found on server.' });
    }

    const stat = fs.statSync(videoFilePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      const file = fs.createReadStream(videoFilePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4'
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4'
      });
      fs.createReadStream(videoFilePath).pipe(res);
    }
  } catch (err) {
    console.error('Video stream error:', err);
    return res.status(500).json({ success: false, message: 'Video streaming error.' });
  }
});

module.exports = router;

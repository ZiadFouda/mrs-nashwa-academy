const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { body, query } = require('express-validator');
const { db, logAudit } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateRequest } = require('../middleware/security');

/**
 * GET /api/assignments/course/:courseId
 * List assignments for a course
 */
router.get('/course/:courseId', authenticateToken, (req, res) => {
  try {
    const { courseId } = req.params;
    const assignments = db.prepare(`
      SELECT 
        a.id, a.uuid, a.course_id, a.lesson_id, a.title, a.description, 
        a.assignment_type, a.time_limit_minutes, a.max_score, a.due_date, 
        a.is_timed, a.auto_submit, a.is_active, a.created_at,
        (SELECT COUNT(*) FROM questions WHERE assignment_id = a.id) as question_count,
        sa.started_at, sa.submitted_at, sa.score, sa.percentage, sa.is_graded
      FROM assignments a
      LEFT JOIN student_assignments sa ON sa.assignment_id = a.id AND sa.student_id = ?
      WHERE a.course_id = ? AND a.is_active = 1
      ORDER BY a.created_at DESC
    `).all(req.user.id, courseId);

    return res.status(200).json({ success: true, data: assignments });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve assignments.' });
  }
});

/**
 * GET /api/assignments/:id
 * Retrieve assignment details and questions
 * STUDENTS DO NOT RECEIVE CORRECT ANSWERS OR EXPLANATIONS!
 */
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const assignmentId = req.params.id;
    const isStaff = ['admin', 'manager', 'teacher'].includes(req.user.role);

    const assignment = db.prepare(`
      SELECT a.*, c.title as course_title, c.grade, c.exam_type
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      WHERE (a.id = ? OR a.uuid = ?) AND a.is_active = 1
    `).get(assignmentId, assignmentId);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    // Check student submission
    const submission = db.prepare(`
      SELECT * FROM student_assignments 
      WHERE student_id = ? AND assignment_id = ?
    `).get(req.user.id, assignment.id);

    // Fetch questions
    let questions;
    if (isStaff || (submission && submission.submitted_at)) {
      // Staff or student who already submitted can see full question info
      questions = db.prepare(`
        SELECT id, question_text, question_type, option_a, option_b, option_c, option_d, 
               correct_answer, points, explanation, question_order, image_url
        FROM questions 
        WHERE assignment_id = ?
        ORDER BY question_order ASC
      `).all(assignment.id);
    } else {
      // Students taking the exam MUST NOT see correct_answer or explanation
      questions = db.prepare(`
        SELECT id, question_text, question_type, option_a, option_b, option_c, option_d, 
               points, question_order, image_url
        FROM questions 
        WHERE assignment_id = ?
        ORDER BY question_order ASC
      `).all(assignment.id);
    }

    return res.status(200).json({
      success: true,
      data: {
        ...assignment,
        submission: submission || null,
        questions
      }
    });
  } catch (err) {
    console.error('Fetch assignment error:', err);
    return res.status(500).json({ success: false, message: 'Error retrieving assignment.' });
  }
});

/**
 * POST /api/assignments
 * Create new assignment (manager/teacher/admin)
 */
router.post(
  '/',
  authenticateToken,
  requireRole('admin', 'manager', 'teacher'),
  [
    body('course_id').isInt().withMessage('Valid course_id is required'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('assignment_type').isIn(['exam', 'homework', 'quiz']).withMessage('Invalid assignment type'),
    body('time_limit_minutes').optional().isInt({ min: 0 }),
    body('max_score').optional().isInt({ min: 1 }),
    validateRequest
  ],
  (req, res) => {
    try {
      const {
        course_id,
        lesson_id,
        title,
        description,
        assignment_type,
        time_limit_minutes,
        max_score,
        due_date,
        is_timed,
        auto_submit
      } = req.body;

      const course = db.prepare('SELECT id FROM courses WHERE id = ?').get(course_id);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found.' });
      }

      const uuid = uuidv4();
      const now = new Date().toISOString();

      const stmt = db.prepare(`
        INSERT INTO assignments (
          uuid, course_id, lesson_id, title, description, assignment_type, 
          time_limit_minutes, max_score, due_date, is_timed, auto_submit, 
          is_active, created_at, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `);

      const result = stmt.run(
        uuid,
        course_id,
        lesson_id || null,
        title,
        description || '',
        assignment_type,
        time_limit_minutes || 0,
        max_score || 100,
        due_date || null,
        is_timed ? 1 : (time_limit_minutes > 0 ? 1 : 0),
        auto_submit !== undefined ? (auto_submit ? 1 : 0) : 1,
        now,
        req.user.id
      );

      logAudit(req.user.id, 'ASSIGNMENT_CREATED', { assignmentId: result.lastInsertRowid, title, assignment_type }, req.ip);

      return res.status(201).json({
        success: true,
        message: 'Assignment created successfully.',
        data: {
          id: result.lastInsertRowid,
          uuid,
          title,
          assignment_type
        }
      });
    } catch (err) {
      console.error('Assignment create error:', err);
      return res.status(500).json({ success: false, message: 'Failed to create assignment.' });
    }
  }
);

/**
 * PUT /api/assignments/:id
 * Update assignment
 */
router.put(
  '/:id',
  authenticateToken,
  requireRole('admin', 'manager', 'teacher'),
  [
    body('title').optional().trim().notEmpty(),
    body('assignment_type').optional().isIn(['exam', 'homework', 'quiz']),
    body('time_limit_minutes').optional().isInt({ min: 0 }),
    body('max_score').optional().isInt({ min: 1 }),
    validateRequest
  ],
  (req, res) => {
    try {
      const assignmentId = req.params.id;
      const assign = db.prepare('SELECT * FROM assignments WHERE id = ?').get(assignmentId);
      if (!assign) {
        return res.status(404).json({ success: false, message: 'Assignment not found.' });
      }

      const {
        title,
        description,
        assignment_type,
        time_limit_minutes,
        max_score,
        due_date,
        is_timed,
        auto_submit,
        is_active,
        lesson_id
      } = req.body;

      db.prepare(`
        UPDATE assignments 
        SET title = ?, description = ?, assignment_type = ?, time_limit_minutes = ?, 
            max_score = ?, due_date = ?, is_timed = ?, auto_submit = ?, 
            is_active = ?, lesson_id = ?
        WHERE id = ?
      `).run(
        title !== undefined ? title : assign.title,
        description !== undefined ? description : assign.description,
        assignment_type !== undefined ? assignment_type : assign.assignment_type,
        time_limit_minutes !== undefined ? time_limit_minutes : assign.time_limit_minutes,
        max_score !== undefined ? max_score : assign.max_score,
        due_date !== undefined ? due_date : assign.due_date,
        is_timed !== undefined ? (is_timed ? 1 : 0) : assign.is_timed,
        auto_submit !== undefined ? (auto_submit ? 1 : 0) : assign.auto_submit,
        is_active !== undefined ? is_active : assign.is_active,
        lesson_id !== undefined ? lesson_id : assign.lesson_id,
        assignmentId
      );

      logAudit(req.user.id, 'ASSIGNMENT_UPDATED', { assignmentId }, req.ip);

      return res.status(200).json({ success: true, message: 'Assignment updated successfully.' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to update assignment.' });
    }
  }
);

/**
 * DELETE /api/assignments/:id
 * Soft delete assignment
 */
router.delete('/:id', authenticateToken, requireRole('admin', 'manager', 'teacher'), (req, res) => {
  try {
    const assignmentId = req.params.id;
    db.prepare('UPDATE assignments SET is_active = 0 WHERE id = ?').run(assignmentId);
    logAudit(req.user.id, 'ASSIGNMENT_DEACTIVATED', { assignmentId }, req.ip);
    return res.status(200).json({ success: true, message: 'Assignment deactivated.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete assignment.' });
  }
});

/**
 * POST /api/assignments/:id/questions
 * Add question to assignment
 */
router.post(
  '/:id/questions',
  authenticateToken,
  requireRole('admin', 'manager', 'teacher'),
  [
    body('question_text').trim().notEmpty().withMessage('Question text is required'),
    body('question_type').isIn(['mcq', 'true_false', 'fill_blank']).withMessage('Invalid question type'),
    body('correct_answer').trim().notEmpty().withMessage('Correct answer is required'),
    body('points').optional().isInt({ min: 1 }),
    validateRequest
  ],
  (req, res) => {
    try {
      const assignmentId = req.params.id;
      const {
        question_text,
        question_type,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        points,
        explanation,
        question_order,
        image_url
      } = req.body;

      const assign = db.prepare('SELECT id FROM assignments WHERE id = ?').get(assignmentId);
      if (!assign) {
        return res.status(404).json({ success: false, message: 'Assignment not found.' });
      }

      let order = question_order;
      if (!order) {
        const maxOrder = db.prepare('SELECT COALESCE(MAX(question_order), 0) as m FROM questions WHERE assignment_id = ?').get(assignmentId).m;
        order = maxOrder + 1;
      }

      const stmt = db.prepare(`
        INSERT INTO questions (
          assignment_id, question_text, question_type, option_a, option_b, 
          option_c, option_d, correct_answer, points, explanation, question_order, image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        assignmentId,
        question_text,
        question_type,
        option_a || null,
        option_b || null,
        option_c || null,
        option_d || null,
        correct_answer.trim(),
        points || 1,
        explanation || null,
        order,
        image_url || null
      );

      return res.status(201).json({
        success: true,
        message: 'Question added successfully.',
        data: { id: result.lastInsertRowid, assignment_id: assignmentId }
      });
    } catch (err) {
      console.error('Add question error:', err);
      return res.status(500).json({ success: false, message: 'Failed to add question.' });
    }
  }
);

/**
 * POST /api/assignments/:id/questions/bulk
 * Bulk add questions to assignment
 */
router.post(
  '/:id/questions/bulk',
  authenticateToken,
  requireRole('admin', 'manager', 'teacher'),
  [
    body('questions').isArray({ min: 1 }).withMessage('List of questions is required'),
    validateRequest
  ],
  (req, res) => {
    try {
      const assignmentId = req.params.id;
      const { questions } = req.body;

      const assign = db.prepare('SELECT id FROM assignments WHERE id = ?').get(assignmentId);
      if (!assign) {
        return res.status(404).json({ success: false, message: 'Assignment not found.' });
      }

      const maxOrder = db.prepare('SELECT COALESCE(MAX(question_order), 0) as m FROM questions WHERE assignment_id = ?').get(assignmentId).m;
      let currentOrder = maxOrder;

      const stmt = db.prepare(`
        INSERT INTO questions (
          assignment_id, question_text, question_type, option_a, option_b, 
          option_c, option_d, correct_answer, points, explanation, question_order, image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const bulkTx = db.transaction(() => {
        for (const q of questions) {
          currentOrder++;
          stmt.run(
            assignmentId,
            q.question_text,
            q.question_type || 'mcq',
            q.option_a || null,
            q.option_b || null,
            q.option_c || null,
            q.option_d || null,
            String(q.correct_answer || 'A').trim(),
            q.points || 1,
            q.explanation || null,
            currentOrder,
            q.image_url || null
          );
        }
      });

      bulkTx();

      logAudit(req.user.id, 'QUESTIONS_BULK_ADDED', { assignmentId, count: questions.length }, req.ip);

      return res.status(201).json({
        success: true,
        message: `Successfully added ${questions.length} questions to assignment.`
      });
    } catch (err) {
      console.error('Bulk add questions error:', err);
      return res.status(500).json({ success: false, message: 'Failed to add questions in bulk.' });
    }
  }
);

/**
 * PUT /api/assignments/questions/:questionId
 * Update single question
 */
router.put('/questions/:questionId', authenticateToken, requireRole('admin', 'manager', 'teacher'), (req, res) => {
  try {
    const { questionId } = req.params;
    const q = db.prepare('SELECT * FROM questions WHERE id = ?').get(questionId);
    if (!q) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    const {
      question_text,
      question_type,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      points,
      explanation,
      question_order,
      image_url
    } = req.body;

    db.prepare(`
      UPDATE questions 
      SET question_text = ?, question_type = ?, option_a = ?, option_b = ?, 
          option_c = ?, option_d = ?, correct_answer = ?, points = ?, 
          explanation = ?, question_order = ?, image_url = ?
      WHERE id = ?
    `).run(
      question_text !== undefined ? question_text : q.question_text,
      question_type !== undefined ? question_type : q.question_type,
      option_a !== undefined ? option_a : q.option_a,
      option_b !== undefined ? option_b : q.option_b,
      option_c !== undefined ? option_c : q.option_c,
      option_d !== undefined ? option_d : q.option_d,
      correct_answer !== undefined ? correct_answer : q.correct_answer,
      points !== undefined ? points : q.points,
      explanation !== undefined ? explanation : q.explanation,
      question_order !== undefined ? question_order : q.question_order,
      image_url !== undefined ? image_url : q.image_url,
      questionId
    );

    return res.status(200).json({ success: true, message: 'Question updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update question.' });
  }
});

/**
 * DELETE /api/assignments/questions/:questionId
 * Delete question
 */
router.delete('/questions/:questionId', authenticateToken, requireRole('admin', 'manager', 'teacher'), (req, res) => {
  try {
    const { questionId } = req.params;
    db.prepare('DELETE FROM questions WHERE id = ?').run(questionId);
    return res.status(200).json({ success: true, message: 'Question deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete question.' });
  }
});

/**
 * POST /api/assignments/:id/start
 * Start timed assignment and record timer
 */
router.post('/:id/start', authenticateToken, (req, res) => {
  try {
    const assignmentId = req.params.id;
    const studentId = req.user.id;

    const assign = db.prepare('SELECT * FROM assignments WHERE id = ? AND is_active = 1').get(assignmentId);
    if (!assign) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    const existing = db.prepare('SELECT * FROM student_assignments WHERE student_id = ? AND assignment_id = ?').get(studentId, assignmentId);

    if (existing && existing.submitted_at) {
      return res.status(400).json({ success: false, message: 'Assignment already submitted.' });
    }

    const now = new Date().toISOString();

    if (existing) {
      // Return ongoing start time and remaining seconds
      let remaining = null;
      if (assign.time_limit_minutes > 0) {
        const startMs = new Date(existing.started_at).getTime();
        const elapsedSecs = Math.floor((Date.now() - startMs) / 1000);
        const totalSecs = assign.time_limit_minutes * 60;
        remaining = Math.max(0, totalSecs - elapsedSecs);
      }

      return res.status(200).json({
        success: true,
        message: 'Resuming ongoing assignment attempt.',
        data: {
          started_at: existing.started_at,
          time_limit_minutes: assign.time_limit_minutes,
          time_remaining_seconds: remaining
        }
      });
    }

    // Insert new submission entry
    const totalSecs = assign.time_limit_minutes > 0 ? assign.time_limit_minutes * 60 : null;
    db.prepare(`
      INSERT INTO student_assignments (student_id, assignment_id, started_at, time_remaining_seconds, is_auto_submitted, is_graded)
      VALUES (?, ?, ?, ?, 0, 0)
    `).run(studentId, assignmentId, now, totalSecs);

    logAudit(studentId, 'ASSIGNMENT_STARTED', { assignmentId, title: assign.title }, req.ip);

    return res.status(200).json({
      success: true,
      message: 'Assignment started.',
      data: {
        started_at: now,
        time_limit_minutes: assign.time_limit_minutes,
        time_remaining_seconds: totalSecs
      }
    });
  } catch (err) {
    console.error('Start assignment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to start assignment.' });
  }
});

/**
 * POST /api/assignments/:id/check-time
 * Check remaining time and trigger auto-submit if expired
 */
router.post('/:id/check-time', authenticateToken, (req, res) => {
  try {
    const assignmentId = req.params.id;
    const studentId = req.user.id;

    const assign = db.prepare('SELECT * FROM assignments WHERE id = ?').get(assignmentId);
    const sub = db.prepare('SELECT * FROM student_assignments WHERE student_id = ? AND assignment_id = ?').get(studentId, assignmentId);

    if (!assign || !sub) {
      return res.status(404).json({ success: false, message: 'Active attempt not found.' });
    }

    if (sub.submitted_at) {
      return res.status(200).json({ success: true, is_submitted: true, time_remaining_seconds: 0 });
    }

    if (!assign.time_limit_minutes || assign.time_limit_minutes <= 0) {
      return res.status(200).json({ success: true, is_timed: false, time_remaining_seconds: null });
    }

    const startMs = new Date(sub.started_at).getTime();
    const elapsedSecs = Math.floor((Date.now() - startMs) / 1000);
    const totalSecs = assign.time_limit_minutes * 60;
    const remaining = totalSecs - elapsedSecs;

    if (remaining <= 0) {
      // Time expired: auto submit
      return res.status(200).json({
        success: true,
        is_expired: true,
        time_remaining_seconds: 0,
        message: 'Time has expired. Submitting your answers now.'
      });
    }

    return res.status(200).json({
      success: true,
      is_expired: false,
      time_remaining_seconds: remaining
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error checking assignment time.' });
  }
});

/**
 * POST /api/assignments/:id/submit
 * Submit answers, calculate score, record percentage and update analytics table
 */
router.post(
  '/:id/submit',
  authenticateToken,
  [
    body('answers').isObject().withMessage('Answers object map is required: { questionId: answer }'),
    body('is_auto_submitted').optional().isBoolean(),
    validateRequest
  ],
  (req, res) => {
    try {
      const assignmentId = req.params.id;
      const studentId = req.user.id;
      const { answers, is_auto_submitted } = req.body;
      const now = new Date().toISOString();

      const assign = db.prepare('SELECT * FROM assignments WHERE id = ?').get(assignmentId);
      if (!assign) {
        return res.status(404).json({ success: false, message: 'Assignment not found.' });
      }

      const existingSub = db.prepare('SELECT * FROM student_assignments WHERE student_id = ? AND assignment_id = ?').get(studentId, assignmentId);
      if (existingSub && existingSub.submitted_at) {
        return res.status(400).json({ success: false, message: 'This assignment has already been submitted.' });
      }

      // Fetch all questions for grading
      const questions = db.prepare('SELECT id, question_type, correct_answer, points FROM questions WHERE assignment_id = ?').all(assignmentId);

      let earnedPoints = 0;
      let totalPossiblePoints = 0;
      const gradedAnswers = {};

      for (const q of questions) {
        const questionPoints = q.points || 1;
        totalPossiblePoints += questionPoints;

        const studentAns = answers[q.id] !== undefined ? String(answers[q.id]).trim() : '';
        const correctAns = String(q.correct_answer).trim();

        let isCorrect = false;
        if (q.question_type === 'mcq') {
          isCorrect = studentAns.toUpperCase() === correctAns.toUpperCase();
        } else if (q.question_type === 'true_false') {
          isCorrect = studentAns.toLowerCase() === correctAns.toLowerCase();
        } else {
          // Fill in the blank
          isCorrect = studentAns.toLowerCase() === correctAns.toLowerCase();
        }

        if (isCorrect) {
          earnedPoints += questionPoints;
        }

        gradedAnswers[q.id] = {
          student_answer: studentAns,
          is_correct: isCorrect,
          points_earned: isCorrect ? questionPoints : 0
        };
      }

      // Calculate score scaled to assign.max_score
      const percentage = totalPossiblePoints > 0 ? (earnedPoints / totalPossiblePoints) * 100 : 0;
      const scaledScore = (percentage / 100) * (assign.max_score || 100);
      const roundedPercentage = Math.round(percentage * 10) / 10;
      const roundedScore = Math.round(scaledScore * 10) / 10;

      // Update or insert into student_assignments
      if (existingSub) {
        db.prepare(`
          UPDATE student_assignments 
          SET submitted_at = ?, time_remaining_seconds = 0, is_auto_submitted = ?, 
              score = ?, max_score = ?, percentage = ?, answers_json = ?, is_graded = 1
          WHERE id = ?
        `).run(
          now,
          is_auto_submitted ? 1 : 0,
          roundedScore,
          assign.max_score,
          roundedPercentage,
          JSON.stringify(answers),
          existingSub.id
        );
      } else {
        db.prepare(`
          INSERT INTO student_assignments (
            student_id, assignment_id, started_at, submitted_at, time_remaining_seconds, 
            is_auto_submitted, score, max_score, percentage, answers_json, is_graded
          ) VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?, 1)
        `).run(
          studentId,
          assignmentId,
          now,
          now,
          is_auto_submitted ? 1 : 0,
          roundedScore,
          assign.max_score,
          roundedPercentage,
          JSON.stringify(answers)
        );
      }

      // Record in Analytics Table
      db.prepare(`
        INSERT INTO analytics (student_id, course_id, assessment_type, assessment_id, score, max_score, percentage, recorded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        studentId,
        assign.course_id,
        assign.assignment_type,
        assignmentId,
        roundedScore,
        assign.max_score,
        roundedPercentage,
        now
      );

      logAudit(studentId, 'ASSIGNMENT_SUBMITTED', {
        assignmentId,
        score: roundedScore,
        maxScore: assign.max_score,
        percentage: roundedPercentage,
        autoSubmitted: !!is_auto_submitted
      }, req.ip);

      return res.status(200).json({
        success: true,
        message: 'Assignment submitted and graded successfully.',
        data: {
          score: roundedScore,
          max_score: assign.max_score,
          percentage: roundedPercentage,
          total_questions: questions.length,
          graded_answers: gradedAnswers
        }
      });
    } catch (err) {
      console.error('Submit assignment error:', err);
      return res.status(500).json({ success: false, message: 'Failed to submit assignment.' });
    }
  }
);

/**
 * GET /api/assignments/:id/results
 * View results and detailed solution analysis
 */
router.get('/:id/results', authenticateToken, (req, res) => {
  try {
    const assignmentId = req.params.id;
    const targetStudentId = (['admin', 'manager', 'teacher'].includes(req.user.role) && req.query.student_id)
      ? parseInt(req.query.student_id, 10)
      : req.user.id;

    const assign = db.prepare(`
      SELECT a.*, c.title as course_title, c.grade, c.exam_type 
      FROM assignments a 
      JOIN courses c ON a.course_id = c.id 
      WHERE a.id = ?
    `).get(assignmentId);

    if (!assign) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    const sub = db.prepare(`
      SELECT * FROM student_assignments 
      WHERE student_id = ? AND assignment_id = ?
    `).get(targetStudentId, assignmentId);

    if (!sub || !sub.submitted_at) {
      return res.status(404).json({ success: false, message: 'No graded submission found for this assignment.' });
    }

    const questions = db.prepare(`
      SELECT id, question_text, question_type, option_a, option_b, option_c, option_d, 
             correct_answer, points, explanation, question_order, image_url
      FROM questions 
      WHERE assignment_id = ?
      ORDER BY question_order ASC
    `).all(assignmentId);

    let submittedAnswers = {};
    try {
      submittedAnswers = JSON.parse(sub.answers_json || '{}');
    } catch (e) {
      submittedAnswers = {};
    }

    const detailedReview = questions.map(q => {
      const studentAns = submittedAnswers[q.id] !== undefined ? String(submittedAnswers[q.id]).trim() : '';
      const correctAns = String(q.correct_answer).trim();
      const isCorrect = studentAns.toUpperCase() === correctAns.toUpperCase();

      return {
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        student_answer: studentAns,
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        points: q.points,
        explanation: q.explanation,
        image_url: q.image_url
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        assignment: {
          id: assign.id,
          title: assign.title,
          assignment_type: assign.assignment_type,
          course_title: assign.course_title,
          grade: assign.grade,
          exam_type: assign.exam_type
        },
        submission: {
          started_at: sub.started_at,
          submitted_at: sub.submitted_at,
          is_auto_submitted: sub.is_auto_submitted,
          score: sub.score,
          max_score: sub.max_score,
          percentage: sub.percentage
        },
        review: detailedReview
      }
    });
  } catch (err) {
    console.error('Fetch results error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve assignment results.' });
  }
});

/**
 * PUT /api/assignments/:id/time-limit
 * Set or update time limit (manager/teacher/admin)
 */
router.put(
  '/:id/time-limit',
  authenticateToken,
  requireRole('admin', 'manager', 'teacher'),
  [
    body('time_limit_minutes').isInt({ min: 0 }).withMessage('Time limit in minutes must be 0 or greater'),
    validateRequest
  ],
  (req, res) => {
    try {
      const assignmentId = req.params.id;
      const { time_limit_minutes } = req.body;

      const assign = db.prepare('SELECT id FROM assignments WHERE id = ?').get(assignmentId);
      if (!assign) {
        return res.status(404).json({ success: false, message: 'Assignment not found.' });
      }

      db.prepare(`
        UPDATE assignments 
        SET time_limit_minutes = ?, is_timed = ?
        WHERE id = ?
      `).run(time_limit_minutes, time_limit_minutes > 0 ? 1 : 0, assignmentId);

      logAudit(req.user.id, 'TIME_LIMIT_UPDATED', { assignmentId, time_limit_minutes }, req.ip);

      return res.status(200).json({
        success: true,
        message: 'Time limit updated successfully.',
        data: { assignment_id: assignmentId, time_limit_minutes }
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to update time limit.' });
    }
  }
);

module.exports = router;

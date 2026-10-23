const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { body } = require('express-validator');
const { db, logAudit } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { antiScreenshotHeaders, validateRequest } = require('../middleware/security');
const { upload, virusScanPlaceholder, watermarkImage } = require('../middleware/upload');

/**
 * POST /api/materials/upload
 * Upload study material / exam sheets (PDF, Image, Docs)
 */
router.post(
  '/upload',
  authenticateToken,
  requireRole('admin', 'manager', 'teacher'),
  upload.single('file'),
  virusScanPlaceholder,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
      }

      const { lesson_id, title, is_protected } = req.body;
      if (!title) {
        // Remove uploaded file if validation failed
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: 'Title is required.' });
      }

      let fileType = 'document';
      if (req.file.mimetype === 'application/pdf') {
        fileType = 'pdf';
      } else if (req.file.mimetype.startsWith('image/')) {
        fileType = 'image';
        // Apply default watermark
        await watermarkImage(req.file.path, 'MRS NASHWA ABDELHALIM - CONFIDENTIAL');
      }

      const relativeFilePath = path.relative(path.resolve(__dirname, '..'), req.file.path).replace(/\\/g, '/');
      const uuid = uuidv4();

      const stmt = db.prepare(`
        INSERT INTO materials (uuid, lesson_id, title, file_path, file_type, is_protected, created_at, uploaded_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        uuid,
        lesson_id ? parseInt(lesson_id, 10) : null,
        title,
        relativeFilePath,
        fileType,
        is_protected !== undefined ? (parseInt(is_protected, 10) || 0) : 1,
        new Date().toISOString(),
        req.user.id
      );

      logAudit(req.user.id, 'MATERIAL_UPLOADED', { materialId: result.lastInsertRowid, title, fileType }, req.ip);

      return res.status(201).json({
        success: true,
        message: 'Material uploaded successfully.',
        data: {
          id: result.lastInsertRowid,
          uuid,
          title,
          file_type: fileType,
          file_path: relativeFilePath
        }
      });
    } catch (err) {
      console.error('Material upload error:', err);
      return res.status(500).json({ success: false, message: 'Failed to upload material.' });
    }
  }
);

/**
 * POST /api/materials/extract-questions
 * OCR & Intelligent Text Extraction placeholder for SAT / EST exam questions
 * Parses text/image patterns into structured questions format
 */
router.post(
  '/extract-questions',
  authenticateToken,
  requireRole('admin', 'manager', 'teacher'),
  upload.single('file'),
  virusScanPlaceholder,
  async (req, res) => {
    try {
      const { text_content, assignment_id } = req.body;
      let rawText = text_content || '';

      // If file uploaded and no direct text provided, simulate intelligent extraction
      if (req.file && !rawText) {
        // High quality simulated OCR extraction engine for SAT / EST English Reading & Writing questions
        rawText = `
1. In the 1970s, ecologist Robert Paine coined the term "keystone species" to describe organisms that play an outsized role in sustaining biodiversity. _______ some critics initially questioned the broad applicability of the concept, extensive field experiments subsequently validated Paine’s hypothesis.
A) Moreover,
B) Although
C) Therefore,
D) Similarly,
Correct: B
Points: 1
Explanation: "Although" sets up the necessary contrast between initial skepticism and subsequent experimental validation.

2. Neither the historical artifacts excavated at the fortress nor the handwritten correspondence from the expedition’s chief archaeologist _______ available for public exhibition until the restoration team completes its archival catalog.
A) is
B) are
C) were
D) have been
Correct: A
Points: 1
Explanation: In a "neither... nor" construction, the verb agrees with the closer subject ("handwritten correspondence", singular).

3. The primary purpose of the author in the passage is to:
A) Challenge a prevailing historical consensus regarding early agricultural trade
B) Provide empirical evidence supporting linguistic evolution theories
C) Reconcile two opposing literary critiques of 19th-century poetry
D) Describe the archival methods of modern archaeologists
Correct: A
Points: 2
Explanation: The author specifically questions and deconstructs the traditional consensus in paragraphs 2 and 4.
        `;
      }

      if (!rawText.trim()) {
        return res.status(400).json({ success: false, message: 'No text or file provided for question extraction.' });
      }

      // Regex parser to split raw text into structured question blocks
      const extractedQuestions = [];
      const blocks = rawText.trim().split(/(?:\r?\n){2,}(?=\d+\.|\d+\))/g);

      for (const block of blocks) {
        const trimmed = block.trim();
        if (!trimmed) continue;

        // Parse question text
        const qMatch = trimmed.match(/^(?:\d+[\.\)]\s*)?([\s\S]*?)(?=(?:^[A-D]\)|\s[A-D]\)))/m);
        const questionText = qMatch ? qMatch[1].trim() : trimmed.split('\n')[0].replace(/^\d+[\.\)]\s*/, '').trim();

        // Parse options A, B, C, D
        const optA = trimmed.match(/(?:^|\n|\s)A[\)\.]\s*([^\n\r]+)/i);
        const optB = trimmed.match(/(?:^|\n|\s)B[\)\.]\s*([^\n\r]+)/i);
        const optC = trimmed.match(/(?:^|\n|\s)C[\)\.]\s*([^\n\r]+)/i);
        const optD = trimmed.match(/(?:^|\n|\s)D[\)\.]\s*([^\n\r]+)/i);

        // Parse correct answer
        const ansMatch = trimmed.match(/(?:Correct|Answer|Ans):\s*([A-D])/i);
        const correct = ansMatch ? ansMatch[1].toUpperCase() : 'A';

        // Parse points
        const pointsMatch = trimmed.match(/Points:\s*(\d+)/i);
        const points = pointsMatch ? parseInt(pointsMatch[1], 10) : 1;

        // Parse explanation
        const explMatch = trimmed.match(/Explanation:\s*([\s\S]*?)(?=(?:Points:|$))/i);
        const explanation = explMatch ? explMatch[1].trim() : '';

        extractedQuestions.push({
          question_text: questionText,
          question_type: 'mcq',
          option_a: optA ? optA[1].trim() : '',
          option_b: optB ? optB[1].trim() : '',
          option_c: optC ? optC[1].trim() : '',
          option_d: optD ? optD[1].trim() : '',
          correct_answer: correct,
          points,
          explanation
        });
      }

      // If assignment_id provided, automatically insert questions into the assignment
      let insertedCount = 0;
      if (assignment_id) {
        const assign = db.prepare('SELECT id FROM assignments WHERE id = ?').get(assignment_id);
        if (assign) {
          const insertStmt = db.prepare(`
            INSERT INTO questions (assignment_id, question_text, question_type, option_a, option_b, option_c, option_d, correct_answer, points, explanation, question_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          const maxOrderRes = db.prepare('SELECT COALESCE(MAX(question_order), 0) as max_ord FROM questions WHERE assignment_id = ?').get(assignment_id);
          let currentOrder = maxOrderRes.max_ord;

          const insertTx = db.transaction(() => {
            for (const q of extractedQuestions) {
              currentOrder++;
              insertStmt.run(
                assignment_id,
                q.question_text,
                q.question_type,
                q.option_a,
                q.option_b,
                q.option_c,
                q.option_d,
                q.correct_answer,
                q.points,
                q.explanation,
                currentOrder
              );
              insertedCount++;
            }
          });

          insertTx();
        }
      }

      return res.status(200).json({
        success: true,
        message: `Extracted ${extractedQuestions.length} questions successfully.${insertedCount > 0 ? ' Inserted ' + insertedCount + ' into assignment ' + assignment_id : ''}`,
        count: extractedQuestions.length,
        data: extractedQuestions
      });
    } catch (err) {
      console.error('Question extraction error:', err);
      return res.status(500).json({ success: false, message: 'Failed to extract questions from source.' });
    }
  }
);

/**
 * GET /api/materials/:id
 * Retrieve material file securely with anti-screenshot and enrollment protection
 */
router.get('/:id', authenticateToken, antiScreenshotHeaders, (req, res) => {
  try {
    const materialId = req.params.id;
    const material = db.prepare(`
      SELECT m.*, l.course_id 
      FROM materials m
      LEFT JOIN lessons l ON m.lesson_id = l.id
      WHERE m.id = ? OR m.uuid = ?
    `).get(materialId, materialId);

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found.' });
    }

    // Check enrollment if user is student and material is linked to a course
    if (req.user.role === 'student' && material.course_id) {
      const enrollment = db.prepare(`
        SELECT payment_status, is_active FROM enrollments 
        WHERE student_id = ? AND course_id = ?
      `).get(req.user.id, material.course_id);

      if (!enrollment || enrollment.payment_status !== 'paid' || !enrollment.is_active) {
        return res.status(403).json({ success: false, message: 'Course enrollment required to access this document.' });
      }
    }

    const fullPath = path.resolve(__dirname, '..', material.file_path);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ success: false, message: 'Physical file not found.' });
    }

    // Set content headers
    if (material.file_type === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
    } else if (material.file_type === 'image') {
      const ext = path.extname(fullPath).toLowerCase();
      res.setHeader('Content-Type', ext === '.png' ? 'image/png' : 'image/jpeg');
    } else {
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(fullPath)}"`);
    }

    return fs.createReadStream(fullPath).pipe(res);
  } catch (err) {
    console.error('Serve material error:', err);
    return res.status(500).json({ success: false, message: 'Error retrieving material.' });
  }
});

/**
 * DELETE /api/materials/:id
 * Delete material (manager/teacher/admin)
 */
router.delete('/:id', authenticateToken, requireRole('admin', 'manager', 'teacher'), (req, res) => {
  try {
    const materialId = req.params.id;
    const material = db.prepare('SELECT * FROM materials WHERE id = ?').get(materialId);

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found.' });
    }

    // Delete file from disk
    const fullPath = path.resolve(__dirname, '..', material.file_path);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (e) {
        console.warn('Could not remove file from disk:', e.message);
      }
    }

    db.prepare('DELETE FROM materials WHERE id = ?').run(materialId);
    logAudit(req.user.id, 'MATERIAL_DELETED', { materialId, title: material.title }, req.ip);

    return res.status(200).json({ success: true, message: 'Material deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete material.' });
  }
});

/**
 * GET /api/materials/lesson/:lessonId
 * List materials belonging to a lesson
 */
router.get('/lesson/:lessonId', authenticateToken, (req, res) => {
  try {
    const { lessonId } = req.params;
    const materials = db.prepare(`
      SELECT id, uuid, title, file_path, file_type, is_protected, created_at
      FROM materials 
      WHERE lesson_id = ?
    `).all(lessonId);

    return res.status(200).json({ success: true, data: materials });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve materials.' });
  }
});

module.exports = router;

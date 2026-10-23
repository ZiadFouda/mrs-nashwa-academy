const http = require('http');
const { startServer } = require('../server');
const { db } = require('../database/db');

// Set port to 3005 for testing
process.env.PORT = '3005';
process.env.NODE_ENV = 'test';

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      const bodyStr = typeof postData === 'object' ? JSON.stringify(postData) : postData;
      req.write(bodyStr);
    }
    req.end();
  });
}

async function runTests() {
  console.log('>>> Starting Platform Backend Verification Tests...\n');
  const { server } = startServer();

  // Wait 1 second for server to bind
  await new Promise(r => setTimeout(r, 1000));

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // Test 1: Health check
    const health = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/health',
      method: 'GET'
    });
    assert(health.status === 200 && health.body.status === 'UP', 'Health check returns 200 UP');

    // Test 2: Admin login
    const adminLogin = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      username: 'admin',
      password: 'NashwaAdmin2024!'
    });
    assert(adminLogin.status === 200 && adminLogin.body.data.token, 'Admin login returns JWT token');
    const adminToken = adminLogin.body.data.token;
    const adminRefresh = adminLogin.body.data.refreshToken;

    // Test 3: Teacher login
    const teacherLogin = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      username: 'mrs.nashwa',
      password: 'Nashwa2024!'
    });
    assert(teacherLogin.status === 200 && teacherLogin.body.data.user.role === 'teacher', 'Mrs. Nashwa login returns teacher role');

    // Test 4: Token refresh
    const refreshRes = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/auth/refresh',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      refreshToken: adminRefresh
    });
    assert(refreshRes.status === 200 && refreshRes.body.data.token, 'Refresh token generates new access token');

    // Test 5: Student login
    const studentLogin = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      username: 'student.demo',
      password: 'Student2024!'
    });
    assert(studentLogin.status === 200 && studentLogin.body.data.user.role === 'student', 'Student demo login successful');
    const studentToken = studentLogin.body.data.token;
    const studentUser = studentLogin.body.data.user;

    // Test 6: Create SAT Course (Admin)
    const courseRes = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/courses',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, {
      title: 'SAT Math Mastery Grade 11',
      description: 'Comprehensive SAT digital preparation with Mrs. Nashwa',
      grade: '11',
      exam_type: 'SAT',
      subscription_type: 'course',
      price: 1500,
      currency: 'EGP'
    });
    assert(courseRes.status === 201 && courseRes.body.data.id, 'Admin created SAT course');
    const courseId = courseRes.body.data.id;

    // Test 7: Enroll student in course
    const enrollRes = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: `/api/courses/${courseId}/enroll`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      }
    }, {
      payment_method: 'instapay',
      payment_reference: 'INSTA-TEST-12345'
    });
    assert(enrollRes.status === 201, 'Student requested enrollment via InstaPay');
    const enrollmentId = enrollRes.body.data.enrollment_id;

    // Test 8: Admin verifies payment
    const verifyRes = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: `/api/payments/${enrollmentId}/verify`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, {
      status: 'paid'
    });
    assert(verifyRes.status === 200 && verifyRes.body.data.status === 'paid', 'Admin verified InstaPay payment as paid');

    // Test 9: Create Lesson 1 and Lesson 2 with prerequisite
    const lesson1Res = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/lessons',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, {
      course_id: courseId,
      title: 'Lesson 1: Heart of Algebra',
      lesson_order: 1,
      video_url: 'https://video.example.com/stream/l1.mp4'
    });
    assert(lesson1Res.status === 201, 'Created Lesson 1');
    const lesson1Id = lesson1Res.body.data.id;

    const lesson2Res = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/lessons',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, {
      course_id: courseId,
      title: 'Lesson 2: Advanced Math & Quadratics',
      lesson_order: 2,
      video_url: 'https://video.example.com/stream/l2.mp4',
      prerequisite_lesson_id: lesson1Id
    });
    assert(lesson2Res.status === 201, 'Created Lesson 2 with prerequisite on Lesson 1');
    const lesson2Id = lesson2Res.body.data.id;

    // Test 10: Enforce prerequisite check (Student tries to access Lesson 2 before completing Lesson 1)
    const accessBlockedRes = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: `/api/lessons/${lesson2Id}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${studentToken}`
      }
    });
    assert(accessBlockedRes.status === 403 && accessBlockedRes.body.message.includes('Prerequisite incomplete'), 'Prerequisite correctly enforced: Lesson 2 blocked for student');

    // Test 11: Mark Lesson 1 as completed
    const completeLesson1 = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: `/api/lessons/${lesson1Id}/complete`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${studentToken}`
      }
    });
    assert(completeLesson1.status === 200, 'Student completed Lesson 1');

    // Test 12: Re-check Lesson 2 access (Should now be allowed)
    const accessAllowedRes = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: `/api/lessons/${lesson2Id}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${studentToken}`
      }
    });
    assert(accessAllowedRes.status === 200 && accessAllowedRes.body.data.id === lesson2Id, 'Prerequisite satisfied: Lesson 2 now accessible to student');

    // Test 13: OCR / Intelligent Question Extraction
    const extractRes = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/materials/extract-questions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, {
      text_content: `
1. What is the value of 2x + 3 if x = 4?
A) 8
B) 10
C) 11
D) 12
Correct: C
Points: 5
Explanation: 2(4) + 3 = 8 + 3 = 11.
      `
    });
    assert(extractRes.status === 200 && extractRes.body.count === 1, 'OCR parser successfully extracted question');

    // Test 14: Create Assignment & Add Questions
    const assignRes = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/assignments',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, {
      course_id: courseId,
      lesson_id: lesson1Id,
      title: 'SAT Diagnostic Quiz 1',
      assignment_type: 'quiz',
      time_limit_minutes: 30,
      max_score: 100
    });
    assert(assignRes.status === 201, 'Created timed SAT Quiz');
    const assignmentId = assignRes.body.data.id;

    // Add question to assignment
    const addQRes = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: `/api/assignments/${assignmentId}/questions`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, {
      question_text: 'If 4x - 8 = 16, what is x?',
      question_type: 'mcq',
      option_a: '4',
      option_b: '6',
      option_c: '8',
      option_d: '10',
      correct_answer: 'B',
      points: 10,
      explanation: '4x = 24, so x = 6.'
    });
    assert(addQRes.status === 201, 'Added question to SAT Quiz');
    const qId = addQRes.body.data.id;

    // Test 15: Student starts timed exam
    const startExamRes = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: `/api/assignments/${assignmentId}/start`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${studentToken}`
      }
    });
    assert(startExamRes.status === 200 && startExamRes.body.data.time_remaining_seconds > 0, 'Student started timed exam; countdown active');

    // Test 16: Check security: student views exam (correct answer hidden)
    const studentExamView = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: `/api/assignments/${assignmentId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${studentToken}`
      }
    });
    assert(
      studentExamView.status === 200 &&
      studentExamView.body.data.questions[0].correct_answer === undefined,
      'Security verified: Correct answer is HIDDEN from student during exam'
    );

    // Test 17: Submit exam and test automated grading
    const submitRes = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: `/api/assignments/${assignmentId}/submit`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      }
    }, {
      answers: { [qId]: 'B' } // Correct answer!
    });
    assert(
      submitRes.status === 200 &&
      submitRes.body.data.percentage === 100 &&
      submitRes.body.data.score === 100,
      'Automated grading: Correct answer scored 100%'
    );

    // Test 18: Analytics calculated and updated
    const studentAnalyticsRes = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: `/api/analytics/student/${studentUser.id}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${studentToken}`
      }
    });
    assert(
      studentAnalyticsRes.status === 200 &&
      studentAnalyticsRes.body.data.summary.totalAssessments >= 1,
      'Analytics recorded submission and calculated averages'
    );

    // Test 19: Grade distribution endpoint
    const gradeDist = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: `/api/analytics/grade-distribution/${assignmentId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    assert(
      gradeDist.status === 200 &&
      gradeDist.body.data.distribution['90-100% (A)'] >= 1,
      'Grade distribution histogram computed correctly'
    );

    // Test 20: Parent portal
    const parentLogin = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      username: 'parent.demo',
      password: 'Parent2024!'
    });
    assert(parentLogin.status === 200, 'Demo Parent login successful');
    const parentToken = parentLogin.body.data.token;

    const childGradesRes = await makeRequest({
      hostname: 'localhost',
      port: 3005,
      path: `/api/parent/children/${studentUser.id}/grades`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${parentToken}`
      }
    });
    assert(
      childGradesRes.status === 200 &&
      childGradesRes.body.data.grades.length >= 1,
      'Parent portal: Parent can inspect child grades & submissions'
    );

    console.log(`\n========================================`);
    console.log(`Test Results: ${passed} PASSED | ${failed} FAILED`);
    console.log(`========================================\n`);

    server.close(() => {
      process.exit(failed > 0 ? 1 : 0);
    });
  } catch (err) {
    console.error('Fatal test error:', err);
    server.close(() => {
      process.exit(1);
    });
  }
}

runTests();

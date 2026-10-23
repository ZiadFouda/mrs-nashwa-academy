const http = require('http');
const { startServer } = require('../server');
const { db } = require('../database/db');

process.env.PORT = '3006';
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

async function runSecurityAuditTests() {
  console.log('>>> Starting Automated Security and Defense-in-Depth Tests...\n');
  const { server } = startServer();

  await new Promise((r) => setTimeout(r, 1000));

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
    // 1. Unauthenticated request to protected lesson stream
    const unauthStream = await makeRequest({
      hostname: 'localhost',
      port: 3006,
      path: '/api/lessons/1/stream',
      method: 'GET',
    });
    assert(unauthStream.status === 401, 'Unauthenticated request to lesson stream rejected with 401 Unauthorized');

    // 2. Unauthenticated request to private materials
    const unauthMaterial = await makeRequest({
      hostname: 'localhost',
      port: 3006,
      path: '/api/materials/1',
      method: 'GET',
    });
    assert(unauthMaterial.status === 401, 'Unauthenticated request to materials rejected with 401 Unauthorized');

    // 3. Login as student with Device 1
    const studentLoginDev1 = await makeRequest(
      {
        hostname: 'localhost',
        port: 3006,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        username: 'student.demo',
        password: 'Student2024!',
        currentDevice: {
          deviceId: 'DEV-TEST-PHONE-01',
          deviceLabel: 'iPhone 15 Pro • Mobile Safari',
        },
      }
    );
    assert(studentLoginDev1.status === 200, 'Student login from primary device successful');
    const studentToken = studentLoginDev1.body.data.token;
    const studentId = studentLoginDev1.body.data.user.id;

    // 4. Single-Device Lockdown Test: Attempt login from Device 2
    const studentLoginDev2 = await makeRequest(
      {
        hostname: 'localhost',
        port: 3006,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        username: 'student.demo',
        password: 'Student2024!',
        currentDevice: {
          deviceId: 'DEV-TEST-LAPTOP-02',
          deviceLabel: 'Windows PC • Chrome Browser',
        },
      }
    );
    assert(
      studentLoginDev2.status === 403 && studentLoginDev2.body.code === 'DEVICE_LOCK_ERROR',
      'Single-device lockdown: Login blocked from unregistered secondary device'
    );

    // 5. Admin login and Device Reset
    const adminLogin = await makeRequest(
      {
        hostname: 'localhost',
        port: 3006,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        username: 'admin',
        password: 'NashwaAdmin2024!',
      }
    );
    const adminToken = adminLogin.body.data.token;

    const resetRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 3006,
        path: `/api/admin/reset-device/${studentId}`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    assert(resetRes.status === 200, 'Manager/Admin can reset bound device for student');

    // 6. Device 2 can now bind successfully after reset
    const studentLoginAfterReset = await makeRequest(
      {
        hostname: 'localhost',
        port: 3006,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        username: 'student.demo',
        password: 'Student2024!',
        currentDevice: {
          deviceId: 'DEV-TEST-LAPTOP-02',
          deviceLabel: 'Windows PC • Chrome Browser',
        },
      }
    );
    assert(studentLoginAfterReset.status === 200, 'Student successfully bound to new device after manager reset');

    // 7. Security Header Audit on Lesson Stream
    const streamHeadersRes = await makeRequest({
      hostname: 'localhost',
      port: 3006,
      path: '/api/lessons/1/stream',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    // Checks that anti-screenshot and DRM headers are emitted
    assert(
      streamHeadersRes.headers['x-frame-options'] === 'DENY',
      'Security Headers: X-Frame-Options DENY prevents clickjacking & embed theft'
    );
    assert(
      streamHeadersRes.headers['cache-control'] && streamHeadersRes.headers['cache-control'].includes('no-store'),
      'Security Headers: Cache-Control no-store prevents caching protected media to disk'
    );

    // 8. Unenrolled Student Access Control (Accessing course without payment)
    const newStudentRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 3006,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        username: 'fresh_student_' + Date.now(),
        email: `student_${Date.now()}@test.com`,
        password: 'Password123!',
        full_name: 'Unenrolled Student',
        role: 'student',
        grade: '11',
      }
    );
    let freshToken = null;
    if (newStudentRes.status === 201) {
      freshToken = newStudentRes.body.data.token;
      const deniedStream = await makeRequest({
        hostname: 'localhost',
        port: 3006,
        path: '/api/lessons/1/stream',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${freshToken}`,
        },
      });
      assert(
        deniedStream.status === 403,
        'Server-side authorization: Unenrolled student blocked with 403 from lesson stream'
      );
    } else {
      console.log('[SKIP] Register student test skipped (already exists or restricted)');
    }

    // 9. Session Revocation / Logout enforcement
    const logoutRes = await makeRequest({
      hostname: 'localhost',
      port: 3006,
      path: '/api/auth/logout',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });
    assert(logoutRes.status === 200, 'Session revocation: Logout endpoint marks token revoked in database');

    const revokedAttempt = await makeRequest({
      hostname: 'localhost',
      port: 3006,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });
    assert(revokedAttempt.status === 401, 'Revoked token immediately rejected by authenticateToken middleware');

    console.log(`\n======================================================`);
    console.log(`Security Test Suite: ${passed} PASSED | ${failed} FAILED`);
    console.log(`======================================================\n`);

    server.close(() => {
      process.exit(failed > 0 ? 1 : 0);
    });
  } catch (err) {
    console.error('Security test failure:', err);
    server.close(() => {
      process.exit(1);
    });
  }
}

runSecurityAuditTests();

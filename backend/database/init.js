const { db, logAudit } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

function initDatabase() {
  console.log('Initializing Mrs. Nashwa Abdelhalim Educational Platform database...');

  // Create tables in transaction
  const schemaTx = db.transaction(() => {
    // 1. Users Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'manager', 'teacher', 'parent', 'student')),
        grade TEXT CHECK(grade IN ('10', '11', '12', NULL)),
        phone TEXT,
        parent_id INTEGER,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_login TEXT,
        login_attempts INTEGER DEFAULT 0,
        locked_until TEXT,
        FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL
      );
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_users_parent_id ON users(parent_id);
    `);

    // 2. Courses Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        grade TEXT NOT NULL CHECK(grade IN ('10', '11', '12')),
        exam_type TEXT NOT NULL CHECK(exam_type IN ('SAT', 'EST')),
        subscription_type TEXT NOT NULL CHECK(subscription_type IN ('course', 'monthly')),
        price REAL NOT NULL DEFAULT 0.0,
        currency TEXT DEFAULT 'EGP',
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      );
      CREATE INDEX IF NOT EXISTS idx_courses_grade ON courses(grade);
      CREATE INDEX IF NOT EXISTS idx_courses_exam_type ON courses(exam_type);
      CREATE INDEX IF NOT EXISTS idx_courses_is_active ON courses(is_active);
    `);

    // 3. Enrollments Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        subscription_type TEXT NOT NULL CHECK(subscription_type IN ('course', 'monthly')),
        start_date TEXT NOT NULL,
        end_date TEXT,
        payment_method TEXT DEFAULT 'instapay',
        payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'expired')),
        payment_reference TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
      CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
      CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(payment_status);
    `);

    // 4. Lessons Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS lessons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        course_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        lesson_order INTEGER NOT NULL DEFAULT 1,
        video_url TEXT,
        video_type TEXT DEFAULT 'recorded' CHECK(video_type IN ('live', 'recorded')),
        is_live INTEGER DEFAULT 0,
        live_date TEXT,
        duration_minutes INTEGER DEFAULT 0,
        is_protected INTEGER DEFAULT 1,
        prerequisite_lesson_id INTEGER,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (prerequisite_lesson_id) REFERENCES lessons(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      );
      CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
      CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(course_id, lesson_order);
      CREATE INDEX IF NOT EXISTS idx_lessons_prereq ON lessons(prerequisite_lesson_id);
    `);

    // 5. Materials Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS materials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        lesson_id INTEGER,
        title TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_type TEXT NOT NULL CHECK(file_type IN ('pdf', 'image', 'document')),
        is_protected INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        uploaded_by INTEGER,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
      );
      CREATE INDEX IF NOT EXISTS idx_materials_lesson ON materials(lesson_id);
    `);

    // 6. Assignments Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        course_id INTEGER NOT NULL,
        lesson_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        assignment_type TEXT NOT NULL CHECK(assignment_type IN ('exam', 'homework', 'quiz')),
        time_limit_minutes INTEGER DEFAULT 0,
        max_score INTEGER DEFAULT 100,
        due_date TEXT,
        is_timed INTEGER DEFAULT 0,
        auto_submit INTEGER DEFAULT 1,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      );
      CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments(course_id);
      CREATE INDEX IF NOT EXISTS idx_assignments_lesson ON assignments(lesson_id);
    `);

    // 7. Questions Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignment_id INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        question_type TEXT NOT NULL CHECK(question_type IN ('mcq', 'true_false', 'fill_blank')),
        option_a TEXT,
        option_b TEXT,
        option_c TEXT,
        option_d TEXT,
        correct_answer TEXT NOT NULL,
        points INTEGER DEFAULT 1,
        explanation TEXT,
        question_order INTEGER DEFAULT 1,
        image_url TEXT,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_questions_assignment ON questions(assignment_id);
    `);

    // 8. StudentAssignments Table (submissions)
    db.exec(`
      CREATE TABLE IF NOT EXISTS student_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        assignment_id INTEGER NOT NULL,
        started_at TEXT,
        submitted_at TEXT,
        time_remaining_seconds INTEGER,
        is_auto_submitted INTEGER DEFAULT 0,
        score REAL DEFAULT 0.0,
        max_score REAL DEFAULT 100.0,
        percentage REAL DEFAULT 0.0,
        answers_json TEXT,
        is_graded INTEGER DEFAULT 0,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
        UNIQUE(student_id, assignment_id)
      );
      CREATE INDEX IF NOT EXISTS idx_sa_student ON student_assignments(student_id);
      CREATE INDEX IF NOT EXISTS idx_sa_assignment ON student_assignments(assignment_id);
    `);

    // 9. StudentLessonProgress Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS student_lesson_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        lesson_id INTEGER NOT NULL,
        is_completed INTEGER DEFAULT 0,
        watched_percentage REAL DEFAULT 0.0,
        completed_at TEXT,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
        UNIQUE(student_id, lesson_id)
      );
      CREATE INDEX IF NOT EXISTS idx_slp_student_lesson ON student_lesson_progress(student_id, lesson_id);
    `);

    // 10. Analytics Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        assessment_type TEXT NOT NULL,
        assessment_id INTEGER NOT NULL,
        score REAL NOT NULL,
        max_score REAL NOT NULL,
        percentage REAL NOT NULL,
        recorded_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_analytics_student ON analytics(student_id);
      CREATE INDEX IF NOT EXISTS idx_analytics_course ON analytics(course_id);
    `);

    // 11. Sessions Table (for security)
    db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token_hash TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        expires_at TEXT NOT NULL,
        is_revoked INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    `);

    // 12. AuditLog Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
      CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
      CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
    `);
  });

  schemaTx();
  console.log('Tables and indexes created successfully.');

  // Seed default admin and teacher accounts
  seedDefaultAccounts();
}

function seedDefaultAccounts() {
  const insertUser = db.prepare(`
    INSERT INTO users (uuid, username, email, password_hash, full_name, role, grade, phone, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);

  // Admin Account
  const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!adminExists) {
    const adminPassHash = bcrypt.hashSync('NashwaAdmin2024!', 12);
    insertUser.run(
      uuidv4(),
      'admin',
      'admin@nashwa-academy.com',
      adminPassHash,
      'System Administrator',
      'admin',
      null,
      '+201000000001',
      new Date().toISOString()
    );
    console.log('Seeded default admin: username=admin');
  }

  // Teacher Account: Mrs. Nashwa Abdelhalim
  const teacherExists = db.prepare('SELECT id FROM users WHERE username = ?').get('mrs.nashwa');
  if (!teacherExists) {
    const teacherPassHash = bcrypt.hashSync('Nashwa2024!', 12);
    insertUser.run(
      uuidv4(),
      'mrs.nashwa',
      'nashwa@nashwa-academy.com',
      teacherPassHash,
      'Mrs. Nashwa Abdelhalim',
      'teacher',
      null,
      '+201000000002',
      new Date().toISOString()
    );
    console.log('Seeded teacher account: username=mrs.nashwa');
  }

  // Seed default manager for operational flexibility
  const managerExists = db.prepare('SELECT id FROM users WHERE username = ?').get('manager');
  if (!managerExists) {
    const managerPassHash = bcrypt.hashSync('Manager2024!', 12);
    insertUser.run(
      uuidv4(),
      'manager',
      'manager@nashwa-academy.com',
      managerPassHash,
      'Operations Manager',
      'manager',
      null,
      '+201000000003',
      new Date().toISOString()
    );
    console.log('Seeded default manager: username=manager');
  }

  // Seed demo sample parent & student for demonstration / testing
  const parentExists = db.prepare('SELECT id FROM users WHERE username = ?').get('parent.demo');
  let parentId = parentExists ? parentExists.id : null;
  if (!parentExists) {
    const parentPassHash = bcrypt.hashSync('Parent2024!', 12);
    const parentRes = insertUser.run(
      uuidv4(),
      'parent.demo',
      'parent@demo.com',
      parentPassHash,
      'Demo Parent',
      'parent',
      null,
      '+201000000004',
      new Date().toISOString()
    );
    parentId = parentRes.lastInsertRowid;
    console.log('Seeded demo parent: username=parent.demo');
  }

  const studentExists = db.prepare('SELECT id FROM users WHERE username = ?').get('student.demo');
  if (!studentExists) {
    const studentPassHash = bcrypt.hashSync('Student2024!', 12);
    const studentRes = db.prepare(`
      INSERT INTO users (uuid, username, email, password_hash, full_name, role, grade, phone, parent_id, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      uuidv4(),
      'student.demo',
      'student@demo.com',
      studentPassHash,
      'Ahmed Hassan (Demo Student)',
      'student',
      '12',
      '+201000000005',
      parentId,
      new Date().toISOString()
    );
    console.log('Seeded demo student: username=student.demo');
  }
}

if (require.main === module) {
  initDatabase();
  console.log('Database initialization completed.');
}

module.exports = {
  initDatabase
};

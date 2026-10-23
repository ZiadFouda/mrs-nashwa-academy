# Mrs. Nashwa Abdelhalim Educational Platform - Backend API

Production-ready Node.js backend for Mrs. Nashwa Abdelhalim's SAT / EST American Diploma preparation platform (Grades 10, 11, and 12).

---

## 🌟 Key Features
- **High Concurrency Engine**: Built with Express.js, `better-sqlite3` in WAL mode, response compression, and multi-core cluster mode capable of supporting 300+ simultaneous students.
- **Role-Based Access Control (RBAC)**: Strict permission boundaries for `admin`, `manager`, `teacher`, `student`, and `parent`.
- **Exam Engine & Auto-Grading**: Timed assignments, automatic auto-submit upon timer expiration, instant scoring against answer keys, and detailed student answer reviews.
- **Security & DRM Protection**:
  - Helmet CSP headers & clickjacking protection.
  - Strict anti-screenshot and anti-caching headers for protected educational materials.
  - Byte-range video streaming endpoint with DRM headers and watermark overlay.
  - Account lockout after 5 consecutive failed login attempts (30-minute lock).
  - Session tracking in SQLite with token hash revocation.
- **Pedagogical Progression Rules**: Sequential lesson progression enforcing prerequisites (Lesson $N$ cannot be accessed until Lesson $N-1$ is completed).
- **OCR & Question Extraction**: Extraction service parsing raw SAT/EST question blocks, options A/B/C/D, answer keys, and explanations into structured assignment questions.
- **Comprehensive Analytics & Trend Detection**: Moving average calculation detecting student trajectory (`improving`, `declining`, `stable`), course completion rates, and grade distribution histograms.
- **Parent Portal**: Direct parental monitoring of children's exam grades, attendance history, and improvement trends.
- **Payment Verification Flow**: InstaPay transaction logging and admin verification queue.
- **Real-Time Synchronisation**: Socket.io integration for live sessions, reactions, and synchronized countdown timers.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Verify `.env` configuration (see `.env.example`):
```env
PORT=3000
JWT_SECRET=nashwa-edu-platform-secret-key-2024-very-long-and-secure
JWT_REFRESH_SECRET=nashwa-refresh-secret-key-2024-very-long-and-secure
NODE_ENV=production
CORS_ORIGIN=http://localhost:5173
MAX_FILE_SIZE=52428800
SESSION_DURATION=24h
REFRESH_DURATION=7d
DATABASE_PATH=./database/nashwa_platform.db
ENABLE_CLUSTER=false
```

### 3. Initialize & Seed Database
```bash
npm run init-db
```

### 4. Run Server
```bash
# Production start
npm start

# Development mode with hot-reloading
npm run dev

# Run full automated verification test suite
node test/test_platform.js
```

---

## 🔑 Default Seeded Accounts

| Role | Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `NashwaAdmin2024!` | Full system administration |
| **Teacher** | `mrs.nashwa` | `Nashwa2024!` | Mrs. Nashwa Abdelhalim |
| **Manager** | `manager` | `Manager2024!` | Operations & content manager |
| **Parent** | `parent.demo` | `Parent2024!` | Demo Parent account |
| **Student** | `student.demo` | `Student2024!` | Demo Grade 12 student |

---

## 📡 API Overview

### Authentication (`/api/auth`)
- `POST /api/auth/login` - Login, returns JWT + refresh token & creates DB session
- `POST /api/auth/refresh` - Issue new access token using refresh token
- `POST /api/auth/logout` - Revoke session
- `GET /api/auth/me` - Current authenticated profile
- `PUT /api/auth/change-password` - Password update & session invalidation
- `POST /api/auth/forgot-password` - Request password reset

### Admin Management (`/api/admin`)
- `GET /api/admin/stats` - Platform metrics (enrolled counts, revenue, pass rates)
- `GET /api/admin/users` - Paginated user directory with role/grade filters
- `POST /api/admin/users` - Create single user
- `POST /api/admin/users/bulk` - Bulk create students with optional parent linking
- `POST /api/admin/link-parent` - Link student to parent
- `PUT /api/admin/users/:id` - Update user details
- `DELETE /api/admin/users/:id` - Deactivate user
- `GET /api/admin/audit-log` - System audit log history

### Courses (`/api/courses`)
- `GET /api/courses` - List active courses (filtered by grade 10/11/12, exam SAT/EST)
- `GET /api/courses/:id` - Detailed course syllabus and student enrollment state
- `POST /api/courses` - Create course *(Admin/Manager)*
- `PUT /api/courses/:id` - Update course details
- `DELETE /api/courses/:id` - Deactivate course
- `POST /api/courses/:id/enroll` - Enroll student in course
- `GET /api/courses/:id/students` - Enrolled roster *(Staff)*
- `PUT /api/courses/:id/subscription` - Update pricing and model

### Lessons & DRM Streaming (`/api/lessons`)
- `GET /api/lessons/:id` - Get lesson (strictly enforces prerequisites)
- `POST /api/lessons` - Create lesson
- `PUT /api/lessons/:id` - Update lesson
- `DELETE /api/lessons/:id` - Deactivate lesson
- `POST /api/lessons/:id/progress` - Update watch progress percentage
- `POST /api/lessons/:id/complete` - Mark lesson as completed
- `GET /api/lessons/:id/stream` - Protected video stream (HTTP 206 bytes, DRM headers)

### Materials & OCR (`/api/materials`)
- `POST /api/materials/upload` - Upload PDF/Images/Documents with virus checks
- `POST /api/materials/extract-questions` - Extract SAT/EST questions from text/images
- `GET /api/materials/:id` - Protected download with anti-screenshot headers
- `DELETE /api/materials/:id` - Remove material

### Assignments & Timed Exams (`/api/assignments`)
- `GET /api/assignments/course/:courseId` - Course assignments
- `GET /api/assignments/:id` - Student/Teacher assignment view (answers hidden for students)
- `POST /api/assignments` - Create assignment
- `POST /api/assignments/:id/questions` - Add question
- `POST /api/assignments/:id/questions/bulk` - Bulk import questions
- `POST /api/assignments/:id/start` - Start timed exam & sync countdown
- `POST /api/assignments/:id/check-time` - Verify remaining time
- `POST /api/assignments/:id/submit` - Submit answers, auto-grade & log analytics
- `GET /api/assignments/:id/results` - Comprehensive post-submission review

### Analytics (`/api/analytics`)
- `GET /api/analytics/student/:id` - Student historical timeline and averages
- `GET /api/analytics/student/:id/improvement` - Trend analysis (`improving`, `declining`, `stable`)
- `GET /api/analytics/course/:id` - Course-wide completion rates and stats
- `GET /api/analytics/comparison` - Student score vs class average
- `GET /api/analytics/grade-distribution/:assignmentId` - Histogram brackets

### Parent Portal (`/api/parent`)
- `GET /api/parent/children` - List linked children
- `GET /api/parent/children/:id/progress` - Child's syllabus completion
- `GET /api/parent/children/:id/grades` - Child's exam scores
- `GET /api/parent/children/:id/attendance` - Child's attendance history
- `GET /api/parent/children/:id/analytics` - Child's improvement trend

### Payments (`/api/payments`)
- `POST /api/payments/instapay` - Submit InstaPay reference & receipt
- `GET /api/payments/pending` - Pending payments queue *(Staff)*
- `PUT /api/payments/:id/verify` - Verify and activate student course access
- `GET /api/payments/history` - User payment history

---

## ⚡ Real-Time Socket.io Events
- `join_lesson` / `leave_lesson` - Live lesson room attendance
- `lesson_reaction` - Live interaction reactions
- `sync_timer` - Synchronized exam countdown
- `send_announcement` - Real-time broadcast alerts from Mrs. Nashwa

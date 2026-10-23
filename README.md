# 🎓 Mrs. Nashwa Abdelhalim - SAT & EST Educational Platform

A professional, modern educational platform for **Mrs. Nashwa Abdelhalim**, specializing in **SAT & EST exam preparation** for the **American Diploma** system.

![Platform](https://img.shields.io/badge/Platform-Educational-blue)
![Grade](https://img.shields.io/badge/Grades-10%2C%2011%2C%2012-gold)
![Students](https://img.shields.io/badge/Capacity-300%2B%20Students-green)
![Security](https://img.shields.io/badge/Security-Advanced-red)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ (recommended: v20+)
- **npm** v9+

### Installation & Running

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Initialize the database
node database/init.js

# 3. Start the backend server
node server.js
# Server starts on http://localhost:3000

# 4. In a NEW terminal, install frontend dependencies
cd frontend
npm install

# 5. Start the frontend dev server
npm run dev
# Frontend starts on http://localhost:5173
```

### 🌐 Open in Browser
Navigate to **http://localhost:5173**

---

## 🔑 Default Login Accounts

| Role | Username | Password | Description |
|------|----------|----------|-------------|
| 👑 Admin | `admin` | `NashwaAdmin2024!` | Full system control |
| 👩‍🏫 Teacher | `mrs.nashwa` | `Nashwa2024!` | Course & student management |
| 📋 Manager | `manager` | `Manager2024!` | Content & assignment management |
| 👨‍👩‍👧 Parent | `parent.demo` | `Parent2024!` | Child monitoring |
| 🎓 Student | `student.demo` | `Student2024!` | Learning & assignments |

---

## ✨ Features

### 👥 Multi-Role System
- **Admin**: Create/manage all accounts, verify payments, system monitoring
- **Manager**: Upload materials, create exams with time limits, manage content
- **Teacher**: Manage courses, view analytics, conduct live lessons
- **Student**: Watch lessons, take timed exams, track progress
- **Parent**: Monitor child's grades, attendance, and improvement

### 📚 Course Management
- Organized by **Grade** (10, 11, 12) and **Exam Type** (SAT, EST)
- **Full Course** subscription (بالكورس كامل)
- **Monthly** subscription (بالشهر)
- **InstaPay** payment integration

### 🎥 Protected Lessons
- Live lesson support with recorded playback
- **Video DRM protection** with watermarking
- **Sequential learning** - must complete prerequisites first
- Anti-recording and anti-screenshot protections

### 📝 Timed Assessments
- MCQ, True/False, and Fill-in-the-blank questions
- Configurable **time limits** set by managers
- **Auto-submit** when timer expires
- **Automatic grading** with score calculation
- Question extraction from uploaded materials

### 📊 Analytics & Progress
- Performance trend analysis over time
- Improvement indicators (improving/declining/stable)
- Score distribution and class comparison
- Competency radar charts
- Strengths & weaknesses identification

### 🔐 Advanced Security
- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Account lockout (5 failed attempts = 30min lock)
- Rate limiting (auth: 100/15min, API: 1000/15min)
- Helmet.js with strict CSP headers
- SQL injection prevention (parameterized queries)
- Audit logging for all sensitive operations
- Anti-screenshot CSS protections
- Video watermarking with student info

### 🎨 Modern UI/UX
- **3D animated background** with Three.js particles
- **Glassmorphism** design language
- **Royal blue & gold** color theme
- Responsive design (mobile, tablet, desktop)
- Framer Motion animations
- Dark mode optimized

---

## 🏗️ Architecture

```
MRS NASHWA ABDELHALIM/
├── backend/                    # Node.js + Express API
│   ├── server.js              # Main server (cluster mode)
│   ├── database/
│   │   ├── db.js              # SQLite connection (WAL mode)
│   │   └── init.js            # Schema & seed data
│   ├── middleware/
│   │   ├── auth.js            # JWT + RBAC + rate limiting
│   │   ├── security.js        # Helmet + CSP + DRM headers
│   │   └── upload.js          # Multer + file validation
│   ├── routes/
│   │   ├── auth.js            # Login/logout/refresh
│   │   ├── admin.js           # User management
│   │   ├── courses.js         # Course CRUD
│   │   ├── lessons.js         # Lesson management
│   │   ├── materials.js       # File upload & OCR
│   │   ├── assignments.js     # Exams & auto-grading
│   │   ├── analytics.js       # Performance analytics
│   │   ├── parent.js          # Parent monitoring
│   │   └── payments.js        # InstaPay management
│   └── test/
│       └── test_platform.js   # 23 automated tests
├── frontend/                   # React + Vite + TailwindCSS
│   └── src/
│       ├── components/        # Reusable UI components
│       │   ├── Background3D   # Three.js 3D background
│       │   ├── Layout         # Sidebar + navigation
│       │   ├── Timer          # Exam countdown
│       │   ├── VideoPlayer    # DRM-protected player
│       │   ├── FileUpload     # Drag-and-drop uploads
│       │   └── Charts         # Recharts analytics
│       ├── pages/             # 18 complete pages
│       │   ├── HomePage       # Landing page
│       │   ├── LoginPage      # Auth with 3D background
│       │   ├── DashboardPage  # Role-based dashboard
│       │   ├── admin/         # User, Course, Enrollment mgmt
│       │   ├── courses/       # Course list & detail
│       │   ├── lessons/       # Protected lesson viewer
│       │   ├── assignments/   # Take, list, results
│       │   ├── manager/       # Upload & create assignments
│       │   ├── analytics/     # Student performance
│       │   └── parent/        # Child monitoring
│       ├── contexts/          # Auth state management
│       └── utils/             # API client & mock data
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, TailwindCSS v4 |
| 3D Graphics | Three.js, React Three Fiber, Drei |
| Animations | Framer Motion |
| Charts | Recharts |
| Backend | Node.js, Express.js v5 |
| Real-time | Socket.io |
| Database | SQLite (better-sqlite3, WAL mode) |
| Auth | JWT + bcryptjs |
| Security | Helmet, CORS, Rate Limiting |
| File Upload | Multer, Sharp |

---

## 📱 Supported Browsers
- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Android)

---

## 🏭 Production Deployment

```bash
# Build frontend for production
cd frontend
npm run build

# Start backend (serves frontend from dist/)
cd ../backend
NODE_ENV=production node server.js
```

The backend will serve the built frontend from `frontend/dist/` on port 3000.

---

## 📞 Support

For technical support, contact the development team.

**Built for Mrs. Nashwa Abdelhalim** | SAT & EST Preparation | American Diploma

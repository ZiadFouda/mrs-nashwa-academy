import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import platformDb from '../utils/platformDb';
import SystemRestartModal from '../components/SystemRestartModal';
import {
  BookOpen,
  FileCheck2,
  Trophy,
  Clock,
  ArrowRight,
  Sparkles,
  Users,
  CreditCard,
  Upload,
  Calendar,
  PlayCircle,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  RotateCcw,
  ShieldCheck,
  Activity,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);

  useEffect(() => {
    // Load real data from platformDb
    setCourses(platformDb.getCourses());
    setAssignments(platformDb.getAssignments());
    setUsersList(platformDb.getUsers());
    setSubmissions(platformDb.getSubmissions(user?.role === 'student' ? user?.id : null));
  }, [user]);

  // Derived metrics
  const studentCount = usersList.filter((u) => u.role === 'student').length;
  const activeCourseCount = courses.length;
  const mySubmissions = submissions.filter((s) => s.student_id === user?.id);
  const avgStudentScore =
    mySubmissions.length > 0
      ? Math.round(mySubmissions.reduce((acc, s) => acc + (s.score || 0), 0) / mySubmissions.length)
      : 88;

  // 1. Student Dashboard View
  const renderStudentView = () => (
    <div className="space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-8 bg-gradient-to-r from-[#1c1611] via-[#241c14] to-[#16120e] border border-[#c9a96e]/30 shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a96e]/15 text-[#d4b87a] text-xs font-semibold mb-3 border border-[#c9a96e]/25">
              <Sparkles className="w-3.5 h-3.5 text-[#c9a96e]" />
              <span>Digital SAT & EST English Preparation Cohort</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-serif text-[#f5f0e8]">
              Welcome back, {user?.full_name || 'Scholar'}!
            </h1>
            <p className="text-[#a09787] text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Target SAT R&W Score: <span className="text-[#c9a96e] font-bold font-mono">760+</span> • Current Diagnostic Average:{' '}
              <span className="text-emerald-400 font-bold font-mono">{avgStudentScore}%</span>. Keep up your daily vocabulary and conventions drills!
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to="/assignments"
              className="w-full sm:w-auto text-center px-5 py-3 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a8894e] hover:brightness-105 text-[#0d0b08] font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-[#c9a96e]/20 flex items-center justify-center gap-2"
            >
              <span>Solve Today's English Drill</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-5 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <div className="flex items-center justify-between text-[#a09787] mb-1.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase truncate">Active Courses</span>
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#c9a96e] shrink-0" />
          </div>
          <div className="text-xl sm:text-3xl font-serif text-[#f5f0e8]">{activeCourseCount} Active</div>
          <p className="text-[10px] sm:text-xs text-emerald-400 mt-1 flex items-center gap-1 truncate">
            <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> SAT R&W & EST
          </p>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <div className="flex items-center justify-between text-[#a09787] mb-1.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase truncate">Assignments</span>
            <FileCheck2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4b87a] shrink-0" />
          </div>
          <div className="text-xl sm:text-3xl font-serif text-[#d4b87a]">{assignments.length} Available</div>
          <p className="text-[10px] sm:text-xs text-[#a09787] mt-1 flex items-center gap-1 truncate">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#c9a96e]" /> Timed Drills & Mocks
          </p>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <div className="flex items-center justify-between text-[#a09787] mb-1.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase truncate">Average Score</span>
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-[#c9a96e] shrink-0" />
          </div>
          <div className="text-xl sm:text-3xl font-serif text-emerald-400">{avgStudentScore}%</div>
          <p className="text-[10px] sm:text-xs text-emerald-400 mt-1 flex items-center gap-1 truncate">
            <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Top 5% in Cohort
          </p>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <div className="flex items-center justify-between text-[#a09787] mb-1.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase truncate">Live Attendance</span>
            <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4b87a] shrink-0" />
          </div>
          <div className="text-xl sm:text-3xl font-serif text-[#f5f0e8]">100%</div>
          <p className="text-[10px] sm:text-xs text-[#a09787] mt-1 truncate">Verified Sessions</p>
        </div>
      </div>

      {/* Main Grid: Real In-Progress Courses & Quick Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-serif text-[#f5f0e8] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#c9a96e]" />
              <span>Curriculum Courses</span>
            </h2>
            <Link to="/courses" className="text-xs text-[#c9a96e] hover:text-[#d4b87a] font-semibold transition">
              View All ({courses.length}) →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.slice(0, 4).map((course) => (
              <div
                key={course.id}
                className="group rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 overflow-hidden shadow-xl hover:border-[#c9a96e]/40 transition duration-300 flex flex-col justify-between"
              >
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#18130e] via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-[#14100c]/80 backdrop-blur-md border border-[#c9a96e]/30 text-[10px] font-mono text-[#d4b87a]">
                    {course.code}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-[#f5f0e8] text-sm group-hover:text-[#c9a96e] transition">
                      {course.title}
                    </h3>
                    <p className="text-[#a09787] text-xs mt-1 line-clamp-2">{course.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#c9a96e]/15 flex items-center justify-between">
                    <span className="text-[11px] text-[#a09787]">{course.lessons_count} Modules</span>
                    <Link
                      to={`/courses/${course.id}`}
                      className="px-3 py-1.5 rounded-lg bg-[#241c14] hover:bg-[#32271c] text-xs font-semibold text-[#d4b87a] border border-[#c9a96e]/25 transition"
                    >
                      Study Track →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Real Assigned Tasks & Upcoming Live Session */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-serif text-[#f5f0e8] flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-[#d4b87a]" />
              <span>Assigned Tests</span>
            </h2>
            <Link to="/assignments" className="text-xs text-[#c9a96e] hover:text-[#d4b87a] font-semibold transition">
              Full List →
            </Link>
          </div>

          <div className="space-y-3">
            {assignments.slice(0, 3).map((asg) => (
              <div
                key={asg.id}
                className="p-4 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 hover:border-[#c9a96e]/40 transition shadow-xl"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#c9a96e]/10 text-[#d4b87a] border border-[#c9a96e]/20">
                    {asg.type}
                  </span>
                  <span className="text-[10px] text-[#a09787] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#c9a96e]" /> {asg.time_limit_minutes} min
                  </span>
                </div>
                <h4 className="font-serif font-bold text-[#f5f0e8] text-xs sm:text-sm mt-2">{asg.title}</h4>
                <div className="mt-3 pt-2.5 border-t border-[#c9a96e]/10 flex items-center justify-between">
                  <span className="text-[10px] text-[#a09787]">
                    {asg.status === 'Graded' ? `Score: ${asg.score}%` : 'Pending Attempt'}
                  </span>
                  <Link
                    to={asg.status === 'Graded' ? `/assignments/${asg.id}/results` : `/assignments/${asg.id}/take`}
                    className="text-xs text-[#c9a96e] font-semibold hover:underline"
                  >
                    {asg.status === 'Graded' ? 'View Review →' : 'Start Exam →'}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Upcoming Live Lecture */}
          <div className="p-5 rounded-2xl bg-gradient-to-tr from-[#1c1611] to-[#282018] border border-[#c9a96e]/25 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase text-[#c9a96e] tracking-wider">Upcoming Live Lecture</span>
            </div>
            <h4 className="font-serif font-bold text-[#f5f0e8] text-sm">
              Mrs. Nashwa Abdelhalim: Digital SAT Conventions Masterclass
            </h4>
            <p className="text-xs text-[#a09787] mt-1">Friday at 6:00 PM (Cairo Time) • Zoom Live Classroom</p>
            <a
              href="https://zoom.us"
              target="_blank"
              rel="noreferrer"
              className="mt-3 block text-center py-2 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] font-bold text-xs transition hover:brightness-105"
            >
              Enter Zoom Room
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. Admin Dashboard View
  const renderAdminView = () => (
    <div className="space-y-8 font-sans">
      <SystemRestartModal
        isOpen={isRestartModalOpen}
        onClose={() => setIsRestartModalOpen(false)}
        adminUser={user}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#f5f0e8]">System Administration</h1>
          <p className="text-[#a09787] text-xs">Mrs. Nashwa Abdelhalim English Educational Management Center</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Prominent Admin Universal Restart Button */}
          <button
            type="button"
            onClick={() => setIsRestartModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-[#c9a96e]/40 text-[#d4b87a] font-bold text-xs transition flex items-center gap-2 shadow-lg"
          >
            <RotateCcw className="w-4 h-4 text-[#c9a96e]" />
            <span>Restart Platform</span>
          </button>
          <Link
            to="/admin/users"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] font-bold text-xs transition"
          >
            + Create User
          </Link>
          <Link
            to="/admin/courses"
            className="px-4 py-2 rounded-xl bg-[#241c14] hover:bg-[#32271c] text-[#f5f0e8] border border-[#c9a96e]/30 font-medium text-xs transition"
          >
            + Add Course
          </Link>
        </div>
      </div>

      {/* Admin stats connected to real platform database */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-5 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <span className="text-[10px] sm:text-xs font-semibold text-[#a09787] uppercase truncate block">
            Registered Scholars
          </span>
          <div className="text-xl sm:text-3xl font-serif text-[#f5f0e8] mt-1">{studentCount} Active</div>
          <p className="text-[10px] sm:text-xs text-emerald-400 mt-1 truncate">Stored in database</p>
        </div>
        <div className="p-3.5 sm:p-5 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <span className="text-[10px] sm:text-xs font-semibold text-[#a09787] uppercase truncate block">
            Live Courses
          </span>
          <div className="text-xl sm:text-3xl font-serif text-[#c9a96e] mt-1">{activeCourseCount} Active</div>
          <p className="text-[10px] sm:text-xs text-[#a09787] mt-1 truncate">SAT & EST English</p>
        </div>
        <div className="p-3.5 sm:p-5 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <span className="text-[10px] sm:text-xs font-semibold text-[#a09787] uppercase truncate block">
            Published Exams
          </span>
          <div className="text-xl sm:text-3xl font-serif text-[#d4b87a] mt-1">{assignments.length} Tests</div>
          <p className="text-[10px] sm:text-xs text-[#a09787] mt-1 truncate">Timed Drills & Mocks</p>
        </div>
        <div className="p-3.5 sm:p-5 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <span className="text-[10px] sm:text-xs font-semibold text-[#a09787] uppercase truncate block">
            Exam Submissions
          </span>
          <div className="text-xl sm:text-3xl font-serif text-emerald-400 mt-1">{submissions.length} Graded</div>
          <p className="text-[10px] sm:text-xs text-emerald-400 mt-1 truncate">Automated Curve</p>
        </div>
      </div>

      {/* Emergency Platform Health & Universal Restart Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#1c1611] via-[#241c14] to-[#14100c] border border-amber-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-[#c9a96e]/30 text-[#c9a96e]">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-[#f5f0e8] text-base">
              Academy Platform Health & Emergency System Restart
            </h3>
            <p className="text-xs text-[#a09787] mt-1 max-w-2xl leading-relaxed">
              Encountering runtime discrepancies, stuck exams, or need to synchronize changes across all active sessions?
              Clicking <strong>Restart Platform</strong> triggers an immediate universal cache clearance and clean reboot for every connected user.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsRestartModalOpen(true)}
          className="w-full md:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] font-bold text-xs uppercase tracking-wider transition hover:brightness-105 active:scale-95 shadow-lg shadow-[#c9a96e]/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restart Site For Everyone</span>
        </button>
      </div>

      {/* Quick shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Link
          to="/admin/users"
          className="p-5 sm:p-6 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 hover:border-[#c9a96e]/40 transition group shadow-xl"
        >
          <Users className="w-7 h-7 sm:w-8 sm:h-8 text-[#c9a96e] mb-3 group-hover:scale-105 transition" />
          <h3 className="font-serif font-bold text-[#f5f0e8] text-base">User Management</h3>
          <p className="text-xs text-[#a09787] mt-1">
            Manage students, generate parent credentials, link families, and assign roles with persistent storage.
          </p>
        </Link>
        <Link
          to="/admin/enrollments"
          className="p-5 sm:p-6 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 hover:border-[#c9a96e]/40 transition group shadow-xl"
        >
          <CreditCard className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400 mb-3 group-hover:scale-105 transition" />
          <h3 className="font-serif font-bold text-[#f5f0e8] text-base">Enrollments & InstaPay</h3>
          <p className="text-xs text-[#a09787] mt-1">
            Verify InstaPay reference numbers, manage monthly vs full-course access.
          </p>
        </Link>
        <Link
          to="/admin/courses"
          className="p-5 sm:p-6 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 hover:border-[#c9a96e]/40 transition group shadow-xl"
        >
          <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-[#d4b87a] mb-3 group-hover:scale-105 transition" />
          <h3 className="font-serif font-bold text-[#f5f0e8] text-base">Course Catalog</h3>
          <p className="text-xs text-[#a09787] mt-1">
            Add and edit SAT & EST English modules, video lectures, and real prerequisite chains.
          </p>
        </Link>
      </div>
    </div>
  );

  // 3. Teacher & Manager Dashboard View
  const renderTeacherManagerView = () => (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#f5f0e8]">Academic Instructor Hub</h1>
          <p className="text-[#a09787] text-xs">Curriculum management & English diagnostics center</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Link
            to="/manager/upload"
            className="flex-1 sm:flex-none justify-center px-4 py-2 rounded-xl bg-[#18130e] hover:bg-[#221a12] text-[#f5f0e8] border border-[#c9a96e]/30 font-medium text-xs transition flex items-center gap-2"
          >
            <Upload className="w-4 h-4 text-[#c9a96e]" />
            <span>Upload Materials</span>
          </Link>
          <Link
            to="/manager/assignments/create"
            className="flex-1 sm:flex-none justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] font-bold text-xs transition flex items-center gap-2"
          >
            <FileCheck2 className="w-4 h-4 text-[#0d0b08]" />
            <span>Create Assignment</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-5 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <span className="text-[10px] sm:text-xs font-semibold text-[#a09787] uppercase truncate block">Enrolled Students</span>
          <div className="text-xl sm:text-3xl font-serif text-[#f5f0e8] mt-1">{studentCount} Active</div>
          <p className="text-[10px] sm:text-xs text-emerald-400 mt-1 truncate">All Batches</p>
        </div>
        <div className="p-3.5 sm:p-5 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <span className="text-[10px] sm:text-xs font-semibold text-[#a09787] uppercase truncate block">Active Courses</span>
          <div className="text-xl sm:text-3xl font-serif text-[#c9a96e] mt-1">{activeCourseCount} Courses</div>
          <p className="text-[10px] sm:text-xs text-[#a09787] mt-1 truncate">SAT & EST Tracks</p>
        </div>
        <div className="p-3.5 sm:p-5 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <span className="text-[10px] sm:text-xs font-semibold text-[#a09787] uppercase truncate block">Exams Created</span>
          <div className="text-xl sm:text-3xl font-serif text-[#d4b87a] mt-1">{assignments.length} Tests</div>
          <p className="text-[10px] sm:text-xs text-emerald-400 mt-1 truncate">Published</p>
        </div>
        <div className="p-3.5 sm:p-5 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <span className="text-[10px] sm:text-xs font-semibold text-[#a09787] uppercase truncate block">Student Submissions</span>
          <div className="text-xl sm:text-3xl font-serif text-emerald-400 mt-1">{submissions.length} Total</div>
          <p className="text-[10px] sm:text-xs text-[#a09787] mt-1 truncate">Recorded in DB</p>
        </div>
      </div>
    </div>
  );

  switch (role) {
    case 'admin':
      return renderAdminView();
    case 'teacher':
    case 'manager':
      return renderTeacherManagerView();
    case 'student':
    case 'parent':
    default:
      return renderStudentView();
  }
}

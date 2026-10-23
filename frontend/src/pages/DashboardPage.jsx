import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { COURSES, ASSIGNMENTS, INITIAL_STUDENTS_LIST, ENROLLMENTS } from '../utils/mockData';
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
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role || 'student';

  // 1. Student Dashboard View
  const renderStudentView = () => (
    <div className="space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#1c1611] via-[#241c14] to-[#16120e] border border-[#c9a96e]/30 shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a96e]/15 text-[#d4b87a] text-xs font-semibold mb-3 border border-[#c9a96e]/25">
              <Sparkles className="w-3.5 h-3.5 text-[#c9a96e]" />
              <span>Digital SAT & EST English Preparation Cohort</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#f5f0e8]">
              Welcome back, {user?.full_name || 'Scholar'}!
            </h1>
            <p className="text-[#a09787] text-sm mt-1 max-w-xl">
              Target SAT R&W Score: <span className="text-[#c9a96e] font-bold font-mono">760+</span> • Current Diagnostic Average: <span className="text-emerald-400 font-bold font-mono">720</span>. Keep up your daily vocabulary and conventions drills!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/assignments"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a8894e] hover:brightness-105 text-[#0d0b08] font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-[#c9a96e]/20 flex items-center gap-2"
            >
              <span>Solve Today's English Drill</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <div className="flex items-center justify-between text-[#a09787] mb-2">
            <span className="text-xs font-semibold uppercase">Enrolled Curricula</span>
            <BookOpen className="w-5 h-5 text-[#c9a96e]" />
          </div>
          <div className="text-3xl font-serif text-[#f5f0e8]">2 Active</div>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> SAT R&W & EST Literacy
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <div className="flex items-center justify-between text-[#a09787] mb-2">
            <span className="text-xs font-semibold uppercase">Assignments Due</span>
            <FileCheck2 className="w-5 h-5 text-[#d4b87a]" />
          </div>
          <div className="text-3xl font-serif text-[#d4b87a]">2 Pending</div>
          <p className="text-xs text-[#a09787] mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#c9a96e]" /> Next due in 3 days
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <div className="flex items-center justify-between text-[#a09787] mb-2">
            <span className="text-xs font-semibold uppercase">English Accuracy</span>
            <Trophy className="w-5 h-5 text-[#c9a96e]" />
          </div>
          <div className="text-3xl font-serif text-emerald-400">92.4%</div>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Top 5% in Mrs. Nashwa's Batch
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <div className="flex items-center justify-between text-[#a09787] mb-2">
            <span className="text-xs font-semibold uppercase">Live Attendance</span>
            <UserCheck className="w-5 h-5 text-[#d4b87a]" />
          </div>
          <div className="text-3xl font-serif text-[#f5f0e8]">98%</div>
          <p className="text-xs text-[#a09787] mt-1">12 / 12 Sessions attended</p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: My Active Courses & Next Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif text-[#f5f0e8] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#c9a96e]" />
              <span>My Enrolled English Curricula</span>
            </h2>
            <Link to="/courses" className="text-xs text-[#c9a96e] hover:underline">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {COURSES.slice(0, 3).map((course) => (
              <div
                key={course.id}
                className="p-5 rounded-2xl bg-[#14100c]/80 border border-[#c9a96e]/15 hover:border-[#c9a96e]/40 transition backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-16 h-16 rounded-xl object-cover border border-[#c9a96e]/20 shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#241c14] text-[#d4b87a] border border-[#c9a96e]/30">
                      {course.exam_type} • Grade {course.grade}
                    </span>
                    <h3 className="font-serif font-bold text-[#f5f0e8] text-base mt-1">{course.title}</h3>
                    <p className="text-xs text-[#a09787]">
                      {course.lessons_count} Lessons • Instructor: {course.instructor}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
                  <div className="text-right">
                    <span className="text-xs text-[#a09787]">Progress</span>
                    <p className="text-sm font-bold text-[#c9a96e] font-mono">{course.progress}%</p>
                  </div>
                  <Link
                    to={`/courses/${course.id}`}
                    className="px-4 py-2 rounded-xl bg-[#241c14] hover:bg-[#32271c] border border-[#c9a96e]/30 text-[#f5f0e8] font-medium text-xs transition flex items-center gap-1.5"
                  >
                    <PlayCircle className="w-4 h-4 text-[#c9a96e]" />
                    <span>Continue</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Assignments Due Box */}
          <div className="p-6 rounded-2xl bg-[#14100c]/80 border border-[#c9a96e]/15 backdrop-blur-md">
            <h3 className="font-serif font-bold text-[#f5f0e8] text-base mb-4 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-[#c9a96e]" />
              <span>Upcoming Homework & Diagnostics</span>
            </h3>
            <div className="space-y-3">
              {ASSIGNMENTS.map((asg) => (
                <div
                  key={asg.id}
                  className="p-3.5 rounded-xl bg-[#1c1611]/80 border border-[#c9a96e]/10 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-[#f5f0e8]">{asg.title}</p>
                    <p className="text-[#a09787] text-[11px]">
                      Time limit: {asg.time_limit_minutes} mins • {asg.total_questions} questions
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        asg.status === 'Graded'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : asg.status === 'In Progress'
                          ? 'bg-[#282018] text-[#d4b87a] border border-[#c9a96e]/30'
                          : 'bg-[#18130e] text-[#a09787] border border-white/10'
                      }`}
                    >
                      {asg.status}
                    </span>
                    <Link
                      to={
                        asg.status === 'Graded'
                          ? `/assignments/${asg.id}/results`
                          : `/assignments/${asg.id}/take`
                      }
                      className="px-3 py-1.5 rounded-lg bg-[#241c14] hover:bg-[#32271c] text-[#f5f0e8] font-medium transition border border-[#c9a96e]/20"
                    >
                      {asg.status === 'Graded' ? 'Results' : 'Start'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Schedule & Teacher Announcements */}
        <div className="space-y-6">
          {/* Upcoming Live Lecture */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#1c1611] to-[#120e0a] border border-[#c9a96e]/30 shadow-xl">
            <div className="flex items-center gap-2 text-[#c9a96e] text-xs font-bold uppercase tracking-wider mb-2">
              <Calendar className="w-4 h-4" />
              <span>Next Live Masterclass</span>
            </div>
            <h4 className="text-lg font-serif text-[#f5f0e8] mb-2">
              Hard Module 2 Reading & Rhetorical Synthesis with Mrs. Nashwa
            </h4>
            <p className="text-xs text-[#a09787] leading-relaxed mb-4">
              Live interactive walkthrough covering deceptive syntax, tricky punctuation, and 20 challenging questions from recent test curves.
            </p>
            <div className="p-3 rounded-xl bg-black/40 border border-[#c9a96e]/15 text-xs mb-4 flex items-center justify-between">
              <div>
                <span className="text-[#a09787] block text-[10px]">Date & Time</span>
                <span className="font-semibold text-[#f5f0e8]">Friday, Nov 14 @ 7:00 PM CLT</span>
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <a
              href="https://zoom.us"
              target="_blank"
              rel="noreferrer"
              className="w-full block text-center py-2.5 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] font-bold text-xs uppercase tracking-wider transition hover:brightness-105"
            >
              Join Zoom Room
            </a>
          </div>

          {/* Quick Notice Board */}
          <div className="p-6 rounded-2xl bg-[#14100c]/80 border border-[#c9a96e]/15 backdrop-blur-md">
            <h4 className="font-serif font-bold text-[#f5f0e8] text-sm mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#c9a96e]" />
              <span>Academic Notice</span>
            </h4>
            <p className="text-xs text-[#a09787] leading-relaxed">
              Registration for the upcoming EST English exam and December Digital SAT is now active. Please ensure all student ID numbers and diagnostic quiz logs are updated in your profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. Admin Dashboard View
  const renderAdminView = () => (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#f5f0e8]">System Administration</h1>
          <p className="text-[#a09787] text-xs">Mrs. Nashwa Abdelhalim English Educational Management Center</p>
        </div>
        <div className="flex items-center gap-3">
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

      {/* Admin stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <span className="text-xs font-semibold text-[#a09787] uppercase">Total Students</span>
          <div className="text-3xl font-serif text-[#f5f0e8] mt-1">486</div>
          <p className="text-xs text-emerald-400 mt-1">+18 enrolled this week</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <span className="text-xs font-semibold text-[#a09787] uppercase">Active English Courses</span>
          <div className="text-3xl font-serif text-[#c9a96e] mt-1">5 Active</div>
          <p className="text-xs text-[#a09787] mt-1">Grades 10, 11 & 12 (SAT & EST)</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <span className="text-xs font-semibold text-[#a09787] uppercase">Monthly Revenue</span>
          <div className="text-3xl font-serif text-emerald-400 mt-1">720,000 EGP</div>
          <p className="text-xs text-emerald-400 mt-1">94% collected via InstaPay</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <span className="text-xs font-semibold text-[#a09787] uppercase">Pending InstaPay</span>
          <div className="text-3xl font-serif text-rose-400 mt-1">2 Pending</div>
          <Link to="/admin/enrollments" className="text-xs text-[#c9a96e] underline mt-1 block">
            Review receipts →
          </Link>
        </div>
      </div>

      {/* Quick shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/users"
          className="p-6 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 hover:border-[#c9a96e]/40 transition group shadow-xl"
        >
          <Users className="w-8 h-8 text-[#c9a96e] mb-3 group-hover:scale-105 transition" />
          <h3 className="font-serif font-bold text-[#f5f0e8] text-base">User Management</h3>
          <p className="text-xs text-[#a09787] mt-1">
            Manage students, generate parent credentials, link families, and assign roles.
          </p>
        </Link>
        <Link
          to="/admin/enrollments"
          className="p-6 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 hover:border-[#c9a96e]/40 transition group shadow-xl"
        >
          <CreditCard className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-105 transition" />
          <h3 className="font-serif font-bold text-[#f5f0e8] text-base">Enrollments & InstaPay</h3>
          <p className="text-xs text-[#a09787] mt-1">
            Verify InstaPay reference numbers, manage monthly vs full-course access.
          </p>
        </Link>
        <Link
          to="/admin/courses"
          className="p-6 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 hover:border-[#c9a96e]/40 transition group shadow-xl"
        >
          <BookOpen className="w-8 h-8 text-[#d4b87a] mb-3 group-hover:scale-105 transition" />
          <h3 className="font-serif font-bold text-[#f5f0e8] text-base">Course Catalog</h3>
          <p className="text-xs text-[#a09787] mt-1">
            Configure SAT & EST English modules, DRM lecture videos, and prerequisite chains.
          </p>
        </Link>
      </div>
    </div>
  );

  // 3. Teacher & Manager Dashboard View
  const renderTeacherManagerView = () => (
    <div className="space-y-8 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-[#f5f0e8]">Academic Instructor Hub</h1>
          <p className="text-[#a09787] text-xs">Curriculum management & English diagnostics center</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/manager/upload"
            className="px-4 py-2 rounded-xl bg-[#18130e] hover:bg-[#221a12] text-[#f5f0e8] border border-[#c9a96e]/30 font-medium text-xs transition flex items-center gap-2"
          >
            <Upload className="w-4 h-4 text-[#c9a96e]" />
            <span>Upload Exam Materials</span>
          </Link>
          <Link
            to="/manager/assignments/create"
            className="px-4 py-2 rounded-xl bg-[#18130e] hover:bg-[#221a12] text-[#c9a96e] border border-[#c9a96e]/50 font-bold text-xs transition shadow-md"
          >
            + Create New Exam / Quiz
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <span className="text-xs font-semibold text-[#a09787] uppercase">Submissions to Grade</span>
          <div className="text-3xl font-serif text-[#c9a96e] mt-1">8 Pending</div>
          <p className="text-xs text-[#a09787] mt-1">Latest from EST English Literacy Mock 1</p>
        </div>
        <div className="p-6 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <span className="text-xs font-semibold text-[#a09787] uppercase">Upcoming Live Classes</span>
          <div className="text-3xl font-serif text-[#f5f0e8] mt-1">2 This Week</div>
          <p className="text-xs text-emerald-400 mt-1">Friday 7 PM & Monday 6 PM</p>
        </div>
        <div className="p-6 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <span className="text-xs font-semibold text-[#a09787] uppercase">Batch Average Score</span>
          <div className="text-3xl font-serif text-emerald-400 mt-1">745 / 800</div>
          <p className="text-xs text-emerald-400 mt-1">+35 pts above target</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-full">
      {role === 'admin'
        ? renderAdminView()
        : role === 'teacher' || role === 'manager'
        ? renderTeacherManagerView()
        : renderStudentView()}
    </div>
  );
}

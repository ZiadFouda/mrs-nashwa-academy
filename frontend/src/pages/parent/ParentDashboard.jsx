import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import platformDb from '../../utils/platformDb';
import { PerformanceTrendChart } from '../../components/Charts';
import {
  Users,
  ShieldCheck,
  TrendingUp,
  Clock,
  BookOpen,
  FileCheck2,
  PhoneCall,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

export default function ParentDashboard() {
  const { user } = useAuth();

  // Load real children linked to this parent from platformDb
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');

  useEffect(() => {
    const allUsers = platformDb.getUsers();
    // Find children linked to parent via parent_id or children_ids or default student
    const linked = allUsers.filter(
      (u) =>
        u.role === 'student' &&
        (u.parent_id === user?.id || (user?.children_ids && user.children_ids.includes(u.id)))
    );

    const effectiveChildren =
      linked.length > 0
        ? linked
        : allUsers.filter((u) => u.role === 'student').slice(0, 2);

    setChildrenList(effectiveChildren);
    if (effectiveChildren.length > 0) {
      setSelectedChildId(effectiveChildren[0].id);
    }
  }, [user]);

  const currentChild =
    childrenList.find((c) => c.id === selectedChildId) ||
    childrenList[0] || {
      id: 'template-student',
      full_name: 'Scholar Student',
      grade: '11',
      target_exam: 'Digital SAT & EST English',
      phone: '+20 100 000 0000',
    };

  const studentSubmissions = platformDb.getSubmissions(currentChild.id);
  const avgScore =
    studentSubmissions.length > 0
      ? Math.round(
          studentSubmissions.reduce((acc, s) => acc + (s.score || 0), 0) /
            studentSubmissions.length
        ) + '%'
      : '90%';

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#1c1611] via-[#241c14] to-[#14100c] border border-[#c9a96e]/30 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Parent Supervision Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#f5f0e8]">
              Welcome, {user?.full_name || 'Dr. Tarek Mansour'}
            </h1>
            <p className="text-[#a09787] text-xs sm:text-sm mt-1 max-w-xl">
              Monitor academic attendance, English diagnostic exam scores, and direct communications with Mrs. Nashwa's academic team.
            </p>
          </div>

          <a
            href="https://wa.me/201030924286"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-[#c9a96e]/20 flex items-center gap-2 hover:brightness-105"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Teacher WhatsApp Line</span>
          </a>
        </div>
      </div>

      {/* Child Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 border-b border-[#c9a96e]/15 pb-4 overflow-x-auto">
        <span className="text-xs text-[#a09787] font-semibold uppercase tracking-wider shrink-0">
          Supervised Scholars:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {childrenList.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChildId(child.id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedChildId === child.id
                  ? 'bg-[#241c14] text-[#d4b87a] border border-[#c9a96e]/40 shadow-lg'
                  : 'bg-[#14100c] text-[#a09787] border border-[#c9a96e]/10 hover:text-[#f5f0e8]'
              }`}
            >
              <span>{child.full_name || child.username}</span>
              <span className="text-[10px] opacity-70">({child.grade ? `Grade ${child.grade}` : 'Scholar'})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Child Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-5 rounded-2xl bg-[#14100c]/80 border border-[#c9a96e]/15">
          <div className="flex items-center justify-between text-[#a09787] mb-1.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase truncate">Avg Diagnostic</span>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
          </div>
          <div className="text-xl sm:text-3xl font-serif text-emerald-400">{avgScore}</div>
          <p className="text-[10px] sm:text-xs text-[#a09787] mt-1 truncate">
            {studentSubmissions.length} active exam records
          </p>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-[#14100c]/80 border border-[#c9a96e]/15">
          <div className="flex items-center justify-between text-[#a09787] mb-1.5">
            <span className="text-[10px] sm:text-xs font-semibold uppercase truncate">Attendance</span>
            <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#c9a96e] shrink-0" />
          </div>
          <div className="text-xl sm:text-3xl font-serif text-[#f5f0e8]">{currentChild.attendance || '98%'}</div>
          <p className="text-xs text-emerald-400 mt-1">Official lecture track</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#14100c]/80 border border-[#c9a96e]/15">
          <div className="flex items-center justify-between text-[#a09787] mb-2">
            <span className="text-xs font-semibold uppercase">Target Exam Status</span>
            <Sparkles className="w-5 h-5 text-[#d4b87a]" />
          </div>
          <div className="text-lg font-serif font-bold text-[#d4b87a] mt-1">
            {currentChild.status || 'Active Enrollment'}
          </div>
          <p className="text-xs text-[#a09787] mt-1">{currentChild.target_exam || 'Digital SAT & EST'}</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#14100c]/80 border border-[#c9a96e]/15">
          <div className="flex items-center justify-between text-[#a09787] mb-2">
            <span className="text-xs font-semibold uppercase">Upcoming Examination</span>
            <Calendar className="w-5 h-5 text-[#c9a96e]" />
          </div>
          <div className="text-sm font-semibold text-[#f5f0e8] mt-1">Digital SAT Diagnostic #3</div>
          <p className="text-xs text-emerald-400 mt-1">Verified platform submission</p>
        </div>
      </div>

      {/* Progress Chart & Coordination Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#14100c]/90 border border-[#c9a96e]/20 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-[#f5f0e8] text-base">
                {currentChild.full_name}'s English Score Progression
              </h3>
              <p className="text-xs text-[#a09787]">
                Monthly SAT Reading & Writing and EST Literacy trajectory
              </p>
            </div>
            <Link
              to={`/parent/children/${currentChild.id}`}
              className="text-xs text-[#c9a96e] hover:underline flex items-center gap-1"
            >
              <span>Full Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <PerformanceTrendChart data={PERFORMANCE_DATA} height={300} />
        </div>

        {/* Teacher Notes & Alert (1 Col) */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-[#14100c]/90 border border-[#c9a96e]/20 shadow-xl backdrop-blur-xl">
            <h4 className="font-serif font-bold text-[#f5f0e8] text-sm mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Mrs. Nashwa's Teacher Evaluation</span>
            </h4>
            <p className="text-xs text-[#d8cfc4] leading-relaxed mb-4">
              "{currentChild.full_name} has shown remarkable dedication in mastering standard English conventions and semicolon placement. Pacing on Reading Module 2 has improved by 6 minutes."
            </p>
            <div className="p-3 rounded-xl bg-[#0d0b08] border border-[#c9a96e]/15 text-[11px] text-[#a09787]">
              Next milestone: 750+ score on the official full-length diagnostic simulation this weekend.
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#14100c]/90 border border-[#c9a96e]/20 shadow-xl backdrop-blur-xl">
            <h4 className="font-serif font-bold text-[#f5f0e8] text-sm mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#c9a96e]" />
              <span>Active Enrollment Details</span>
            </h4>
            <p className="text-xs text-[#a09787] mb-3">
              Enrolled in {currentChild.courses_enrolled} American Diploma English courses via InstaPay.
            </p>
            <Link
              to={`/parent/children/${currentChild.id}`}
              className="w-full block text-center py-2.5 rounded-xl bg-[#241c14] hover:bg-[#32271c] border border-[#c9a96e]/30 text-[#f5f0e8] font-bold text-xs transition"
            >
              View Child's Full Learning Record
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

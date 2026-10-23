import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { INITIAL_STUDENTS_LIST, COURSES } from '../../utils/mockData';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Send,
  Sparkles,
  UserCheck,
  TrendingUp,
  FileCheck2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChildProgressPage() {
  const { id } = useParams();
  const student = INITIAL_STUDENTS_LIST.find((s) => s.id === id) || INITIAL_STUDENTS_LIST[0];

  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const attendanceLog = [
    { date: 'Oct 20, 2026', time: '19:00 - 20:30', topic: 'Standard English Conventions: Colons & Semicolons', status: 'Present (On Time)' },
    { date: 'Oct 17, 2026', time: '19:00 - 20:30', topic: 'Vocabulary in Context & Nuance Elimination', status: 'Present (On Time)' },
    { date: 'Oct 13, 2026', time: '19:00 - 20:30', topic: 'Digital SAT Reading Structure & Pacing Strategies', status: 'Present (On Time)' },
    { date: 'Oct 10, 2026', time: '19:00 - 20:30', topic: 'Sentence Boundaries & Modifier Placement', status: 'Present (On Time)' },
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setMessage('');
      toast.success('Message delivered to Mrs. Nashwa & Academic Coordination!');
    }, 700);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      {/* Top Header & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          to="/parent/dashboard"
          className="text-xs text-[#a09787] hover:text-[#f5f0e8] transition flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4 text-[#c9a96e]" />
          <span>Back to Children Overview</span>
        </Link>
      </div>

      {/* Child Dossier Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#14100c]/90 border border-[#c9a96e]/20 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
            alt={student.full_name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-[#c9a96e]/50 shadow-lg"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#241c14] text-[#d4b87a] border border-[#c9a96e]/30">
                Grade {student.grade}
              </span>
              <span className="text-xs font-bold text-[#c9a96e] font-mono">
                {student.target_exam}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#f5f0e8] mt-1">
              {student.full_name}
            </h1>
            <p className="text-xs text-[#a09787] mt-1">
              Enrolled on {student.joined_date} • Parent: {student.parent_name} ({student.parent_phone})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0d0b08]/80 border border-[#c9a96e]/20 text-center">
          <div>
            <span className="text-[10px] text-[#a09787] uppercase font-semibold">Average Accuracy</span>
            <div className="text-2xl font-serif text-emerald-400 mt-0.5">
              {student.avg_score}%
            </div>
          </div>
          <div className="h-8 w-px bg-[#c9a96e]/20" />
          <div>
            <span className="text-[10px] text-[#a09787] uppercase font-semibold">Attendance</span>
            <div className="text-2xl font-serif text-[#f5f0e8] mt-0.5">
              {student.attendance}
            </div>
          </div>
        </div>
      </div>

      {/* Course Breakdown */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif text-[#f5f0e8] flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#c9a96e]" />
          <span>Curricula & Syllabus Status</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COURSES.slice(0, 3).map((course) => (
            <div
              key={course.id}
              className="p-5 rounded-2xl bg-[#14100c]/80 border border-[#c9a96e]/15 backdrop-blur-md flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-[#c9a96e] uppercase">
                  {course.exam_type}
                </span>
                <h3 className="font-serif font-bold text-[#f5f0e8] text-base mt-1 mb-2">{course.title}</h3>
                <div className="space-y-1.5 my-3">
                  <div className="flex justify-between text-xs text-[#d8cfc4]">
                    <span>Progress</span>
                    <span className="font-bold text-[#c9a96e] font-mono">{course.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1c1611] rounded-full overflow-hidden border border-[#c9a96e]/10">
                    <div
                      className="h-full bg-gradient-to-r from-[#c9a96e] to-[#a8894e]"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-[#a09787] pt-2 border-t border-[#c9a96e]/10">
                {course.lessons_count} Lectures total • Instructor: {course.instructor}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance Log and Direct Message Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance Record */}
        <div className="p-6 rounded-2xl bg-[#14100c]/90 border border-[#c9a96e]/20 shadow-xl backdrop-blur-xl">
          <h3 className="font-serif font-bold text-[#f5f0e8] text-base mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#c9a96e]" />
            <span>Live Session Attendance Log</span>
          </h3>

          <div className="space-y-3">
            {attendanceLog.map((log, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-[#1c1611] border border-[#c9a96e]/10 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-[#f5f0e8]">{log.topic}</p>
                  <p className="text-[#a09787] text-[11px]">
                    {log.date} • {log.time}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 font-bold text-[10px] border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Message to Mrs. Nashwa & Team */}
        <div className="p-6 rounded-2xl bg-[#14100c]/90 border border-[#c9a96e]/20 shadow-xl backdrop-blur-xl">
          <h3 className="font-serif font-bold text-[#f5f0e8] text-base mb-2 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#c9a96e]" />
            <span>Message Mrs. Nashwa's Academic Office</span>
          </h3>
          <p className="text-xs text-[#a09787] mb-4">
            Send inquiries regarding attendance, exam readiness, or schedule adjustments.
          </p>

          <form onSubmit={handleSendMessage} className="space-y-3">
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message to Mrs. Nashwa and the academic coordinator..."
              className="w-full p-3.5 rounded-xl bg-[#0d0b08] border border-[#c9a96e]/20 text-[#f5f0e8] text-xs placeholder-[#7d7465] focus:outline-none focus:border-[#c9a96e]"
            />

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-[#c9a96e]/20 flex items-center justify-center gap-2 hover:brightness-105"
            >
              {isSending ? (
                <span>Sending...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Message to Teacher</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

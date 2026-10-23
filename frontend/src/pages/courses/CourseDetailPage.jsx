import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { COURSES, LESSONS, ASSIGNMENTS } from '../../utils/mockData';
import {
  BookOpen,
  PlayCircle,
  Lock,
  CheckCircle,
  FileText,
  FileCheck2,
  Clock,
  Download,
  Calendar,
  Sparkles,
  ArrowRight,
  Shield,
  HelpCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CourseDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' | 'assignments' | 'materials'

  const course = COURSES.find((c) => c.id === id) || COURSES[0];
  const courseLessons = LESSONS.filter((l) => l.course_id === course.id || l.course_id === 'c-sat-rw-11');
  const courseAssignments = ASSIGNMENTS.filter(
    (a) => a.course_id === course.id || a.course_id === 'c-sat-rw-11'
  );

  return (
    <div className="space-y-8 font-sans">
      {/* Course Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 bg-gradient-to-r from-[#1c1611] via-[#241c14] to-[#14100c] border border-[#c9a96e]/25 shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#241c14] text-[#d4b87a] text-xs font-bold border border-[#c9a96e]/30">
              Grade {course.grade}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#c9a96e]/15 text-[#c9a96e] text-xs font-bold border border-[#c9a96e]/30">
              {course.exam_type}
            </span>
            <span className="text-xs text-[#a09787]">
              Lead Instructor: <strong className="text-[#f5f0e8]">{course.instructor}</strong>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-serif text-[#f5f0e8] tracking-tight">
            {course.title}
          </h1>

          <p className="text-[#a09787] text-xs sm:text-sm leading-relaxed">
            {course.description}
          </p>

          {/* Progress Overview Bar */}
          <div className="pt-2">
            <div className="flex justify-between text-xs text-[#d8cfc4] mb-1.5 font-medium">
              <span>Overall Course Completion</span>
              <span className="text-[#c9a96e] font-mono font-bold">{course.progress}% Completed</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#1c1611] overflow-hidden border border-[#c9a96e]/20">
              <div
                className="h-full bg-gradient-to-r from-[#c9a96e] to-[#a8894e] transition-all duration-500 rounded-full"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Course Navigation Tabs (Scrollable on small mobile screens) */}
      <div className="flex border-b border-[#c9a96e]/15 gap-2 sm:gap-4 overflow-x-auto pb-0.5 whitespace-nowrap">
        <button
          onClick={() => setActiveTab('lessons')}
          className={`pb-3 px-2 text-xs sm:text-sm font-semibold transition relative shrink-0 ${
            activeTab === 'lessons'
              ? 'text-[#c9a96e]'
              : 'text-[#a09787] hover:text-[#f5f0e8]'
          }`}
        >
          <span>Curriculum Lessons ({courseLessons.length})</span>
          {activeTab === 'lessons' && (
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#c9a96e]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`pb-3 px-2 text-xs sm:text-sm font-semibold transition relative shrink-0 ${
            activeTab === 'assignments'
              ? 'text-[#c9a96e]'
              : 'text-[#a09787] hover:text-[#f5f0e8]'
          }`}
        >
          <span>Homework & Mocks ({courseAssignments.length})</span>
          {activeTab === 'assignments' && (
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#c9a96e]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('materials')}
          className={`pb-3 px-2 text-xs sm:text-sm font-semibold transition relative shrink-0 ${
            activeTab === 'materials'
              ? 'text-[#c9a96e]'
              : 'text-[#a09787] hover:text-[#f5f0e8]'
          }`}
        >
          <span>Handouts & Rule Sheets (3)</span>
          {activeTab === 'materials' && (
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#c9a96e]" />
          )}
        </button>
      </div>

      {/* Tab 1: Sequential Lessons */}
      {activeTab === 'lessons' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#14100c]/80 border border-[#c9a96e]/15 flex items-center gap-3 text-xs text-[#a09787]">
            <Shield className="w-5 h-5 text-[#c9a96e] shrink-0" />
            <span>
              <strong>Sequential Progression Enforced:</strong> Mrs. Nashwa requires watching prior lectures in order to unlock advanced Module 2 lessons.
            </span>
          </div>

          <div className="space-y-3">
            {courseLessons.map((lesson) => (
              <div
                key={lesson.id}
                className={`p-5 rounded-2xl border transition-all ${
                  lesson.is_locked
                    ? 'bg-[#120f0c]/60 border-[#c9a96e]/10 opacity-70'
                    : 'bg-[#14100c]/90 border-[#c9a96e]/20 hover:border-[#c9a96e]/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold shrink-0 text-sm ${
                        lesson.is_completed
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                          : lesson.is_locked
                          ? 'bg-[#1c1611] text-[#7d7465] border border-white/5'
                          : 'bg-[#241c14] text-[#c9a96e] border border-[#c9a96e]/30'
                      }`}
                    >
                      {lesson.is_completed ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : lesson.is_locked ? (
                        <Lock className="w-4 h-4 text-[#7d7465]" />
                      ) : (
                        lesson.order
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-[#c9a96e] uppercase">
                          Lesson {lesson.order}
                        </span>
                        <span className="text-xs text-[#a09787] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {lesson.duration}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-[#f5f0e8] text-base leading-snug">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-[#a09787] mt-1 leading-relaxed max-w-2xl">
                        {lesson.summary}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {lesson.is_locked ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1c1611] text-[#7d7465] text-xs font-semibold cursor-not-allowed">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Prerequisite Required</span>
                      </span>
                    ) : (
                      <Link
                        to={`/lessons/${lesson.id}`}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow ${
                          lesson.is_completed
                            ? 'bg-[#1c1611] text-[#d4b87a] hover:bg-[#282018] border border-[#c9a96e]/20'
                            : 'bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] hover:brightness-105'
                        }`}
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>{lesson.is_completed ? 'Rewatch Class' : 'Start Lecture'}</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Course Assignments & Exams */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {courseAssignments.map((asg) => (
              <div
                key={asg.id}
                className="p-5 rounded-2xl bg-[#14100c]/90 border border-[#c9a96e]/20 hover:border-[#c9a96e]/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-[#241c14] border border-[#c9a96e]/30 text-[#c9a96e] shrink-0">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#1c1611] text-[#c9a96e] border border-[#c9a96e]/20">
                        {asg.type}
                      </span>
                      <span className="text-xs text-[#a09787] flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" /> {asg.time_limit_minutes} mins countdown
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-[#f5f0e8] text-base leading-snug">
                      {asg.title}
                    </h3>
                    <p className="text-xs text-[#a09787] mt-1">
                      {asg.total_questions} Questions • Passing benchmark: {asg.passing_score}% • Class Average: {asg.class_average}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {asg.status === 'Graded' ? (
                    <Link
                      to={`/assignments/${asg.id}/results`}
                      className="px-4 py-2 rounded-xl bg-[#241c14] hover:bg-[#32271c] text-[#f5f0e8] text-xs font-semibold border border-[#c9a96e]/30 transition flex items-center gap-1.5"
                    >
                      <span>View Detailed Review</span>
                      <ArrowRight className="w-4 h-4 text-[#c9a96e]" />
                    </Link>
                  ) : (
                    <Link
                      to={`/assignments/${asg.id}/take`}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] text-xs font-bold transition flex items-center gap-1.5 hover:brightness-105"
                    >
                      <span>Take Timed Exam</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Materials & Rule Sheets */}
      {activeTab === 'materials' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title: 'Mrs. Nashwa Complete Digital SAT Grammar & Punctuation Rules (2026 Edition)',
              size: '3.4 MB',
              type: 'PDF Guide',
              desc: 'Master sentence boundaries, semicolons, colons, modifier placement, and subject-verb traps.',
            },
            {
              title: 'Module 2 Hard-Tier Vocabulary in Context & Connotation Guide',
              size: '2.1 MB',
              type: 'Strategy Sheet',
              desc: 'High-yield words, tone identifiers, and elimination strategies for deceptively attractive distractors.',
            },
            {
              title: 'EST I & II Literary Essay & Rhetorical Analysis Framework',
              size: '4.8 MB',
              type: 'Past Exam PDF',
              desc: 'Detailed analytical essay architecture, transition words, and sample top-scoring student responses.',
            },
          ].map((mat, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-[#14100c]/90 border border-[#c9a96e]/20 backdrop-blur-md flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-[#241c14] text-[#c9a96e] shrink-0 border border-[#c9a96e]/30">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#c9a96e]">{mat.type}</span>
                  <h4 className="font-serif font-bold text-[#f5f0e8] text-sm mt-0.5 leading-snug">{mat.title}</h4>
                  <p className="text-xs text-[#a09787] mt-1">{mat.desc}</p>
                  <span className="text-[10px] font-mono text-[#7d7465] mt-2 block">{mat.size}</span>
                </div>
              </div>

              <button
                onClick={() => toast.success(`Downloading protected file: ${mat.title}`)}
                className="p-2.5 rounded-xl bg-[#1c1611] hover:bg-[#282018] text-[#a09787] hover:text-[#f5f0e8] border border-[#c9a96e]/20 transition shrink-0"
                title="Download Material"
              >
                <Download className="w-4 h-4 text-[#c9a96e]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

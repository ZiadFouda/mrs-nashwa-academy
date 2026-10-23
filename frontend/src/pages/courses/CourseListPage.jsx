import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { COURSES } from '../../utils/mockData';
import {
  BookOpen,
  Filter,
  GraduationCap,
  PlayCircle,
  Lock,
  Star,
  Clock,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

export default function CourseListPage() {
  const [gradeFilter, setGradeFilter] = useState('all');
  const [examFilter, setExamFilter] = useState('all');

  const filteredCourses = COURSES.filter((c) => {
    const matchesGrade = gradeFilter === 'all' || c.grade === gradeFilter;
    const matchesExam =
      examFilter === 'all' ||
      c.exam_type.toLowerCase().includes(examFilter.toLowerCase());
    return matchesGrade && matchesExam;
  });

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#1c1611] via-[#241c14] to-[#14100c] border border-[#c9a96e]/30 shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a96e]/15 text-[#d4b87a] text-xs font-semibold mb-3 border border-[#c9a96e]/25">
            <Sparkles className="w-3.5 h-3.5 text-[#c9a96e]" />
            <span>American Diploma English Track</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif text-[#f5f0e8] tracking-tight">
            English Curricula & Courses
          </h1>
          <p className="text-[#a09787] text-xs sm:text-sm mt-2 leading-relaxed">
            Targeted preparation for Grades 10, 11, and 12. Engineered by Mrs. Nashwa Abdelhalim to master Digital SAT Reading & Writing and Egyptian Scholastic Test (EST) Literacy standards.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#14100c]/80 border border-[#c9a96e]/15 backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs text-[#a09787] font-semibold uppercase mr-1">Grade:</span>
          {['all', '10', '11', '12'].map((g) => (
            <button
              key={g}
              onClick={() => setGradeFilter(g)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition border ${
                gradeFilter === g
                  ? 'bg-[#18130e] text-[#c9a96e] border-[#c9a96e] shadow-md font-bold'
                  : 'bg-[#18130e] text-[#a09787] border-[#c9a96e]/15 hover:border-[#c9a96e]/30 hover:text-[#f5f0e8]'
              }`}
            >
              {g === 'all' ? 'All Grades' : `Grade ${g}`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#a09787] font-semibold uppercase">Exam:</span>
          <select
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
            className="bg-[#0d0b08] border border-[#c9a96e]/20 rounded-xl px-3 py-1.5 text-xs text-[#f5f0e8] focus:outline-none focus:border-[#c9a96e]"
          >
            <option value="all">All Tests</option>
            <option value="sat">Digital SAT English</option>
            <option value="est">EST Literacy I & II</option>
            <option value="foundation">English Foundations</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const isEnrolled = course.progress > 0 || course.id.includes('11');
          return (
            <div
              key={course.id}
              className="rounded-3xl bg-[#14100c]/90 border border-[#c9a96e]/20 hover:border-[#c9a96e]/50 transition-all duration-300 overflow-hidden shadow-xl flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14100c] via-transparent to-black/40" />

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[#241c14]/90 text-[#d4b87a] text-[10px] font-bold border border-[#c9a96e]/30 backdrop-blur-sm">
                      Grade {course.grade}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-[#c9a96e]/20 text-[#c9a96e] text-[10px] font-bold border border-[#c9a96e]/30 backdrop-blur-sm">
                      {course.exam_type}
                    </span>
                  </div>

                  {isEnrolled && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-950/90 text-emerald-300 text-[10px] font-bold border border-emerald-500/40 backdrop-blur-sm flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-400" /> Enrolled
                    </div>
                  )}

                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="text-[11px] text-[#d8cfc4] font-medium">
                      Instructor: {course.instructor}
                    </span>
                  </div>
                </div>

                <div className="p-6 pt-3">
                  <h3 className="text-lg font-serif font-bold text-[#f5f0e8] mb-2 leading-snug group-hover:text-[#c9a96e] transition">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[#a09787] leading-relaxed line-clamp-2 mb-4">
                    {course.description}
                  </p>

                  {/* Progress or Lessons info */}
                  {isEnrolled ? (
                    <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between text-xs text-[#d8cfc4]">
                        <span>Course Completion</span>
                        <span className="font-bold text-[#c9a96e] font-mono">{course.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#1c1611] rounded-full overflow-hidden border border-[#c9a96e]/10">
                        <div
                          className="h-full bg-gradient-to-r from-[#c9a96e] to-[#a8894e]"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 text-xs text-[#a09787] py-2 border-y border-[#c9a96e]/10 mb-4">
                      <span>{course.lessons_count} Lectures</span>
                      <span>•</span>
                      <span>{course.assignments_count} Timed Mocks</span>
                      <span>•</span>
                      <span className="text-[#c9a96e] font-bold font-mono">{course.price}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  to={`/courses/${course.id}`}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                    isEnrolled
                      ? 'bg-[#241c14] hover:bg-[#32271c] text-[#f5f0e8] border border-[#c9a96e]/30 shadow-lg'
                      : 'bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] hover:brightness-105 shadow-lg shadow-[#c9a96e]/20'
                  }`}
                >
                  <PlayCircle className="w-4 h-4 text-[#c9a96e]" />
                  <span>{isEnrolled ? 'Open Course Player' : 'View Syllabus & Enroll'}</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

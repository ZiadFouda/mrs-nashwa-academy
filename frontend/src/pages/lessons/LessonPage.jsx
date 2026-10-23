import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import VideoPlayer from '../../components/VideoPlayer';
import { LESSONS, COURSES } from '../../utils/mockData';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  FileText,
  Download,
  Shield,
  HelpCircle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LessonPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lessonsList, setLessonsList] = useState(LESSONS);
  const currentLessonIndex = lessonsList.findIndex((l) => l.id === id);
  const lesson = lessonsList[currentLessonIndex] || lessonsList[0];
  const course = COURSES.find((c) => c.id === lesson.course_id) || COURSES[0];

  const prevLesson = currentLessonIndex > 0 ? lessonsList[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex < lessonsList.length - 1 ? lessonsList[currentLessonIndex + 1] : null;

  // Prerequisite check: If previous lesson is not completed, this lesson is locked!
  const isPrerequisiteMet =
    currentLessonIndex === 0 || lessonsList[currentLessonIndex - 1].is_completed;

  const handleMarkComplete = () => {
    setLessonsList((prev) =>
      prev.map((l, idx) => {
        if (l.id === lesson.id) {
          return { ...l, is_completed: true };
        }
        // Unlock next lesson
        if (idx === currentLessonIndex + 1) {
          return { ...l, is_locked: false };
        }
        return l;
      })
    );
    toast.success('Lesson marked as completed! Next English topic unlocked.');
  };

  if (!isPrerequisiteMet && lesson.is_locked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#14100c]/95 border border-[#c9a96e]/30 text-center shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#c9a96e]/15 flex items-center justify-center text-[#c9a96e] mb-4 border border-[#c9a96e]/30">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif text-[#f5f0e8] mb-2">Lesson Locked</h2>
          <p className="text-[#a09787] text-xs sm:text-sm mb-6 leading-relaxed">
            Mrs. Nashwa's academic pedagogy requires completing earlier prerequisite topics before advancing to higher-tier module practice.
          </p>
          {prevLesson && (
            <Link
              to={`/lessons/${prevLesson.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] font-bold text-xs uppercase tracking-wider transition hover:brightness-105"
            >
              <span>Go to Prerequisite: {prevLesson.title}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={`/courses/${course.id}`}
          className="text-xs text-[#a09787] hover:text-[#f5f0e8] transition flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4 text-[#c9a96e]" />
          <span>Back to {course.title} Syllabus</span>
        </Link>

        <div className="flex items-center gap-2">
          {prevLesson && (
            <button
              onClick={() => navigate(`/lessons/${prevLesson.id}`)}
              className="px-3 py-1.5 rounded-xl bg-[#1c1611] hover:bg-[#282018] text-[#a09787] text-xs font-medium border border-[#c9a96e]/20 transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Previous
            </button>
          )}
          {nextLesson && (
            <button
              disabled={!lesson.is_completed}
              onClick={() => navigate(`/lessons/${nextLesson.id}`)}
              className="px-3 py-1.5 rounded-xl bg-[#241c14] hover:bg-[#32271c] text-[#f5f0e8] text-xs font-semibold border border-[#c9a96e]/30 transition flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Video Player */}
      <div className="space-y-3">
        <VideoPlayer
          src={lesson.video_url}
          title={lesson.title}
          onComplete={handleMarkComplete}
        />
        <div className="flex items-center justify-between text-xs text-[#a09787] px-1">
          <span className="flex items-center gap-1 text-emerald-400">
            <Shield className="w-3.5 h-3.5" /> DRM Dynamic Watermark & Screenshot Guard Active
          </span>
          <span>Lecturer: {course.instructor}</span>
        </div>
      </div>

      {/* Lesson Details & Actions Bar */}
      <div className="p-6 rounded-2xl bg-[#14100c]/90 border border-[#c9a96e]/20 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#c9a96e]">
            Lesson {lesson.order} • Duration: {lesson.duration}
          </span>
          <h1 className="text-xl sm:text-2xl font-serif text-[#f5f0e8] mt-1">{lesson.title}</h1>
          <p className="text-xs sm:text-sm text-[#a09787] mt-2 max-w-3xl leading-relaxed">
            {lesson.summary}
          </p>
        </div>

        <div className="shrink-0">
          {lesson.is_completed ? (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Completed</span>
            </div>
          ) : (
            <button
              onClick={handleMarkComplete}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-[#c9a96e]/20 flex items-center gap-2 hover:brightness-105"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark as Complete</span>
            </button>
          )}
        </div>
      </div>

      {/* Accompanying Lesson Materials & Discussion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Materials */}
        <div className="p-6 rounded-2xl bg-[#14100c]/80 border border-[#c9a96e]/15 backdrop-blur-md">
          <h3 className="font-serif font-bold text-[#f5f0e8] text-base mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#c9a96e]" />
            <span>Lecture Handouts & Worksheets</span>
          </h3>

          <div className="space-y-3">
            {lesson.materials?.map((mat, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#1c1611] border border-[#c9a96e]/15 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#c9a96e]" />
                  <span className="font-semibold text-[#f5f0e8]">{mat.name}</span>
                  <span className="text-[10px] text-[#7d7465] font-mono">({mat.size})</span>
                </div>
                <button
                  onClick={() => toast.success(`Downloading ${mat.name}`)}
                  className="p-1.5 rounded-lg bg-[#241c14] hover:bg-[#32271c] text-[#f5f0e8] transition border border-[#c9a96e]/20"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5 text-[#c9a96e]" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Q&A / Ask Mrs. Nashwa */}
        <div className="p-6 rounded-2xl bg-[#14100c]/80 border border-[#c9a96e]/15 backdrop-blur-md">
          <h3 className="font-serif font-bold text-[#f5f0e8] text-base mb-2 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#c9a96e]" />
            <span>Have a Question on this English Topic?</span>
          </h3>
          <p className="text-xs text-[#a09787] mb-4">
            Post your inquiry or timestamp doubt directly to the teaching assistants and Mrs. Nashwa.
          </p>
          <textarea
            rows={3}
            placeholder="e.g. In minute 24:15, why was a semicolon used instead of a colon after the independent clause?..."
            className="w-full p-3 rounded-xl bg-[#0d0b08] border border-[#c9a96e]/20 text-[#f5f0e8] text-xs placeholder-[#7d7465] focus:outline-none focus:border-[#c9a96e] mb-3"
          />
          <button
            onClick={() => toast.success('Your academic question has been submitted to Mrs. Nashwa!')}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] font-bold text-xs transition hover:brightness-105"
          >
            Submit Question to Instructor
          </button>
        </div>
      </div>
    </div>
  );
}

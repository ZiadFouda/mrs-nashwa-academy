import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ASSIGNMENT_QUESTIONS, ASSIGNMENTS } from '../../utils/mockData';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export default function AssignmentResultPage() {
  const { id } = useParams();
  const assignment = ASSIGNMENTS.find((a) => a.id === id) || ASSIGNMENTS[0];
  const questions = ASSIGNMENT_QUESTIONS;

  const totalQuestions = questions.length;
  // Calculate correct based on mock data
  const correctCount = questions.filter(
    (q) =>
      q.student_answer &&
      (q.type === 'fill_in_blank'
        ? q.student_answer.trim().toLowerCase() === q.correct_text.trim().toLowerCase()
        : q.student_answer === q.correct_option)
  ).length;

  const incorrectCount = totalQuestions - correctCount;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const estimatedSatScore = 580 + Math.round((scorePercent / 100) * 220); // 580 to 800

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans">
      {/* Score Hero Summary Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-[#1c1611] via-[#241c14] to-[#14100c] border border-[#c9a96e]/30 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a96e]/15 text-[#d4b87a] text-xs font-semibold border border-[#c9a96e]/25">
              <Trophy className="w-4 h-4 text-[#c9a96e]" />
              <span>Official SAT & EST English Curve Analysis</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif text-[#f5f0e8]">
              {assignment.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#a09787]">
              Exam submitted on {new Date().toLocaleDateString()} • Verified by Mrs. Nashwa's English Grading Engine
            </p>
          </div>

          {/* Big Score Box */}
          <div className="p-6 rounded-2xl bg-[#0d0b08]/80 border border-[#c9a96e]/25 backdrop-blur-md flex flex-col items-center min-w-[200px]">
            <span className="text-xs font-bold text-[#a09787] uppercase tracking-wider">
              Calculated Score
            </span>
            <div className="text-5xl font-serif text-[#c9a96e] my-1">
              {scorePercent}%
            </div>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 font-mono">
              <TrendingUp className="w-3.5 h-3.5" /> Est. SAT R&W: {estimatedSatScore} / 800
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#14100c]/80 border border-[#c9a96e]/15 text-center">
          <span className="text-xs text-[#a09787] block mb-1">Correct Answers</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" /> {correctCount} / {totalQuestions}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#14100c]/80 border border-[#c9a96e]/15 text-center">
          <span className="text-xs text-[#a09787] block mb-1">Incorrect Answers</span>
          <div className="text-2xl font-bold text-rose-400 font-mono flex items-center justify-center gap-1.5">
            <XCircle className="w-5 h-5" /> {incorrectCount}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#14100c]/80 border border-[#c9a96e]/15 text-center">
          <span className="text-xs text-[#a09787] block mb-1">Time Elapsed</span>
          <div className="text-2xl font-bold text-[#f5f0e8] font-mono flex items-center justify-center gap-1.5">
            <Clock className="w-5 h-5 text-[#c9a96e]" /> 18m 42s
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#14100c]/80 border border-[#c9a96e]/15 text-center">
          <span className="text-xs text-[#a09787] block mb-1">Class Benchmark</span>
          <div className="text-2xl font-bold text-[#d4b87a] font-mono">
            {assignment.class_average}%
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#14100c]/80 border border-[#c9a96e]/15">
        <div className="text-xs text-[#a09787]">
          Review step-by-step grammatical model solutions below to eliminate recurring exam traps.
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/assignments/${assignment.id}/take`}
            className="px-4 py-2 rounded-xl bg-[#1c1611] hover:bg-[#282018] text-[#a09787] hover:text-[#f5f0e8] text-xs font-semibold border border-[#c9a96e]/20 transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" /> Retake Practice
          </Link>
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] text-xs font-bold transition flex items-center gap-1.5 hover:brightness-105"
          >
            <BookOpen className="w-4 h-4" /> Return to Dashboard
          </Link>
        </div>
      </div>

      {/* Question by Question Detailed Breakdown */}
      <div className="space-y-6">
        <h2 className="text-xl font-serif text-[#f5f0e8] flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#c9a96e]" />
          <span>Question-by-Question English Analysis</span>
        </h2>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const isCorrect =
              q.type === 'fill_in_blank'
                ? q.student_answer?.toLowerCase() === q.correct_text?.toLowerCase()
                : q.student_answer === q.correct_option;

            return (
              <div
                key={q.id}
                className={`p-6 rounded-2xl border transition-all ${
                  isCorrect
                    ? 'bg-[#14130f] border-emerald-500/30'
                    : 'bg-[#181110] border-rose-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#c9a96e]">
                      Question {idx + 1}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isCorrect
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isCorrect ? 'Correct (+10 pts)' : 'Incorrect (0 pts)'}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-[#a09787] uppercase">
                    {q.type}
                  </span>
                </div>

                <div className="text-sm sm:text-base font-normal text-[#f5f0e8] mb-4 leading-relaxed whitespace-pre-line">
                  {q.question}
                </div>

                {/* Selected vs Correct Option */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs font-mono">
                  <div
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      isCorrect
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <span>Your Answer:</span>
                    <span className="font-bold text-sm">{q.student_answer || 'Unanswered'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#1c1611] border border-[#c9a96e]/30 text-[#d4b87a] flex items-center justify-between">
                    <span>Correct Answer:</span>
                    <span className="font-bold text-sm">
                      {q.type === 'fill_in_blank' ? q.correct_text : q.correct_option}
                    </span>
                  </div>
                </div>

                {/* Instructor Model Explanation */}
                <div className="p-4 rounded-xl bg-[#0d0b08]/80 border border-[#c9a96e]/15 text-xs text-[#d8cfc4]">
                  <span className="font-bold text-[#c9a96e] block mb-1">
                    Mrs. Nashwa's Model Explanation:
                  </span>
                  <p className="leading-relaxed">{q.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

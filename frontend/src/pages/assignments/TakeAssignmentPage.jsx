import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ASSIGNMENTS, ASSIGNMENT_QUESTIONS } from '../../utils/mockData';
import Timer from '../../components/Timer';
import {
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Send,
  Bookmark,
  ShieldAlert,
  Maximize2,
  Minimize2,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TakeAssignmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const assignment = ASSIGNMENTS.find((a) => a.id === id) || ASSIGNMENTS[0];
  const questions = ASSIGNMENT_QUESTIONS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Anti-cheating: detect tab switches
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const next = prev + 1;
          toast.error(`Security Warning: Tab switch detected (${next}/3). Mrs. Nashwa's test session is monitored.`);
          if (next >= 3) {
            toast.error('Violation limit exceeded: Auto-submitting exam now.');
            handleAutoSubmit();
          }
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleFillInBlank = (questionId, text) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: text,
    }));
  };

  const toggleFlag = (index) => {
    setFlagged((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleAutoSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      navigate(`/assignments/${id || 'asg-01'}/results`);
      toast.success('Exam submitted and graded successfully!');
    }, 600);
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto select-none protected-content font-sans">
      {/* Top Testing Header Bar */}
      <div className="p-3 sm:p-5 rounded-2xl bg-[#14100c]/95 border border-[#c9a96e]/20 shadow-xl backdrop-blur-xl flex items-center justify-between gap-3 sticky top-16 z-30">
        <div className="min-w-0">
          <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-[#c9a96e] font-bold block truncate">
            SAT / EST Simulation
          </span>
          <h1 className="text-sm sm:text-lg font-serif font-bold text-[#f5f0e8] truncate max-w-xs sm:max-w-md">
            {assignment.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Security Tab switch counter */}
          {tabSwitches > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono font-bold">
              <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>Violations: {tabSwitches}/3</span>
            </div>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded-xl bg-[#1c1611] hover:bg-[#282018] border border-[#c9a96e]/20 text-[#a09787] hover:text-[#f5f0e8] transition"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Countdown Timer */}
          <Timer
            initialSeconds={assignment.time_limit_minutes * 60}
            onExpire={() => {
              toast.error('Time is up! Submitting assignment...');
              handleAutoSubmit();
            }}
          />
        </div>
      </div>

      {/* Main Examination Grid: Question on left, Palette on right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Question Area (3 Cols) */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-5">
          <div className="p-4 sm:p-8 rounded-2xl bg-[#14100c]/90 border border-[#c9a96e]/20 shadow-2xl backdrop-blur-xl min-h-[380px] sm:min-h-[460px] flex flex-col justify-between">
            {/* Quick Horizontal Question Navigator for Mobile & iPad */}
            <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-[#c9a96e]/15">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = idx === currentIndex;
                const isFlagged = !!flagged[idx];
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-mono text-xs font-bold shrink-0 relative transition ${
                      isCurrent
                        ? 'ring-2 ring-[#c9a96e] text-[#0d0b08] bg-[#c9a96e]'
                        : isAnswered
                        ? 'bg-[#241c14] text-[#d4b87a] border border-[#c9a96e]/40'
                        : 'bg-[#1c1611] text-[#a09787] border border-[#c9a96e]/10'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[#c9a96e]" />}
                  </button>
                );
              })}
            </div>

            {/* Question Top Info */}
            <div>
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#c9a96e]/15 mb-4 sm:mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#c9a96e] uppercase tracking-wider">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-[11px] text-[#a09787] font-medium hidden sm:inline">
                    ({currentQ.type.toUpperCase()})
                  </span>
                </div>

                <button
                  onClick={() => toggleFlag(currentIndex)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-medium transition ${
                    flagged[currentIndex]
                      ? 'bg-[#282018] text-[#d4b87a] border border-[#c9a96e]/40'
                      : 'text-[#a09787] hover:text-[#f5f0e8] hover:bg-white/5'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${flagged[currentIndex] ? 'fill-[#c9a96e] text-[#c9a96e]' : ''}`} />
                  <span>{flagged[currentIndex] ? 'Flagged' : 'Mark'}</span>
                </button>
              </div>

              {/* Question Text */}
              <div className="text-base sm:text-lg font-normal text-[#f5f0e8] leading-relaxed mb-8 whitespace-pre-line">
                {currentQ.question}
              </div>

              {/* Options Render (MCQ / True False / Fill in blank) */}
              {currentQ.type === 'fill_in_blank' ? (
                <div className="max-w-md">
                  <label className="block text-xs text-[#a09787] mb-2">
                    Enter your vocabulary or grammatical answer:
                  </label>
                  <input
                    type="text"
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleFillInBlank(currentQ.id, e.target.value)}
                    placeholder="e.g. whose or however"
                    className="w-full px-4 py-3 rounded-xl bg-[#1c1611] border border-[#c9a96e]/40 text-[#d4b87a] font-mono text-lg focus:outline-none focus:ring-1 focus:ring-[#c9a96e]"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {currentQ.options?.map((opt) => {
                    const isSelected = answers[currentQ.id] === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(currentQ.id, opt.id)}
                        className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-4 ${
                          isSelected
                            ? 'bg-[#241c14] border-[#c9a96e] shadow-lg text-[#f5f0e8]'
                            : 'bg-[#18130e]/80 border-[#c9a96e]/10 hover:border-[#c9a96e]/30 text-[#d8cfc4]'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl font-bold font-mono text-xs flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'bg-[#c9a96e] text-[#0d0b08] border-[#c9a96e] shadow'
                              : 'bg-[#1c1611] text-[#a09787] border-[#c9a96e]/20'
                          }`}
                        >
                          {opt.id}
                        </div>
                        <span className="text-sm sm:text-base font-normal">{opt.text}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Question Navigation Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-[#c9a96e]/15 mt-8">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="px-4 py-2 rounded-xl bg-[#1c1611] hover:bg-[#282018] text-[#f5f0e8] text-xs font-semibold border border-[#c9a96e]/20 transition flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <span className="text-xs text-[#a09787] font-mono">
                {answeredCount} of {questions.length} Answered
              </span>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="px-5 py-2 rounded-xl bg-[#241c14] hover:bg-[#32271c] border border-[#c9a96e]/30 text-[#f5f0e8] text-xs font-bold transition flex items-center gap-1.5"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-[#c9a96e]/20 hover:brightness-105"
                >
                  <Send className="w-4 h-4" /> Submit Exam
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Question Palette (1 Col) */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#14100c]/90 border border-[#c9a96e]/20 shadow-xl backdrop-blur-xl">
            <h3 className="text-xs font-bold text-[#d8cfc4] uppercase tracking-wider mb-3">
              Question Navigator
            </h3>

            {/* Palette Grid */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isFlagged = !!flagged[idx];
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl font-mono text-xs font-bold relative transition ${
                      isCurrent
                        ? 'ring-2 ring-[#c9a96e] text-[#0d0b08] bg-[#c9a96e]'
                        : isAnswered
                        ? 'bg-[#241c14] text-[#d4b87a] border border-[#c9a96e]/40'
                        : 'bg-[#1c1611] text-[#a09787] border border-[#c9a96e]/10 hover:bg-[#282018]'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#c9a96e]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-5 pt-4 border-t border-[#c9a96e]/15 space-y-2 text-[11px] text-[#a09787]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#241c14] border border-[#c9a96e]/40" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#1c1611] border border-[#c9a96e]/10" />
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#c9a96e]" />
                <span>Flagged for Review</span>
              </div>
            </div>

            {/* Submit Action */}
            <button
              onClick={() => setShowConfirmModal(true)}
              className="w-full mt-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a8894e] hover:brightness-105 text-[#0d0b08] font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-[#c9a96e]/20"
            >
              Finish & Submit Test
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Submission Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#14100c] border border-[#c9a96e]/30 p-6 sm:p-8 shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#c9a96e]/15 flex items-center justify-center text-[#c9a96e] mb-4 border border-[#c9a96e]/30">
              <Send className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif text-[#f5f0e8] mb-2">Submit Examination?</h3>
            <p className="text-xs sm:text-sm text-[#a09787] mb-6 leading-relaxed">
              You have answered <span className="text-[#c9a96e] font-bold">{answeredCount}</span> out of{' '}
              <span className="text-[#f5f0e8] font-bold">{questions.length}</span> questions.
              {answeredCount < questions.length && (
                <span className="text-rose-400 block mt-1 font-semibold">
                  Warning: You have {questions.length - answeredCount} unanswered questions!
                </span>
              )}
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2.5 rounded-xl bg-[#1c1611] hover:bg-[#282018] text-[#a09787] hover:text-[#f5f0e8] text-xs font-semibold border border-[#c9a96e]/20"
              >
                Continue Reviewing
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleAutoSubmit}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] font-bold text-xs shadow-lg shadow-[#c9a96e]/20 hover:brightness-105"
              >
                {isSubmitting ? 'Submitting...' : 'Yes, Confirm & Grade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

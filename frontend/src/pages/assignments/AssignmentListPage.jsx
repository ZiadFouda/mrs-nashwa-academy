import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import platformDb from '../../utils/platformDb';
import {
  FileCheck2,
  Clock,
  CheckCircle,
  PlayCircle,
  HelpCircle,
  Filter,
  Calendar,
  AlertCircle,
  Sparkles,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AssignmentListPage() {
  const [assignments, setAssignments] = useState(() => platformDb.getAssignments());
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setAssignments(platformDb.getAssignments());
  }, []);

  const filteredAssignments = assignments.filter((asg) => {
    if (statusFilter === 'all') return true;
    return (asg.status || '').toLowerCase().replace(/\s+/g, '_') === statusFilter;
  });

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#241a12] via-[#1a140f] to-[#14100c] border border-[#c9a96e]/30 shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a96e]/15 text-[#c9a96e] text-xs font-semibold mb-3 border border-[#c9a96e]/25">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital SAT & EST Testing Suite</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif text-[#f5f0e8] tracking-tight">
            Assignments & Timed Drills
          </h1>
          <p className="text-[#a09787] text-xs sm:text-sm mt-2 leading-relaxed">
            Practice under strict official exam conditions: countdown timers, automatic submission on expiry, instantaneous score calculation, and deep diagnostic competency analytics.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-2 rounded-2xl bg-[#14100c]/80 border border-[#c9a96e]/20 overflow-x-auto w-fit">
        {[
          { key: 'all', label: 'All Exams' },
          { key: 'not_started', label: 'Not Started' },
          { key: 'in_progress', label: 'In Progress' },
          { key: 'graded', label: 'Graded & Reviewed' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition border ${
              statusFilter === tab.key
                ? 'bg-[#18130e] text-[#c9a96e] border-[#c9a96e] shadow-md font-bold'
                : 'bg-[#18130e] text-[#a09787] border-[#c9a96e]/15 hover:border-[#c9a96e]/30 hover:text-[#f5f0e8]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAssignments.map((asg) => {
          const isLocked = asg.prerequisite_met === false;

          return (
            <div
              key={asg.id}
              className={`p-6 rounded-3xl border transition-all duration-300 shadow-xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                isLocked
                  ? 'bg-[#14100c]/60 border-white/5 opacity-80'
                  : 'bg-[#14100c]/90 border-[#c9a96e]/20 hover:border-[#c9a96e]/40'
              }`}
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#c9a96e]/15 text-[#c9a96e] border border-[#c9a96e]/30">
                    {asg.type}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      isLocked
                        ? 'bg-amber-950/70 text-amber-400 border border-amber-500/30'
                        : asg.status === 'Graded'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : asg.status === 'In Progress'
                        ? 'bg-[#2a2015] text-[#d4b87a] border border-[#c9a96e]/40'
                        : 'bg-white/5 text-[#a09787] border border-white/10'
                    }`}
                  >
                    {isLocked ? 'Prerequisite Required' : asg.status}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-serif text-[#f5f0e8] leading-snug flex items-center gap-2">
                  {isLocked && <Lock className="w-4 h-4 text-amber-400 shrink-0" />}
                  <span>{asg.title}</span>
                </h2>

                {isLocked ? (
                  <p className="text-xs text-amber-300/90 bg-amber-950/40 border border-amber-500/20 px-3 py-1.5 rounded-xl inline-flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      Locked: Complete <strong>{asg.prerequisite_title || 'previous assignment'}</strong> first before unlocking this test.
                    </span>
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#a09787]">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#c9a96e]" />
                      {asg.time_limit_minutes} Mins Duration
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-[#d4b87a]" />
                      {asg.total_questions} Questions
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#a09787]" />
                      Due {new Date(asg.due_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full md:w-auto gap-4">
                {asg.status === 'Graded' ? (
                  <div className="text-right">
                    <span className="text-xs text-[#a09787]">Final Score</span>
                    <div className="text-2xl font-black text-emerald-400 font-mono">
                      {asg.score}%
                    </div>
                    <span className="text-[10px] text-gray-500">
                      Class Avg: {asg.class_average}%
                    </span>
                  </div>
                ) : (
                  <div className="text-right text-xs text-[#a09787]">
                    Passing benchmark: <strong className="text-[#c9a96e]">{asg.passing_score}%</strong>
                  </div>
                )}

                {isLocked ? (
                  <button
                    onClick={() =>
                      toast.error(
                        `Prerequisite rule: You must first complete "${asg.prerequisite_title}" to unlock this assessment.`
                      )
                    }
                    className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-white/5 border border-white/10 text-gray-400 cursor-not-allowed flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Locked</span>
                  </button>
                ) : (
                  <Link
                    to={
                      asg.status === 'Graded'
                        ? `/assignments/${asg.id}/results`
                        : `/assignments/${asg.id}/take`
                    }
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 ${
                      asg.status === 'Graded'
                        ? 'bg-[#1c1611] hover:bg-[#282018] text-[#c9a96e] border border-[#c9a96e]/30 shadow-md'
                        : 'bg-gradient-to-r from-[#c9a96e] to-[#a8894e] hover:brightness-105 text-[#0d0b08] shadow-lg shadow-[#c9a96e]/20'
                    }`}
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>
                      {asg.status === 'Graded'
                        ? 'View Analysis'
                        : asg.status === 'In Progress'
                        ? 'Resume Test'
                        : 'Start Test'}
                    </span>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

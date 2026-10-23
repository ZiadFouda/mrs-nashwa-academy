import React from 'react';
import {
  PerformanceTrendChart,
  SubjectBreakdownChart,
  SkillRadarChart,
} from '../../components/Charts';
import { PERFORMANCE_DATA, SKILL_RADAR_DATA, ASSIGNMENTS } from '../../utils/mockData';
import { useAuth } from '../../contexts/AuthContext';
import {
  BarChart3,
  TrendingUp,
  Award,
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  BookOpen,
} from 'lucide-react';

export default function StudentAnalyticsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#1c1611] via-[#241c14] to-[#14100c] border border-[#c9a96e]/30 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a96e]/15 text-[#d4b87a] text-xs font-semibold mb-3 border border-[#c9a96e]/25">
              <Sparkles className="w-3.5 h-3.5 text-[#c9a96e]" />
              <span>English Diagnostic Learning Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#f5f0e8]">
              SAT & EST English Performance Trajectory
            </h1>
            <p className="text-[#a09787] text-xs sm:text-sm mt-1">
              Scholar: <strong className="text-[#c9a96e]">{user?.full_name || 'Ziad Mansour'}</strong> • Grade {user?.grade || '11'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0d0b08]/80 border border-[#c9a96e]/30 text-center min-w-[170px]">
            <span className="text-[10px] text-[#a09787] uppercase tracking-wider font-semibold block">
              Monthly Progress Trend
            </span>
            <div className="text-3xl font-serif text-emerald-400 mt-1 flex items-center justify-center gap-1">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>+24%</span>
            </div>
            <span className="text-[11px] text-[#d4b87a] font-mono">+160 Pts on SAT R&W Curve</span>
          </div>
        </div>
      </div>

      {/* Main Charts: Line Chart + Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Line Chart (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#14100c]/90 border border-[#c9a96e]/20 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-[#f5f0e8] text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#c9a96e]" />
                <span>Reading & Writing Score Trajectory</span>
              </h3>
              <p className="text-xs text-[#a09787]">
                Comparing individual monthly diagnostics against Mrs. Nashwa's cohort benchmark
              </p>
            </div>
          </div>

          <PerformanceTrendChart data={PERFORMANCE_DATA} height={320} />
        </div>

        {/* Skill Radar Chart (1 Col) */}
        <div className="p-6 rounded-2xl bg-[#14100c]/90 border border-[#c9a96e]/20 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h3 className="font-serif font-bold text-[#f5f0e8] text-base flex items-center gap-2 mb-1">
              <Target className="w-5 h-5 text-[#c9a96e]" />
              <span>English Competency Radar</span>
            </h3>
            <p className="text-xs text-[#a09787] mb-2">
              Mastery across the College Board & EST domains
            </p>
          </div>

          <SkillRadarChart data={SKILL_RADAR_DATA} height={300} />
        </div>
      </div>

      {/* Subject Breakdown & Strength/Weakness Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart: Subject Breakdown */}
        <div className="p-6 rounded-2xl bg-[#14100c]/90 border border-[#c9a96e]/20 shadow-xl backdrop-blur-xl">
          <h3 className="font-serif font-bold text-[#f5f0e8] text-base mb-1 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#c9a96e]" />
            <span>Domain Accuracy (%)</span>
          </h3>
          <p className="text-xs text-[#a09787] mb-6">
            Detailed breakdown based on completed quizzes, diagnostics, and mock exams
          </p>

          <SubjectBreakdownChart height={280} />
        </div>

        {/* Strengths and Targeted Weaknesses */}
        <div className="p-6 rounded-2xl bg-[#14100c]/90 border border-[#c9a96e]/20 shadow-xl backdrop-blur-xl space-y-6">
          <h3 className="font-serif font-bold text-[#f5f0e8] text-base flex items-center gap-2 border-b border-[#c9a96e]/15 pb-3">
            <Award className="w-5 h-5 text-[#c9a96e]" />
            <span>Targeted Diagnostic Feedback</span>
          </h3>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Key Strength: Standard English Conventions (96%)</span>
              </div>
              <p className="text-xs text-[#d8cfc4] leading-relaxed">
                Flawless accuracy on sentence boundaries, punctuation, modifier placement, and semicolon vs. colon rules.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#241c14] border border-[#c9a96e]/30">
              <div className="flex items-center gap-2 text-[#d4b87a] text-xs font-bold uppercase tracking-wider mb-1">
                <AlertTriangle className="w-4 h-4 text-[#c9a96e]" />
                <span>Target for Improvement: Paired Texts & Cross-Text Connections (82%)</span>
              </div>
              <p className="text-xs text-[#a09787] leading-relaxed">
                Comparative analysis of dual historical speeches requires slightly faster identification of author tone differences.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#1c1611] border border-[#c9a96e]/20 text-xs text-[#d8cfc4] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#f5f0e8] block">Mrs. Nashwa's Recommended Drill:</span>
                <span className="text-[#c9a96e]">Rhetorical Synthesis & Hard Module 2 Transitions #3</span>
              </div>
              <button
                onClick={() => (window.location.href = '/assignments')}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] font-bold text-xs hover:brightness-105"
              >
                Start Drill
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Exam Scores Table */}
      <div className="p-6 rounded-2xl bg-[#14100c]/90 border border-[#c9a96e]/20 shadow-xl backdrop-blur-xl">
        <h3 className="font-serif font-bold text-[#f5f0e8] text-base mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#c9a96e]" />
          <span>Recent Testing Records</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#d8cfc4]">
            <thead className="border-b border-[#c9a96e]/15 uppercase text-[10px] tracking-wider text-[#a09787]">
              <tr>
                <th className="py-3 px-4">Test Title</th>
                <th className="py-3 px-4">Exam Type</th>
                <th className="py-3 px-4">Date Taken</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Class Average</th>
                <th className="py-3 px-4 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c9a96e]/10">
              {ASSIGNMENTS.map((asg) => (
                <tr key={asg.id} className="hover:bg-white/5 transition">
                  <td className="py-3.5 px-4 font-semibold text-[#f5f0e8]">{asg.title}</td>
                  <td className="py-3.5 px-4">{asg.type}</td>
                  <td className="py-3.5 px-4 font-mono text-[#a09787]">
                    {asg.completed_at
                      ? new Date(asg.completed_at).toLocaleDateString()
                      : 'Pending'}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#c9a96e]">
                    {asg.score ? `${asg.score}%` : '—'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#a09787]">{asg.class_average}%</td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        asg.status === 'Graded'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                          : 'bg-[#282018] text-[#d4b87a] border border-[#c9a96e]/30'
                      }`}
                    >
                      {asg.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

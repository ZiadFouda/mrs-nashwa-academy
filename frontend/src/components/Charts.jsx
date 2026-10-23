import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

// Custom dark warm glass tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#14100c]/95 border border-[#c9a96e]/30 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1">
        <p className="font-bold text-[#d4b87a] border-b border-[#c9a96e]/15 pb-1 mb-1 font-serif">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 font-sans">
            <span style={{ color: entry.color }} className="font-medium">
              {entry.name}:
            </span>
            <span className="font-mono font-bold text-[#f5f0e8]">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// 1. Performance Trend Line Chart
export function PerformanceTrendChart({ data, height = 300 }) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGoldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#c9a96e" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#c9a96e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(201, 169, 110, 0.08)" />
          <XAxis
            dataKey="month"
            stroke="rgba(201, 169, 110, 0.4)"
            tick={{ fontSize: 11, fill: '#a09787' }}
            axisLine={{ stroke: 'rgba(201, 169, 110, 0.15)' }}
          />
          <YAxis
            domain={['auto', 'auto']}
            stroke="rgba(201, 169, 110, 0.4)"
            tick={{ fontSize: 11, fill: '#a09787' }}
            axisLine={{ stroke: 'rgba(201, 169, 110, 0.15)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ fontSize: '11px', color: '#d8cfc4' }}
          />
          <Line
            type="monotone"
            dataKey="score"
            name="My SAT R&W Score"
            stroke="#c9a96e"
            strokeWidth={3}
            dot={{ r: 4, fill: '#c9a96e', strokeWidth: 2, stroke: '#0d0b08' }}
            activeDot={{ r: 6, stroke: '#f5f0e8', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="classAvg"
            name="Batch Average"
            stroke="#d4b87a"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={{ r: 3, fill: '#d4b87a' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// 2. Score Distribution / Subject Breakdown Bar Chart
export function SubjectBreakdownChart({
  data = [
    { subject: 'Craft & Structure', score: 94 },
    { subject: 'Information & Ideas', score: 88 },
    { subject: 'Standard Conventions', score: 96 },
    { subject: 'Transitions & Logic', score: 90 },
    { subject: 'Rhetorical Synthesis', score: 92 },
    { subject: 'Vocabulary in Context', score: 89 },
  ],
  height = 280,
}) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(201, 169, 110, 0.08)" />
          <XAxis
            dataKey="subject"
            stroke="rgba(201, 169, 110, 0.4)"
            tick={{ fontSize: 10, fill: '#a09787' }}
            angle={-15}
            textAnchor="end"
            interval={0}
          />
          <YAxis stroke="rgba(201, 169, 110, 0.4)" domain={[0, 100]} tick={{ fontSize: 11, fill: '#a09787' }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="score"
            name="Accuracy %"
            fill="#c9a96e"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 3. Competencies Radar Chart
export function SkillRadarChart({ data, height = 300 }) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="rgba(201, 169, 110, 0.15)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#d8cfc4', fontSize: 10 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            stroke="rgba(201, 169, 110, 0.25)"
            tick={{ fill: '#a09787', fontSize: 9 }}
          />
          <Radar
            name="Student Proficiency"
            dataKey="score"
            stroke="#c9a96e"
            fill="#c9a96e"
            fillOpacity={0.4}
          />
          <Radar
            name="Cohort Benchmark"
            dataKey="benchmark"
            stroke="#8b7355"
            fill="#8b7355"
            fillOpacity={0.2}
          />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#a09787' }} />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

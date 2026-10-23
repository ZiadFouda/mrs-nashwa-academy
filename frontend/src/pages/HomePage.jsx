import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Background3D from '../components/Background3D';
import {
  GraduationCap,
  Sparkles,
  Award,
  Video,
  FileCheck2,
  LineChart,
  Users,
  CheckCircle2,
  ArrowRight,
  Star,
  ShieldCheck,
  BookOpen,
  PhoneCall,
  Clock,
  Compass,
  BookmarkCheck,
  PenTool,
} from 'lucide-react';

export default function HomePage() {
  const grades = [
    {
      grade: 'Grade 10',
      title: 'English Foundations & Core Literacy',
      desc: 'Build rock-solid grammar foundations, sentence mechanics, active reading strategies, and vocabulary acquisition before entering official SAT and EST modules.',
      topics: [
        'Sentence Boundaries & Comma Rules',
        'Vocabulary in Context & Greek/Latin Roots',
        'Literary & Informational Text Deconstruction',
      ],
      badge: 'Early Mastery',
    },
    {
      grade: 'Grade 11',
      title: 'Digital SAT & EST I English Masterclass',
      desc: 'Intensive weekly mock simulations, punctuation blueprints, rhetorical synthesis, and speed strategies to target 750+ in SAT Reading & Writing.',
      topics: [
        'Hard Module 2 Adaptive Traps',
        'Standard English Conventions Rules',
        'Textual & Quantitative Evidence Analysis',
      ],
      badge: 'Core Target Year',
    },
    {
      grade: 'Grade 12',
      title: 'Elite Score Maximizer (750+ Sprint)',
      desc: 'Final high-yield sprint for top-tier university admissions (Medicine, Engineering, Business, Computer Science, Mass Comm).',
      topics: [
        'Nuance & Elimination in Hard Passages',
        'EST Literary Essay Architecture',
        'Full-Length Adaptive Proctored Mocks',
      ],
      badge: 'Senior Sprint',
    },
  ];

  const features = [
    {
      icon: Video,
      title: 'Interactive Live & Recorded Lectures',
      desc: 'High-definition sessions with Mrs. Nashwa Abdelhalim, protected with dynamic watermarking and replayable anytime throughout your subscription.',
    },
    {
      icon: FileCheck2,
      title: 'Realistic Timed Mock Exams',
      desc: 'Simulate official testing engines with countdown timers, adaptive difficulty, and auto-submission when time expires.',
    },
    {
      icon: LineChart,
      title: 'English Competency Analytics',
      desc: 'Detailed skill breakdown across Craft & Structure, Information & Ideas, Standard English Conventions, and Expression of Ideas.',
    },
    {
      icon: Users,
      title: 'Dedicated Parent Portal',
      desc: 'Real-time attendance logs, exam score tracking, progress graphs, and direct communication with Mrs. Nashwa’s academic team.',
    },
  ];

  const testimonials = [
    {
      name: 'Youssef El-Husseiny',
      school: 'American International School (Grade 12)',
      score: 'SAT 1550 (Reading & Writing 780)',
      quote:
        'Mrs. Nashwa completely transformed my approach to the Digital SAT Reading & Writing section! Her punctuation frameworks and rhetorical elimination techniques saved me so much time on Module 2.',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Farida Medhat',
      school: 'Modern English School (Grade 11)',
      score: 'EST Literacy 98% / SAT R&W 760',
      quote:
        'The online homework quizzes, instant score breakdowns, and Mrs. Nashwa’s video explanations made all the difference. I jumped from 610 to 760 in just 3 months!',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Dr. Khaled Radwan',
      school: 'Parent of Grade 11 Student',
      score: 'Parent Review',
      quote:
        'As a parent, being able to log into the Parent Portal and view my son’s weekly attendance and diagnostic test scores gives complete peace of mind. The platform is organized and truly professional.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#0d0b08] text-[#f5f0e8] selection:bg-[#c9a96e] selection:text-[#0d0b08] overflow-x-hidden">
      {/* 3D Background */}
      <Background3D />

      {/* Navigation Bar */}
      <nav className="relative z-30 max-w-7xl mx-auto px-6 h-24 flex items-center justify-between border-b border-[#c9a96e]/10">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#c9a96e] via-[#d4b87a] to-[#a8894e] flex items-center justify-center text-[#0d0b08] font-black shadow-lg shadow-[#c9a96e]/20">
            <GraduationCap className="w-6 h-6 text-[#0d0b08]" />
          </div>
          <div>
            <span className="font-serif font-bold text-lg sm:text-xl tracking-tight gold-gradient-text block">
              Mrs. Nashwa Abdelhalim
            </span>
            <span className="text-[10px] text-[#a09787] uppercase tracking-widest font-sans font-semibold">
              English • SAT & EST Preparation
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 font-sans">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#f5f0e8] text-xs sm:text-sm font-medium border border-[#c9a96e]/20 transition backdrop-blur-md"
          >
            Student Portal
          </Link>
          <Link
            to="/login"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a96e] via-[#d4b87a] to-[#b39358] text-[#0d0b08] text-xs sm:text-sm font-bold shadow-lg shadow-[#c9a96e]/25 transition transform active:scale-95 hover:brightness-105"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-20 pt-16 pb-24 px-6 max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1c1611]/80 border border-[#c9a96e]/30 text-[#d4b87a] text-xs font-sans font-medium mb-8 backdrop-blur-md shadow-inner">
            <Sparkles className="w-4 h-4 text-[#c9a96e]" />
            <span>Egypt’s Premier SAT & EST English Academy for American Diploma</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-[#f5f0e8] tracking-tight leading-[1.15] mb-8">
            Master SAT & EST English with{' '}
            <span className="gold-gradient-text italic font-serif">Mrs. Nashwa Abdelhalim</span>
          </h1>

          <p className="max-w-3xl mx-auto text-[#b8afa2] text-base sm:text-lg font-sans font-normal leading-relaxed mb-12">
            A proven, results-driven educational platform engineered exclusively for Grade 10, 11, and 12 American Diploma scholars targeting 750+ in SAT Reading & Writing and top percentiles in EST Literacy.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 font-sans">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#c9a96e] via-[#d4b87a] to-[#a8894e] text-[#0d0b08] font-bold text-sm sm:text-base shadow-xl shadow-[#c9a96e]/20 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <span>Access Student Portal</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <a
              href="#grades"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#1a1510]/80 hover:bg-[#251e17] text-[#f5f0e8] font-medium text-sm sm:text-base border border-[#c9a96e]/25 backdrop-blur-md transition flex items-center justify-center gap-2"
            >
              <Compass className="w-5 h-5 text-[#c9a96e]" />
              <span>Explore Grade Curricula</span>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 rounded-2xl bg-[#14100c]/85 border border-[#c9a96e]/20 backdrop-blur-xl shadow-2xl">
            <div className="border-r border-[#c9a96e]/10 last:border-r-0">
              <div className="text-3xl sm:text-4xl font-serif text-[#c9a96e]">1,500+</div>
              <div className="text-[11px] text-[#a09787] mt-1.5 uppercase font-sans font-semibold tracking-wider">Active Scholars</div>
            </div>
            <div className="border-r border-[#c9a96e]/10 last:border-r-0">
              <div className="text-3xl sm:text-4xl font-serif text-[#f5f0e8]">99.4%</div>
              <div className="text-[11px] text-[#a09787] mt-1.5 uppercase font-sans font-semibold tracking-wider">Score Improvement</div>
            </div>
            <div className="border-r border-[#c9a96e]/10 last:border-r-0">
              <div className="text-3xl sm:text-4xl font-serif text-[#c9a96e]">740+</div>
              <div className="text-[11px] text-[#a09787] mt-1.5 uppercase font-sans font-semibold tracking-wider">Average SAT R&W Score</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-serif text-[#f5f0e8]">15+ Yrs</div>
              <div className="text-[11px] text-[#a09787] mt-1.5 uppercase font-sans font-semibold tracking-wider">American Diploma Experience</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Grade Pathways Section */}
      <section id="grades" className="relative z-20 py-24 px-6 max-w-7xl mx-auto border-t border-[#c9a96e]/10">
        <div className="text-center mb-16">
          <span className="text-xs font-sans font-bold text-[#c9a96e] uppercase tracking-widest block mb-2">
            Targeted Pathways
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#f5f0e8]">
            Curricula Tailored for Your High School Year
          </h2>
          <p className="text-sm font-sans text-[#a09787] mt-2 max-w-xl mx-auto">
            Structured progression designed to take students from fundamental grammar to top-percentile test execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {grades.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6 }}
              className="p-8 rounded-2xl bg-[#14100c]/90 border border-[#c9a96e]/20 hover:border-[#c9a96e]/50 backdrop-blur-xl shadow-xl flex flex-col justify-between transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-serif text-[#c9a96e]">{item.grade}</span>
                  <span className="text-[10px] font-sans font-bold px-3 py-1 rounded-full bg-[#241c14] text-[#d4b87a] border border-[#c9a96e]/30">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-xl font-serif text-[#f5f0e8] mb-3">{item.title}</h3>
                <p className="text-[#a09787] font-sans text-xs sm:text-sm mb-6 leading-relaxed">{item.desc}</p>
                <div className="space-y-2.5 mb-8 font-sans">
                  {item.topics.map((t, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-[#d8cfc4]">
                      <BookmarkCheck className="w-4 h-4 text-[#c9a96e] shrink-0" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to="/login"
                className="w-full py-3 rounded-xl bg-[#241c14] hover:bg-[#32271c] border border-[#c9a96e]/30 text-[#f5f0e8] font-sans font-semibold text-xs text-center transition block"
              >
                Enroll in {item.grade}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-20 py-24 px-6 max-w-7xl mx-auto border-t border-[#c9a96e]/10">
        <div className="text-center mb-16">
          <span className="text-xs font-sans font-bold text-[#c9a96e] uppercase tracking-widest block mb-2">
            Engineered For Excellence
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#f5f0e8]">
            Everything You Need to Ace SAT & EST English
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-7 rounded-2xl bg-[#14100c]/70 border border-[#c9a96e]/15 hover:border-[#c9a96e]/40 transition backdrop-blur-md"
              >
                <div className="w-12 h-12 rounded-xl bg-[#241c14] border border-[#c9a96e]/30 flex items-center justify-center text-[#c9a96e] mb-5">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-serif font-bold text-[#f5f0e8] mb-2">{feat.title}</h3>
                <p className="text-[#a09787] text-xs leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-20 py-24 px-6 max-w-7xl mx-auto border-t border-[#c9a96e]/10">
        <div className="text-center mb-16">
          <span className="text-xs font-sans font-bold text-[#c9a96e] uppercase tracking-widest block mb-2">
            Proven Results
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#f5f0e8]">
            Hear From Our Scholars and Parents
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-7 rounded-2xl bg-[#14100c]/80 border border-[#c9a96e]/15 backdrop-blur-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-[#c9a96e] mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#c9a96e]" />
                  ))}
                </div>
                <p className="text-[#d8cfc4] text-xs sm:text-sm italic mb-6 leading-relaxed">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3.5 pt-5 border-t border-[#c9a96e]/15">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-11 h-11 rounded-full object-cover border border-[#c9a96e]/40"
                />
                <div>
                  <h4 className="font-semibold text-[#f5f0e8] text-xs">{t.name}</h4>
                  <p className="text-[#c9a96e] font-sans font-semibold text-[11px]">{t.score}</p>
                  <p className="text-[#a09787] text-[10px]">{t.school}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="relative z-20 py-20 px-6 max-w-5xl mx-auto text-center font-sans">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-b from-[#1c1611] to-[#120e0a] border border-[#c9a96e]/30 shadow-2xl backdrop-blur-2xl">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#f5f0e8] mb-4">
            Ready to Achieve Your Dream Score?
          </h2>
          <p className="text-[#b8afa2] text-sm sm:text-base max-w-2xl mx-auto mb-8 font-light">
            Join Mrs. Nashwa Abdelhalim's official SAT & EST English preparation cohorts today. Monthly and full-course enrollment options available with InstaPay.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#c9a96e] via-[#d4b87a] to-[#a8894e] text-[#0d0b08] font-bold text-sm shadow-xl shadow-[#c9a96e]/20 transition transform active:scale-95 hover:brightness-105"
            >
              Sign In to Your Dashboard
            </Link>
            <a
              href="https://wa.me/201000000000"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#f5f0e8] font-semibold text-sm border border-[#c9a96e]/25 transition flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-[#c9a96e]" />
              <span>Contact Admissions on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 border-t border-[#c9a96e]/15 py-10 px-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#a09787] font-sans">
        <div className="flex items-center gap-2.5">
          <GraduationCap className="w-5 h-5 text-[#c9a96e]" />
          <span className="font-serif font-bold text-[#f5f0e8]">Mrs. Nashwa Abdelhalim Academy</span>
        </div>
        <div>American Diploma English Specialists • SAT (Reading & Writing) & EST (Literacy I & II)</div>
        <div>© {new Date().getFullYear()} All Rights Reserved.</div>
      </footer>
    </div>
  );
}

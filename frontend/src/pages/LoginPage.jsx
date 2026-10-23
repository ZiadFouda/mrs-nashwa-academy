import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Background3D from '../components/Background3D';
import {
  GraduationCap,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  BookOpen,
  KeyRound,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showCredentialsHelp, setShowCredentialsHelp] = useState(false);

  // Registration specific fields
  const [regData, setRegData] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    grade: '11',
    phone: '',
    parent_name: '',
    parent_phone: '',
    target_exam: 'Digital SAT & EST English',
  });

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please provide both your username or email and your password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(username, password, rememberMe);
    setIsSubmitting(false);

    if (result.success) {
      if (result.user.role === 'parent') {
        navigate('/parent/dashboard');
      } else {
        navigate(from === '/login' ? '/dashboard' : from);
      }
    } else {
      setError(result.error || 'Invalid credentials. Please check your username and password.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!regData.username.trim() || !regData.password.trim() || !regData.full_name.trim()) {
      setError('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      ...regData,
      role: 'student',
    });
    setIsSubmitting(false);

    if (result.success) {
      setIsRegisterMode(false);
      setUsername(regData.username);
      setPassword(regData.password);
      toast.success('Registration complete! Please click Sign In with your new credentials.');
    } else {
      setError(result.error || 'Registration failed.');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden select-none bg-[#0d0b08]">
      {/* 3D Background */}
      <Background3D />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md font-sans"
      >
        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-9 bg-[#14100c]/90 backdrop-blur-2xl border border-[#c9a96e]/25 shadow-2xl shadow-black/80">
          {/* Header & Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-[#c9a96e] via-[#d4b87a] to-[#a8894e] text-[#0d0b08] shadow-lg shadow-[#c9a96e]/20 mb-3">
              <GraduationCap className="w-8 h-8 text-[#0d0b08]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#f5f0e8] tracking-tight">
              Mrs. Nashwa Abdelhalim
            </h1>
            <p className="text-[#c9a96e] text-xs sm:text-sm font-semibold tracking-wider uppercase mt-1">
              SAT & EST English Academic Platform
            </p>
            <p className="text-[#a09787] text-xs mt-1.5">
              Official Portal for Grades 10, 11, and 12 American Diploma Scholars
            </p>
          </div>

          {/* Mode Switcher Tabs (Sign In / Register) */}
          <div className="flex rounded-xl bg-[#1c1611] p-1 border border-[#c9a96e]/20 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                !isRegisterMode
                  ? 'bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] shadow-sm'
                  : 'text-[#a09787] hover:text-[#f5f0e8]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                isRegisterMode
                  ? 'bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] shadow-sm'
                  : 'text-[#a09787] hover:text-[#f5f0e8]'
              }`}
            >
              New Student Registration
            </button>
          </div>

          {/* Error Message banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 p-3 rounded-xl bg-red-950/70 border border-red-500/40 flex items-center gap-2 text-xs text-red-200"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Sign In Form */}
          {!isRegisterMode ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#d8cfc4] uppercase tracking-wider mb-1.5">
                  Username or Academic Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a09787]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin, mrs.nashwa, student"
                    required
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1c1611]/80 border border-[#c9a96e]/20 text-[#f5f0e8] placeholder-[#7d7465] text-sm focus:outline-none focus:border-[#c9a96e] focus:ring-1 focus:ring-[#c9a96e] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#d8cfc4] uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a09787]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#1c1611]/80 border border-[#c9a96e]/20 text-[#f5f0e8] placeholder-[#7d7465] text-sm focus:outline-none focus:border-[#c9a96e] focus:ring-1 focus:ring-[#c9a96e] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#a09787] hover:text-[#f5f0e8]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me and Need Help */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#a09787] hover:text-[#f5f0e8]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#1c1611] border-[#c9a96e]/30 text-[#c9a96e] focus:ring-[#c9a96e]"
                  />
                  <span>Remember this device</span>
                </label>
                <a
                  href="https://wa.me/201000000000"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#c9a96e] hover:text-[#d4b87a] font-medium transition"
                >
                  Need assistance?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#c9a96e] via-[#d4b87a] to-[#a8894e] text-[#0d0b08] hover:brightness-105 active:scale-[0.99] transition shadow-lg shadow-[#c9a96e]/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-[#0d0b08] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Platform</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Student Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#d8cfc4] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={regData.full_name}
                  onChange={(e) => setRegData({ ...regData, full_name: e.target.value })}
                  placeholder="e.g. Salma Ahmed"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611]/80 border border-[#c9a96e]/20 text-[#f5f0e8] placeholder-[#7d7465] text-xs focus:outline-none focus:border-[#c9a96e] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#d8cfc4] uppercase tracking-wider mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={regData.username}
                    onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                    placeholder="e.g. salma_ahmed"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611]/80 border border-[#c9a96e]/20 text-[#f5f0e8] placeholder-[#7d7465] text-xs focus:outline-none focus:border-[#c9a96e] transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#d8cfc4] uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    placeholder="Create password"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611]/80 border border-[#c9a96e]/20 text-[#f5f0e8] placeholder-[#7d7465] text-xs focus:outline-none focus:border-[#c9a96e] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#d8cfc4] uppercase tracking-wider mb-1">
                    Grade Level
                  </label>
                  <select
                    value={regData.grade}
                    onChange={(e) => setRegData({ ...regData, grade: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/20 text-[#f5f0e8] text-xs focus:outline-none focus:border-[#c9a96e]"
                  >
                    <option value="10">Grade 10</option>
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#d8cfc4] uppercase tracking-wider mb-1">
                    Target Exam
                  </label>
                  <select
                    value={regData.target_exam}
                    onChange={(e) => setRegData({ ...regData, target_exam: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/20 text-[#f5f0e8] text-xs focus:outline-none focus:border-[#c9a96e]"
                  >
                    <option value="Digital SAT & EST English">Digital SAT & EST</option>
                    <option value="Digital SAT Only">Digital SAT Only</option>
                    <option value="EST Literacy Only">EST Literacy Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#d8cfc4] uppercase tracking-wider mb-1">
                    Student Phone
                  </label>
                  <input
                    type="text"
                    value={regData.phone}
                    onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                    placeholder="+20 10..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611]/80 border border-[#c9a96e]/20 text-[#f5f0e8] placeholder-[#7d7465] text-xs focus:outline-none focus:border-[#c9a96e]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#d8cfc4] uppercase tracking-wider mb-1">
                    Parent Phone
                  </label>
                  <input
                    type="text"
                    value={regData.parent_phone}
                    onChange={(e) => setRegData({ ...regData, parent_phone: e.target.value })}
                    placeholder="+20 10..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611]/80 border border-[#c9a96e]/20 text-[#f5f0e8] placeholder-[#7d7465] text-xs focus:outline-none focus:border-[#c9a96e]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-3 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-[#c9a96e] via-[#d4b87a] to-[#a8894e] text-[#0d0b08] hover:brightness-105 active:scale-[0.99] transition shadow-lg shadow-[#c9a96e]/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-[#0d0b08] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Academic Profile</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Credentials Reference Accordion (Reference guide only - user writes credentials manually) */}
          <div className="mt-6 pt-5 border-t border-[#c9a96e]/15">
            <button
              type="button"
              onClick={() => setShowCredentialsHelp(!showCredentialsHelp)}
              className="w-full flex items-center justify-between text-xs text-[#c9a96e] hover:text-[#d4b87a] transition py-1"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Info className="w-3.5 h-3.5" />
                <span>Default Academic Accounts Reference</span>
              </span>
              {showCredentialsHelp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showCredentialsHelp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-3.5 rounded-xl bg-[#1c1611] border border-[#c9a96e]/20 text-[11px] text-[#a09787] space-y-2.5 font-mono"
              >
                <div className="text-[10px] text-[#d8cfc4] uppercase font-sans font-bold tracking-wider mb-1">
                  Standard Account Credentials:
                </div>
                <div className="p-2 rounded-lg bg-[#14100c] border border-white/5 flex items-center justify-between">
                  <span className="text-[#f5f0e8] font-sans font-semibold">Administrator:</span>
                  <span>admin / <span className="text-[#c9a96e]">NashwaAdmin2026!</span></span>
                </div>
                <div className="p-2 rounded-lg bg-[#14100c] border border-white/5 flex items-center justify-between">
                  <span className="text-[#f5f0e8] font-sans font-semibold">Lead Teacher:</span>
                  <span>mrs.nashwa / <span className="text-[#c9a96e]">NashwaEnglish2026!</span></span>
                </div>
                <div className="p-2 rounded-lg bg-[#14100c] border border-white/5 flex items-center justify-between">
                  <span className="text-[#f5f0e8] font-sans font-semibold">Academic Manager:</span>
                  <span>manager / <span className="text-[#c9a96e]">Manager2026!</span></span>
                </div>
                <div className="p-2 rounded-lg bg-[#14100c] border border-white/5 flex items-center justify-between">
                  <span className="text-[#f5f0e8] font-sans font-semibold">Scholar (Student):</span>
                  <span>student / <span className="text-[#c9a96e]">Student2026!</span></span>
                </div>
                <div className="p-2 rounded-lg bg-[#14100c] border border-white/5 flex items-center justify-between">
                  <span className="text-[#f5f0e8] font-sans font-semibold">Parent Portal:</span>
                  <span>parent / <span className="text-[#c9a96e]">Parent2026!</span></span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Back Link */}
          <div className="mt-5 text-center">
            <Link
              to="/"
              className="text-xs text-[#a09787] hover:text-[#f5f0e8] transition inline-flex items-center gap-1.5"
            >
              <span>← Back to Platform Overview</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

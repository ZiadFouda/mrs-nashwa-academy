import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Background3D from '../components/Background3D';
import {
  GraduationCap,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  BookOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [username, setUsername] = useState('student');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
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
      setError(result.error || 'Invalid credentials.');
    }
  };

  const handleQuickRole = (roleKey) => {
    switchDemoRole(roleKey);
    toast.success(`Logged in as Demo ${roleKey.toUpperCase()}`);
    if (roleKey === 'parent') {
      navigate('/parent/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden select-none bg-[#0d0b08]">
      {/* 3D Background */}
      <Background3D />

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md font-sans"
      >
        <div className="rounded-3xl p-8 sm:p-10 bg-[#14100c]/90 backdrop-blur-2xl border border-[#c9a96e]/20 shadow-2xl shadow-black/80">
          {/* Header & Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-[#c9a96e] via-[#d4b87a] to-[#a8894e] text-[#0d0b08] shadow-lg shadow-[#c9a96e]/20 mb-3">
              <GraduationCap className="w-8 h-8 text-[#0d0b08]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#f5f0e8] tracking-tight">
              Mrs. Nashwa Abdelhalim
            </h1>
            <p className="text-[#c9a96e] text-xs sm:text-sm font-semibold tracking-wider uppercase mt-1">
              SAT & EST English Platform
            </p>
            <p className="text-[#a09787] text-xs mt-2">
              Empowering Grades 10, 11, and 12 American Diploma Scholars
            </p>
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#d8cfc4] uppercase tracking-wider mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a09787]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your student or parent ID"
                  required
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
                  placeholder="Enter your secure password"
                  required
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

            {/* Remember Me and Forgot Password */}
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
                Need help?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#c9a96e] via-[#d4b87a] to-[#a8894e] text-[#0d0b08] hover:brightness-105 active:scale-[0.99] transition shadow-lg shadow-[#c9a96e]/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-[#0d0b08] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Learning Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="mt-8 pt-6 border-t border-[#c9a96e]/15">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#c9a96e]" />
              <span className="text-[11px] font-bold uppercase text-[#a09787] tracking-wider">
                Instant Demo Evaluation (1-Click Login):
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickRole('student')}
                className="py-2 px-2 rounded-lg bg-[#1c1611] hover:bg-[#282018] border border-[#c9a96e]/30 text-[#d4b87a] text-xs font-semibold transition"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('teacher')}
                className="py-2 px-2 rounded-lg bg-[#1c1611] hover:bg-[#282018] border border-[#c9a96e]/30 text-[#f5f0e8] text-xs font-semibold transition"
              >
                Teacher
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('parent')}
                className="py-2 px-2 rounded-lg bg-[#1c1611] hover:bg-[#282018] border border-[#c9a96e]/30 text-[#c9a96e] text-xs font-semibold transition"
              >
                Parent
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('manager')}
                className="py-2 px-2 rounded-lg bg-[#1c1611] hover:bg-[#282018] border border-[#c9a96e]/30 text-[#d8cfc4] text-xs font-semibold transition"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('admin')}
                className="py-2 px-2 rounded-lg bg-[#1c1611] hover:bg-[#282018] border border-[#c9a96e]/30 text-[#e2ce9f] text-xs font-semibold transition col-span-2"
              >
                Administrator
              </button>
            </div>
          </div>

          {/* Footer Back Link */}
          <div className="mt-6 text-center">
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

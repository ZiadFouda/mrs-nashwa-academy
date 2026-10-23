import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  BarChart3,
  Users,
  Upload,
  PlusCircle,
  CreditCard,
  LogOut,
  Menu,
  X,
  Bell,
  GraduationCap,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import SecurityShield from './SecurityShield';
import Background3D from './Background3D';

export default function Layout({ children }) {
  const { user, logout, switchDemoRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Auto-collapse sidebar on iPad portrait & smaller screens (< 1024px)
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Role based navigation links
  const getNavItems = () => {
    const role = user?.role || 'student';

    switch (role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'User Management', path: '/admin/users', icon: Users },
          { name: 'Course Management', path: '/admin/courses', icon: BookOpen },
          { name: 'Enrollment & Fees', path: '/admin/enrollments', icon: CreditCard },
          { name: 'Student Analytics', path: '/analytics', icon: BarChart3 },
          { name: 'Materials Upload', path: '/manager/upload', icon: Upload },
        ];
      case 'manager':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Upload Materials', path: '/manager/upload', icon: Upload },
          { name: 'Create Assignment', path: '/manager/assignments/create', icon: PlusCircle },
          { name: 'Course Catalog', path: '/courses', icon: BookOpen },
          { name: 'Analytics & Results', path: '/analytics', icon: BarChart3 },
        ];
      case 'teacher':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'My Courses', path: '/courses', icon: BookOpen },
          { name: 'Assignments Hub', path: '/assignments', icon: FileCheck2 },
          { name: 'Create Assignment', path: '/manager/assignments/create', icon: PlusCircle },
          { name: 'Upload Handouts', path: '/manager/upload', icon: Upload },
          { name: 'Class Analytics', path: '/analytics', icon: BarChart3 },
        ];
      case 'parent':
        return [
          { name: 'Parent Overview', path: '/parent/dashboard', icon: LayoutDashboard },
          { name: 'Child Performance', path: '/parent/children/u-student-01', icon: BarChart3 },
          { name: 'Course Curriculum', path: '/courses', icon: BookOpen },
        ];
      case 'student':
      default:
        return [
          { name: 'Learning Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'My Courses', path: '/courses', icon: BookOpen },
          { name: 'Assignments & Exams', path: '/assignments', icon: FileCheck2 },
          { name: 'Progress Analytics', path: '/analytics', icon: BarChart3 },
        ];
    }
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <SecurityShield>
      <div className="relative min-h-screen bg-[#0d0b08] text-[#f5f0e8] flex flex-col font-sans selection:bg-[#c9a96e] selection:text-[#0d0b08] overflow-x-hidden">
        {/* Pure 3D Background - Themed as Home Page */}
        <Background3D />

        {/* Top Header */}
        <header className="h-16 border-b border-[#c9a96e]/15 bg-[#14100c]/85 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6">
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#a09787] hover:text-[#f5f0e8] hover:bg-white/5 transition"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden md:flex p-2 rounded-xl text-[#a09787] hover:text-[#f5f0e8] hover:bg-white/5 transition"
            aria-label="Collapse sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#c9a96e] via-[#d4b87a] to-[#a8894e] flex items-center justify-center text-[#0d0b08] shadow-md shadow-[#c9a96e]/20 shrink-0">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-[#0d0b08]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-serif font-bold text-xs sm:text-base tracking-tight gold-gradient-text leading-tight truncate">
                <span className="sm:hidden">Mrs. Nashwa</span>
                <span className="hidden sm:inline">Mrs. Nashwa Abdelhalim</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-[#a09787] uppercase tracking-wider font-semibold truncate">
                English • SAT & EST
              </span>
            </div>
          </Link>
        </div>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* 1-Click Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1c1611] hover:bg-[#282018] border border-[#c9a96e]/25 text-[11px] text-[#d4b87a] font-semibold transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c9a96e]" />
              <span className="hidden sm:inline">Role:</span>
              <span className="capitalize">{user?.role || 'student'}</span>
            </button>

            {showRoleSwitcher && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#14100c] border border-[#c9a96e]/25 shadow-2xl p-2 z-50 text-xs">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#a09787] border-b border-[#c9a96e]/15 mb-1">
                  Switch Demo Role
                </div>
                {['student', 'teacher', 'manager', 'admin', 'parent'].map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      switchDemoRole(role);
                      setShowRoleSwitcher(false);
                      if (role === 'parent') {
                        navigate('/parent/dashboard');
                      } else {
                        navigate('/dashboard');
                      }
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition flex items-center justify-between ${
                      user?.role === role
                        ? 'bg-[#241c14] text-[#d4b87a] font-bold border border-[#c9a96e]/30'
                        : 'text-[#d8cfc4] hover:bg-white/5 hover:text-[#f5f0e8]'
                    }`}
                  >
                    <span>{role}</span>
                    {user?.role === role && <ShieldCheck className="w-3.5 h-3.5 text-[#c9a96e]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-[#a09787] hover:text-[#f5f0e8] hover:bg-white/5 transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#c9a96e]" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#14100c] border border-[#c9a96e]/25 shadow-2xl p-3 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#c9a96e]/15">
                  <span className="font-bold text-[#f5f0e8]">Academic Notifications</span>
                  <span className="text-[10px] text-[#c9a96e] font-medium">3 unread</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-[#1c1611] hover:bg-[#241c14] transition cursor-pointer border border-[#c9a96e]/10">
                    <p className="font-semibold text-[#f5f0e8]">New SAT English Mock Released</p>
                    <p className="text-[#a09787] text-[11px]">Due in 3 days: Sentence Boundaries & Rhetorical Synthesis.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#1c1611] hover:bg-[#241c14] transition cursor-pointer border border-[#c9a96e]/10">
                    <p className="font-semibold text-[#f5f0e8]">Mrs. Nashwa Abdelhalim</p>
                    <p className="text-[#a09787] text-[11px]">Upcoming live revision on Friday: Hard Module 2 Vocabulary.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#1c1611] hover:bg-[#241c14] transition cursor-pointer border border-[#c9a96e]/10">
                    <p className="font-semibold text-[#f5f0e8]">Score Report Verified</p>
                    <p className="text-[#a09787] text-[11px]">Your score for Reading & Writing Diagnostic 2 is 740/800.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Info */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-[#c9a96e]/15">
            <img
              src={
                user?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
              }
              alt={user?.full_name || 'User avatar'}
              className="w-8 h-8 rounded-full object-cover border border-[#c9a96e]/40"
            />
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#f5f0e8] leading-tight truncate max-w-[120px]">
                {user?.full_name || 'User'}
              </span>
              <span className="text-[10px] text-[#c9a96e] font-mono capitalize">
                {user?.role === 'student' ? `Grade ${user?.grade || '11'}` : user?.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-[#a09787] hover:text-red-400 hover:bg-red-500/10 transition"
              title="Sign Out"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar + Content */}
      <div className="flex flex-1 relative">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:flex flex-col bg-[#14100c]/85 backdrop-blur-xl border-r border-[#c9a96e]/15 transition-all duration-300 z-30 ${
            isSidebarOpen ? 'w-64' : 'w-20'
          }`}
        >
          <div className="p-4 flex flex-col gap-1.5 flex-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#a09787]">
              {isSidebarOpen ? 'Navigation' : '•••'}
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition duration-200 group relative border ${
                    isActive
                      ? 'bg-[#18130e] text-[#f5f0e8] shadow-md border-[#c9a96e]/50'
                      : 'bg-[#18130e] text-[#a09787] border-[#c9a96e]/10 hover:border-[#c9a96e]/30 hover:text-[#f5f0e8]'
                  }`}
                  title={!isSidebarOpen ? item.name : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#c9a96e]' : 'text-[#a09787] group-hover:text-[#c9a96e]'
                    }`}
                  />
                  {isSidebarOpen && <span className="truncate">{item.name}</span>}
                  {isActive && isSidebarOpen && (
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#c9a96e]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick Support / Teacher Card */}
          {isSidebarOpen && (
            <div className="p-4 m-3 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 text-xs shadow-inner">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-[#c9a96e]">Academic Helpline</span>
              </div>
              <p className="text-[#a09787] text-[11px] leading-relaxed mb-2.5">
                Need question review or essay guidance from Mrs. Nashwa's team?
              </p>
              <a
                href="https://wa.me/201000000000"
                target="_blank"
                rel="noreferrer"
                className="block text-center py-2 bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] font-bold rounded-lg transition text-[11px] hover:brightness-105"
              >
                WhatsApp Academic Help
              </a>
            </div>
          )}
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-black/85 backdrop-blur-md flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-[#c9a96e]/15 bg-[#14100c]">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-[#c9a96e]" />
                <span className="font-serif font-bold text-[#f5f0e8]">Mrs. Nashwa Abdelhalim</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-[#a09787] hover:text-[#f5f0e8]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 flex flex-col gap-2 flex-1 overflow-y-auto bg-[#0d0b08]">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border ${
                      isActive
                        ? 'bg-[#18130e] text-[#d4b87a] font-bold border-[#c9a96e]/50'
                        : 'bg-[#18130e] text-[#a09787] border-[#c9a96e]/10 hover:border-[#c9a96e]/30 hover:text-[#f5f0e8]'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-[#c9a96e]" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
            <div className="p-4 border-t border-[#c9a96e]/15 bg-[#14100c]">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 font-semibold text-xs"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Page Content Container */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#0d0b08]/80 backdrop-blur-xs relative z-10">
          <div className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
            {children}
          </div>

          {/* Footer */}
          <footer className="border-t border-[#c9a96e]/10 py-6 px-4 sm:px-6 text-center text-xs text-[#7d7465] flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl w-full mx-auto">
            <p>
              © {new Date().getFullYear()} Mrs. Nashwa Abdelhalim English Educational Platform.
            </p>
            <div className="flex items-center gap-4 text-[#a09787] flex-wrap justify-center">
              <span className="hover:text-[#c9a96e] cursor-pointer">SAT & EST Standards</span>
              <span>•</span>
              <span className="hover:text-[#c9a96e] cursor-pointer">Academic Integrity</span>
              <span>•</span>
              <span className="hover:text-[#c9a96e] cursor-pointer">DRM & Screen Protection</span>
            </div>
          </footer>
        </main>
      </div>

      {/* Modern Mobile Bottom Navigation Bar (Phones & Small Tablets < 768px) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#14100c]/95 border-t border-[#c9a96e]/20 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            location.pathname === '/dashboard' ? 'text-[#c9a96e] font-bold' : 'text-[#a09787] hover:text-[#f5f0e8]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Dashboard</span>
        </Link>
        <Link
          to="/courses"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            location.pathname.startsWith('/courses') ? 'text-[#c9a96e] font-bold' : 'text-[#a09787] hover:text-[#f5f0e8]'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px]">Courses</span>
        </Link>
        <Link
          to="/assignments"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            location.pathname.startsWith('/assignments') ? 'text-[#c9a96e] font-bold' : 'text-[#a09787] hover:text-[#f5f0e8]'
          }`}
        >
          <FileCheck2 className="w-5 h-5" />
          <span className="text-[10px]">Exams</span>
        </Link>
        <Link
          to="/analytics"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            location.pathname === '/analytics' ? 'text-[#c9a96e] font-bold' : 'text-[#a09787] hover:text-[#f5f0e8]'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px]">Analytics</span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[#a09787] hover:text-[#f5f0e8] transition"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 text-[#c9a96e]" />
          <span className="text-[10px]">Menu</span>
        </button>
      </nav>
    </div>
    </SecurityShield>
  );
}

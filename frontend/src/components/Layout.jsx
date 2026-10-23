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
  RotateCcw,
  Smartphone,
  Sliders,
} from 'lucide-react';
import SecurityShield from './SecurityShield';
import Background3D from './Background3D';
import SystemRestartModal from './SystemRestartModal';

export default function Layout({ children }) {
  const { user, logout, siteSettings } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);

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
          { name: 'Students & Devices', path: '/manager/students', icon: Smartphone },
          { name: 'Course Management', path: '/admin/courses', icon: BookOpen },
          { name: 'Enrollment & Fees', path: '/admin/enrollments', icon: CreditCard },
          { name: 'Live Site Editor', path: '/admin/site-settings', icon: Sliders },
          { name: 'Student Analytics', path: '/analytics', icon: BarChart3 },
          { name: 'Materials Upload', path: '/manager/upload', icon: Upload },
        ];
      case 'manager':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Students & Devices', path: '/manager/students', icon: Smartphone },
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

        {/* Global Universal Restart Engine & Modal */}
        <SystemRestartModal
          isOpen={isRestartModalOpen}
          onClose={() => setIsRestartModalOpen(false)}
          adminUser={user}
        />

        {/* Global Live Announcement Bar (Managed directly by Admin) */}
        {siteSettings?.announcement_enabled && (
          <div
            className={`py-1.5 px-4 text-center text-xs font-medium border-b flex items-center justify-center gap-2 select-none relative z-50 ${
              siteSettings.announcement_style === 'red'
                ? 'bg-rose-950/90 text-rose-200 border-rose-500/30'
                : siteSettings.announcement_style === 'emerald'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/30'
                : 'bg-[#1c1611]/95 text-[#f5f0e8] border-[#c9a96e]/30'
            }`}
          >
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#c9a96e]/20 text-[#d4b87a] border border-[#c9a96e]/30">
              {siteSettings.announcement_badge || 'NOTICE'}
            </span>
            <span className="truncate">{siteSettings.announcement_text}</span>
          </div>
        )}

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
                  <span className="sm:hidden">
                    {siteSettings?.academy_name ? siteSettings.academy_name.split(' ').slice(0, 2).join(' ') : 'Mrs. Nashwa'}
                  </span>
                  <span className="hidden sm:inline">
                    {siteSettings?.academy_name || 'Mrs. Nashwa Abdelhalim'}
                  </span>
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#a09787] uppercase tracking-wider font-semibold truncate">
                  {siteSettings?.tagline || 'English • SAT & EST'}
                </span>
              </div>
            </Link>
          </div>

          {/* Right Action Icons, Admin Controls & Profile */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            {/* Admin Dedicated "Restart Site" Button */}
            {user?.role === 'admin' && (
              <button
                type="button"
                onClick={() => setIsRestartModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-[#c9a96e]/40 text-xs text-[#d4b87a] font-bold transition shadow-sm hover:scale-[1.02] active:scale-95"
                title="Universal Platform Reboot - Restores health for all connected users"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#c9a96e] animate-spin-slow" />
                <span className="hidden sm:inline font-sans">Restart Site</span>
              </button>
            )}

            {/* Role indicator badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1c1611] border border-[#c9a96e]/20 text-[11px] text-[#c9a96e] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#c9a96e]" />
              <span className="capitalize">{user?.role || 'student'}</span>
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
                {isSidebarOpen ? 'Academic Navigation' : '•••'}
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

              {/* Admin Restart Button in Sidebar */}
              {user?.role === 'admin' && isSidebarOpen && (
                <div className="mt-4 pt-3 border-t border-[#c9a96e]/15">
                  <button
                    type="button"
                    onClick={() => setIsRestartModalOpen(true)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-[#d4b87a] border border-[#c9a96e]/30 transition"
                  >
                    <RotateCcw className="w-4 h-4 text-[#c9a96e]" />
                    <span>Restart Platform</span>
                  </button>
                </div>
              )}
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
                  href={`https://wa.me/${(siteSettings?.whatsapp_number || '+201000000000').replace(/\D/g, '')}`}
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
            <div className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-md flex flex-col">
              <div className="p-4 bg-[#14100c] border-b border-[#c9a96e]/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#c9a96e]" />
                  <span className="font-serif font-bold text-sm text-[#f5f0e8]">Mrs. Nashwa Academy</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-[#a09787] hover:text-[#f5f0e8]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 space-y-2 flex-1 overflow-y-auto bg-[#14100c]">
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
                          ? 'bg-[#18130e] text-[#f5f0e8] border-[#c9a96e]/50'
                          : 'bg-[#18130e] text-[#a09787] border-[#c9a96e]/10 hover:border-[#c9a96e]/30'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-[#c9a96e]" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                {user?.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsRestartModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-amber-500/15 border border-[#c9a96e]/40 text-[#d4b87a] mt-4"
                  >
                    <RotateCcw className="w-5 h-5 text-[#c9a96e]" />
                    <span>Restart Academy Platform</span>
                  </button>
                )}

                <div className="pt-4 border-t border-[#c9a96e]/20 mt-4">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SecurityShield>
  );
}

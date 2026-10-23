import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0b08]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#c9a96e] text-sm font-medium tracking-wide">
            Verifying educational credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#0d0b08] font-sans">
        <div className="max-w-md w-full glass-panel rounded-2xl p-8 border border-red-500/30 text-center shadow-2xl backdrop-blur-xl bg-[#14100c]/90">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-4 text-red-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif text-[#f5f0e8] mb-2">Access Restricted</h2>
          <p className="text-[#a09787] text-sm mb-6 leading-relaxed">
            Your current account role <span className="text-[#c9a96e] font-semibold uppercase">({user.role})</span> does not have authorization to view this portal area.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] font-bold transition shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to My Dashboard
            </a>
            <a
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition border border-white/10 text-xs"
            >
              <LogIn className="w-4 h-4" />
              Sign in with another account
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

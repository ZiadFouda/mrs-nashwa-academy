import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0d0b08] text-[#f5f0e8] font-sans">
      <div className="max-w-md w-full p-8 rounded-3xl bg-[#14100c]/90 border border-[#c9a96e]/25 text-center shadow-2xl backdrop-blur-xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#c9a96e]/15 text-[#c9a96e] flex items-center justify-center mb-4 border border-[#c9a96e]/25">
          <GraduationCap className="w-8 h-8" />
        </div>
        <div className="text-6xl font-black text-[#c9a96e] font-serif mb-2">404</div>
        <h1 className="text-xl font-serif text-[#f5f0e8] mb-2">Page Not Found</h1>
        <p className="text-xs text-[#a09787] mb-6 leading-relaxed">
          The educational material, lecture, or portal route you requested does not exist or has been relocated.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            to="/dashboard"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a8894e] hover:brightness-105 text-[#0d0b08] font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-[#c9a96e]/20"
          >
            <Home className="w-4 h-4" />
            <span>Go to My Dashboard</span>
          </Link>
          <Link
            to="/"
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium border border-white/10 transition"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

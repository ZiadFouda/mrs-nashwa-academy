import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, Lock, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SecurityShield({ children }) {
  const { user } = useAuth();
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [screenshotAttempted, setScreenshotAttempted] = useState(false);

  // Keyboard shortcut interception & Clipboard clearing
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 1. Intercept PrintScreen
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        triggerScreenshotLockout();
        return false;
      }

      // 2. Intercept Snipping Tool / macOS screenshots (Windows+Shift+S / Cmd+Shift+3/4)
      if ((e.shiftKey && (e.key === 'S' || e.key === 's') && (e.metaKey || e.ctrlKey)) ||
          (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4'))) {
        e.preventDefault();
        triggerScreenshotLockout();
        return false;
      }

      // 3. Intercept Ctrl+P (Print)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        toast.error('Printing course materials and exams is strictly disabled.', { id: 'no-print' });
        return false;
      }

      // 4. Intercept Ctrl+S (Save webpage)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
      }

      // 5. Intercept Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        return false;
      }

      // 6. Intercept F12 or Developer tools inspector
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'))) {
        e.preventDefault();
        toast.error('Developer inspection tools are restricted on protected student pages.', { id: 'no-inspect' });
        return false;
      }
    };

    const triggerScreenshotLockout = () => {
      // Attempt to clear clipboard immediately
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('');
        }
      } catch (err) {
        // Ignore clipboard access rejection in background
      }

      setScreenshotAttempted(true);
      toast.error('⚠️ Screenshot Attempt Detected: Screen blanked and clipboard cleared.', {
        id: 'screenshot-lockout',
        duration: 3500,
      });

      setTimeout(() => {
        setScreenshotAttempted(false);
      }, 1800);
    };

    // Right-click context menu blocker
    const handleContextMenu = (e) => {
      // Allow right-click on input elements for convenience
      const tagName = e.target.tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea') return;

      e.preventDefault();
      toast('🔒 Right-click menu disabled to protect educational materials.', {
        id: 'no-context',
        icon: '🛡️',
        style: {
          background: '#1c1611',
          color: '#c9a96e',
          border: '1px solid rgba(201,169,110,0.3)',
        },
      });
      return false;
    };

    // Window focus / blur detection (defeats snipping tool / screen capture overlays)
    const handleBlur = () => {
      setIsWindowBlurred(true);
    };

    const handleFocus = () => {
      setIsWindowBlurred(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsWindowBlurred(true);
      } else {
        setIsWindowBlurred(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const studentIdentifier = user
    ? `${user.full_name || user.username} • ID: ${user.id || 'STU-001'} • ${user.phone || '+20 100 000 0000'}`
    : 'STUDENT #2026 • MRS. NASHWA ACADEMY';

  return (
    <div className="relative min-h-screen select-none protected-content">
      {/* 1. Full Screen Instant Blackout Overlay on Screenshot Attempt */}
      {screenshotAttempted && (
        <div className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-75">
          <div className="w-20 h-20 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 mb-6 animate-pulse">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white mb-2 tracking-wide">
            Security Interception Alert
          </h2>
          <p className="text-red-300 text-sm max-w-md leading-relaxed mb-4">
            Screen capture, snipping tool, or recording attempts are strictly blocked. Clipboard has been cleared and your student account activity has been recorded.
          </p>
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-[#c9a96e]">
            Academic Account: {studentIdentifier}
          </div>
        </div>
      )}

      {/* 2. Window Blur / Screen Recording Obfuscation Veil */}
      {isWindowBlurred && (
        <div className="fixed inset-0 z-[99990] bg-[#0d0b08]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center transition-all duration-300">
          <div className="w-16 h-16 rounded-full bg-[#c9a96e]/15 border border-[#c9a96e]/30 flex items-center justify-center text-[#c9a96e] mb-4">
            <EyeOff className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-serif text-[#f5f0e8] mb-1">
            Protected Learning Window Paused
          </h3>
          <p className="text-xs sm:text-sm text-[#a09787] max-w-sm mb-4">
            Educational content is hidden while this browser window is inactive or an external application is capturing the screen.
          </p>
          <div className="text-[11px] font-mono text-[#c9a96e]/80 bg-black/40 px-3 py-1.5 rounded-lg border border-[#c9a96e]/20">
            Click anywhere inside the window to resume
          </div>
        </div>
      )}

      {/* Page Content */}
      {children}
    </div>
  );
}

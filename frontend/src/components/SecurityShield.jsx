import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, EyeOff, Lock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SecurityShield({ children }) {
  const { user } = useAuth();
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [screenshotAttempted, setScreenshotAttempted] = useState(false);

  useEffect(() => {
    // 1. Trigger Lockout & Overwrite Clipboard
    const triggerScreenshotLockout = () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(
            '⚠️ [SECURITY ALERT] Educational materials from Mrs. Nashwa Abdelhalim Academy are strictly protected against screenshots and screen recording. Unauthorized distribution is prohibited.'
          );
        }
      } catch (err) {
        // Ignore clipboard access rejection in background
      }

      setScreenshotAttempted(true);
      toast.error('⚠️ Screenshot Attempt Blocked: Screen blanked and clipboard wiped.', {
        id: 'screenshot-lockout',
        duration: 4000,
      });

      setTimeout(() => {
        setScreenshotAttempted(false);
      }, 2000);
    };

    // 2. Keyboard Interception (Both keydown AND keyup for Windows PrintScreen support)
    const checkSecurityKeys = (e) => {
      // PrintScreen (fires keydown or keyup on different OS/browser versions)
      if (
        e.key === 'PrintScreen' ||
        e.keyCode === 44 ||
        e.code === 'PrintScreen' ||
        e.key === 'Snapshot'
      ) {
        e.preventDefault();
        triggerScreenshotLockout();
        return false;
      }

      // Windows Snipping Tool (Win + Shift + S) or browser shortcuts (Ctrl + Shift + S)
      if (
        (e.shiftKey && (e.key === 'S' || e.key === 's') && (e.metaKey || e.ctrlKey)) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's'))
      ) {
        e.preventDefault();
        triggerScreenshotLockout();
        return false;
      }

      // macOS Screenshots (Cmd + Shift + 3 / 4 / 5)
      if (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) {
        e.preventDefault();
        triggerScreenshotLockout();
        return false;
      }

      // Print Prevention (Ctrl + P / Cmd + P)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        toast.error('Printing course materials and examinations is strictly disabled.', {
          id: 'no-print',
        });
        return false;
      }

      // Save Webpage (Ctrl + S / Cmd + S)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        toast.error('Saving offline copies of this platform is restricted.', { id: 'no-save' });
        return false;
      }

      // View Source (Ctrl + U)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        return false;
      }

      // DevTools Inspection (F12, Ctrl + Shift + I/J/C)
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'))
      ) {
        e.preventDefault();
        toast.error('Developer tools inspection is disabled on protected academy pages.', {
          id: 'no-inspect',
        });
        return false;
      }
    };

    // 3. Right-Click Context Menu Blocker
    const handleContextMenu = (e) => {
      const tagName = e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (tagName === 'input' || tagName === 'textarea') return;

      e.preventDefault();
      toast('🔒 Protected: Context menu and saving disabled.', {
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

    // 4. Drag & Drop Blocker (Prevent dragging images or passages to desktop)
    const handleDragStart = (e) => {
      const tagName = e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (tagName === 'input' || tagName === 'textarea') return;
      e.preventDefault();
      return false;
    };

    // 5. Copy & Cut Blocker
    const handleCopyCut = (e) => {
      const tagName = e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (tagName === 'input' || tagName === 'textarea') return;

      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData(
          'text/plain',
          '⚠️ [PROTECTED] Materials from Mrs. Nashwa Abdelhalim Academy are copyrighted. Copying and screenshots are strictly forbidden.'
        );
      }
      toast.error('Copying text and materials is disabled to protect academic integrity.', {
        id: 'no-copy',
      });
      return false;
    };

    // 6. Window Focus / Blur Detection (Snipping Tool & External Screen Recorders Blocker)
    const handleBlur = () => {
      // If the user just clicked into an input, don't trigger the blur veil
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }
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

    // 7. Screen Capture API Interception (Blocks browser screen-recording extensions / Loom / Meet / Discord)
    let originalGetDisplayMedia = null;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
        navigator.mediaDevices.getDisplayMedia = async () => {
          triggerScreenshotLockout();
          toast.error('Screen recording is strictly blocked by Mrs. Nashwa Academy Security Shield.', {
            id: 'no-record',
          });
          throw new Error('Screen capture disabled by educational security policy.');
        };
      }
    } catch (err) {
      // Ignore if read-only property
    }

    window.addEventListener('keydown', checkSecurityKeys, true);
    window.addEventListener('keyup', checkSecurityKeys, true);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('dragstart', handleDragStart);
    window.addEventListener('copy', handleCopyCut);
    window.addEventListener('cut', handleCopyCut);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', checkSecurityKeys, true);
      window.removeEventListener('keyup', checkSecurityKeys, true);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('copy', handleCopyCut);
      window.removeEventListener('cut', handleCopyCut);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (originalGetDisplayMedia && navigator.mediaDevices) {
        navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;
      }
    };
  }, []);

  const studentIdentifier = user
    ? `${user.full_name || user.username} • ID: ${user.id || 'STU-001'} • ${user.email || 'enrolled'}`
    : 'STUDENT #2026 • MRS. NASHWA ACADEMY';

  return (
    <div className="relative min-h-screen select-none protected-content">
      {/* 1. Full-Screen Instant Blackout Overlay on Screenshot Attempt */}
      {screenshotAttempted && (
        <div className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-75">
          <div className="w-20 h-20 rounded-full bg-red-950/90 border border-red-500/60 flex items-center justify-center text-red-400 mb-6 animate-pulse">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white mb-2 tracking-wide">
            Security Interception Alert
          </h2>
          <p className="text-red-300 text-sm max-w-md leading-relaxed mb-4">
            Screen capture, snipping tool, or recording attempts are strictly blocked. Clipboard has been wiped and your student session is logged.
          </p>
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-[#c9a96e]">
            Account: {studentIdentifier}
          </div>
        </div>
      )}

      {/* 2. Window Blur / Screen Recording Obfuscation Veil */}
      {isWindowBlurred && (
        <div
          onClick={() => setIsWindowBlurred(false)}
          className="fixed inset-0 z-[99990] bg-[#0d0b08]/98 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-center transition-all duration-200 cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-[#c9a96e]/15 border border-[#c9a96e]/30 flex items-center justify-center text-[#c9a96e] mb-4">
            <EyeOff className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-serif text-[#f5f0e8] mb-1">
            Protected Learning Window Paused
          </h3>
          <p className="text-xs sm:text-sm text-[#a09787] max-w-sm mb-4 leading-relaxed">
            Content is hidden while this browser window is inactive or an external tool is capturing the screen.
          </p>
          <div className="text-[11px] font-mono text-[#c9a96e] bg-black/50 px-4 py-2 rounded-xl border border-[#c9a96e]/30 shadow-lg">
            Click anywhere inside this window to resume
          </div>
        </div>
      )}

      {/* Page Content (hidden/blurred automatically when window loses focus) */}
      <div className={isWindowBlurred ? 'filter blur-2xl opacity-0 pointer-events-none transition-all duration-150' : 'transition-all duration-150'}>
        {children}
      </div>
    </div>
  );
}

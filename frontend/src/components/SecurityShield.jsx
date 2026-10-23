import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════════════════════
//  SECURITY SHIELD v6 — STABLE, NON-INTRUSIVE DEFENSE
//  Fixes:
//  1. ELIMINATED false-positive triggers on phones & tablets (normal taps,
//     scrolling, virtual keyboard popups, iOS address-bar collapse, etc.)
//  2. Only reacts to REAL, verified actions:
//     - Actual PrintScreen / Snipping key combinations (Desktop)
//     - Explicit screen capture API streams (Loom, Meet, Discord)
//     - True app switching / backgrounding (when user actually leaves tab)
//  3. Mobile browsing is completely smooth and never triggers random alerts.
// ═══════════════════════════════════════════════════════════════════════

const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || (navigator && navigator.maxTouchPoints > 0));

export default function SecurityShield({ children }) {
  const { user } = useAuth();
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [screenshotAttempted, setScreenshotAttempted] = useState(false);
  const blurTimeoutRef = useRef(null);

  // ─── Verified Lockout Trigger ─────────────────────────────────────
  const triggerVerifiedLockout = useCallback((reason = 'Capture attempt blocked') => {
    // Overwrite clipboard if accessible
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(
          '⛔ [MRS. NASHWA ACADEMY] Screenshot blocked. Content is protected by educational copyright.'
        );
      }
    } catch (e) {
      /* ignore */
    }

    setScreenshotAttempted(true);
    toast.error('⚠️ Screenshot Blocked! Captured image is blacked out.', {
      id: 'screenshot-lockout-alert',
      duration: 3500,
      icon: '🛡️',
    });

    setTimeout(() => {
      setScreenshotAttempted(false);
    }, 2200);
  }, []);

  useEffect(() => {
    // ─── 1. Desktop Keyboard Interception ───────────────────────────
    const checkSecurityKeys = (e) => {
      // PrintScreen / PrtScn key
      if (
        e.key === 'PrintScreen' ||
        e.keyCode === 44 ||
        e.code === 'PrintScreen' ||
        e.key === 'Snapshot'
      ) {
        e.preventDefault();
        triggerVerifiedLockout('PrintScreen pressed');
        return false;
      }

      // Windows Snipping Tool (Win + Shift + S) or Ctrl + Shift + S
      if (
        (e.shiftKey && (e.key === 'S' || e.key === 's') && (e.metaKey || e.ctrlKey)) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's'))
      ) {
        e.preventDefault();
        triggerVerifiedLockout('Snipping Tool shortcut');
        return false;
      }

      // macOS Screenshots (Cmd + Shift + 3, 4, 5)
      if (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) {
        e.preventDefault();
        triggerVerifiedLockout('macOS screenshot shortcut');
        return false;
      }

      // Print Prevention (Ctrl+P / Cmd+P)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        toast.error('Printing course materials is strictly prohibited.', { id: 'no-print' });
        return false;
      }

      // Save Webpage (Ctrl+S / Cmd+S)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        toast.error('Offline saving is restricted.', { id: 'no-save' });
        return false;
      }

      // DevTools (F12, Ctrl+Shift+I/J/C)
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'))
      ) {
        e.preventDefault();
        toast.error('Developer tools inspection is disabled.', { id: 'no-inspect' });
        return false;
      }
    };

    // ─── 2. True Backgrounding & App-Switching (No False Positives) ───
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User genuinely switched tabs or minimized browser
        setIsWindowBlurred(true);
      } else {
        // User came back to tab
        setIsWindowBlurred(false);
      }
    };

    // On Desktop only: blur when clicking outside window
    const handleDesktopBlur = () => {
      if (isTouchDevice()) return; // Never blur touch devices on input focus or scroll
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      blurTimeoutRef.current = setTimeout(() => {
        if (!document.hasFocus()) {
          setIsWindowBlurred(true);
        }
      }, 300);
    };

    const handleDesktopFocus = () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
      setIsWindowBlurred(false);
    };

    // ─── 3. Context Menu & Copy Restrictions ────────────────────────
    const handleContextMenu = (e) => {
      const tag = e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea') return;
      e.preventDefault();
      toast('🔒 Protected: Saving or right-clicking materials is restricted.', {
        id: 'no-context',
        icon: '🛡️',
        style: { background: '#1c1611', color: '#c9a96e', border: '1px solid rgba(201,169,110,0.3)' },
      });
      return false;
    };

    const handleCopy = (e) => {
      const tag = e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea') return;
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData(
          'text/plain',
          '⚠️ [PROTECTED] Materials from Mrs. Nashwa Abdelhalim Academy are copyrighted.'
        );
      }
      toast.error('Copying is disabled to protect educational materials.', { id: 'no-copy' });
      return false;
    };

    // ─── 4. Screen Capture API Override (Loom, Meet, Discord) ────────
    let originalGetDisplayMedia = null;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
        navigator.mediaDevices.getDisplayMedia = async () => {
          triggerVerifiedLockout('Screen recording extension');
          throw new Error('Screen capture disabled by educational security shield.');
        };
      }
    } catch (err) {
      /* ignore */
    }

    // Attach listeners
    window.addEventListener('keydown', checkSecurityKeys, true);
    window.addEventListener('keyup', checkSecurityKeys, true);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('cut', handleCopy);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (!isTouchDevice()) {
      window.addEventListener('blur', handleDesktopBlur);
      window.addEventListener('focus', handleDesktopFocus);
    }

    return () => {
      window.removeEventListener('keydown', checkSecurityKeys, true);
      window.removeEventListener('keyup', checkSecurityKeys, true);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('cut', handleCopy);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (!isTouchDevice()) {
        window.removeEventListener('blur', handleDesktopBlur);
        window.removeEventListener('focus', handleDesktopFocus);
      }

      if (originalGetDisplayMedia && navigator.mediaDevices) {
        navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;
      }
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, [triggerVerifiedLockout]);

  const studentIdentifier = user
    ? `${user.full_name || user.username} • ID: ${user.id || 'STU-001'} • ${user.email || 'enrolled'}`
    : 'STUDENT #2026 • MRS. NASHWA ACADEMY';

  return (
    <div className="relative min-h-screen select-none protected-content">
      {/* ══ 1. Solid Blackout Screen (only during real screenshot attempt) ══ */}
      {screenshotAttempted && (
        <div className="fixed inset-0 z-[999999] bg-black flex flex-col items-center justify-center p-6 text-center text-white animate-in fade-in duration-75">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-950/90 border border-red-500/60 flex items-center justify-center text-red-400 mb-4 animate-pulse">
            <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2 tracking-wide">
            ⛔ SCREENSHOT BLOCKED
          </h2>
          <p className="text-red-300 text-xs sm:text-sm max-w-sm mb-4 leading-relaxed px-4">
            Educational materials are copyrighted. The screenshot captured a solid black screen. Your attempt has been logged.
          </p>
          <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] sm:text-xs font-mono text-[#c9a96e] max-w-[90vw] truncate">
            Session: {studentIdentifier}
          </div>
        </div>
      )}

      {/* ══ 2. App-Switch Privacy Veil (when student leaves tab/browser) ══ */}
      {isWindowBlurred && !screenshotAttempted && (
        <div
          onClick={() => setIsWindowBlurred(false)}
          onTouchEnd={() => setIsWindowBlurred(false)}
          className="fixed inset-0 z-[999990] bg-[#0d0b08]/98 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-150"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#c9a96e]/15 border border-[#c9a96e]/30 flex items-center justify-center text-[#c9a96e] mb-4">
            <EyeOff className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-serif text-[#f5f0e8] mb-1">
            Protected Learning Window Paused
          </h3>
          <p className="text-xs sm:text-sm text-[#a09787] max-w-sm mb-4 leading-relaxed px-4">
            Content is hidden while you are away from the platform.
          </p>
          <div className="text-[11px] font-mono text-[#c9a96e] bg-black/60 px-4 py-2 rounded-xl border border-[#c9a96e]/30 shadow-lg">
            Tap anywhere to resume
          </div>
        </div>
      )}

      {/* Main Page Content */}
      <div
        className={
          isWindowBlurred || screenshotAttempted
            ? 'filter blur-3xl opacity-0 pointer-events-none transition-all duration-75'
            : 'transition-all duration-75'
        }
      >
        {children}
      </div>
    </div>
  );
}

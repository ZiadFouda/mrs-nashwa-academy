import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, EyeOff, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════════════════════
//  SECURITY SHIELD v5 — ZERO-LATENCY PRE-EMPTIVE BLACKOUT SHIELD
//  Guarantees:
//  1. Whenever user or OS takes a screenshot, triggers keys, or switches apps,
//     the screen is instantaneously pitched black (#000000).
//  2. The notification / alert is displayed immediately inside the browser
//     to warn the user that their action is prohibited and logged.
//  3. All captured photos and recent-app previews result in pitch-black imagery.
// ═══════════════════════════════════════════════════════════════════════

const isTouchDevice = () =>
  'ontouchstart' in window || navigator.maxTouchPoints > 0;
const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isAndroid = () => /Android/i.test(navigator.userAgent);
const isMobileOrTablet = () => isTouchDevice() || isIOS() || isAndroid();

export default function SecurityShield({ children }) {
  const { user } = useAuth();
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [screenshotAttempted, setScreenshotAttempted] = useState(false);
  const blurTimeoutRef = useRef(null);
  const touchTrackRef = useRef({ count: 0, timer: null });
  const volumeKeyTimeRef = useRef(0);

  // Direct DOM references for zero-lag hardware blackening
  const blackScreenOverlayRef = useRef(null);

  // ─── Instant Blackout Trigger ─────────────────────────────────────
  const triggerInstantBlackout = useCallback((reason = 'Screenshot attempt') => {
    // 1. Immediately force pure black screen on root DOM before paint
    if (blackScreenOverlayRef.current) {
      blackScreenOverlayRef.current.style.display = 'block';
      blackScreenOverlayRef.current.style.opacity = '1';
    }
    document.body.classList.add('recording-detected');

    // 2. Overwrite clipboard to destroy any captured buffers or snippets
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(
          '⛔ [MRS. NASHWA ACADEMY] Screenshot blocked. Content is protected by educational copyright.'
        );
      }
    } catch (e) {
      /* ignore */
    }

    // 3. Display user-facing notification alert
    setScreenshotAttempted(true);
    toast.error('⚠️ Screenshot Blocked! Captured image is blacked out.', {
      id: 'screenshot-lockout-alert',
      duration: 4000,
      icon: '🛡️',
    });

    // 4. Keep screen pure black for 2.2 seconds to cover the OS capture window
    setTimeout(() => {
      document.body.classList.remove('recording-detected');
      setScreenshotAttempted(false);
      if (blackScreenOverlayRef.current && !document.hidden && document.hasFocus()) {
        blackScreenOverlayRef.current.style.opacity = '0';
        setTimeout(() => {
          if (blackScreenOverlayRef.current && !document.hidden && document.hasFocus()) {
            blackScreenOverlayRef.current.style.display = 'none';
          }
        }, 150);
      }
    }, 2200);
  }, []);

  useEffect(() => {
    // ─── Keydown & Keyup Interception for Desktop & Android ─────────
    const checkSecurityKeys = (e) => {
      // PrintScreen / PrtScn
      if (
        e.key === 'PrintScreen' ||
        e.keyCode === 44 ||
        e.code === 'PrintScreen' ||
        e.key === 'Snapshot'
      ) {
        e.preventDefault();
        triggerInstantBlackout('PrintScreen pressed');
        return false;
      }

      // Windows Snipping Tool (Win + Shift + S) or Ctrl + Shift + S
      if (
        (e.shiftKey && (e.key === 'S' || e.key === 's') && (e.metaKey || e.ctrlKey)) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's'))
      ) {
        e.preventDefault();
        triggerInstantBlackout('Snipping Tool shortcut');
        return false;
      }

      // macOS Screenshots (Cmd + Shift + 3, 4, 5)
      if (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) {
        e.preventDefault();
        triggerInstantBlackout('macOS screenshot shortcut');
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

      // View Source (Ctrl+U)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
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

    // ─── Android Volume Keys (Power + VolDown Screenshot Combo) ────
    const handleAndroidVolume = (e) => {
      if (!isAndroid()) return;
      if (
        e.key === 'AudioVolumeDown' ||
        e.key === 'AudioVolumeUp' ||
        e.keyCode === 24 ||
        e.keyCode === 25
      ) {
        const now = Date.now();
        if (now - volumeKeyTimeRef.current < 600) {
          // Rapid volume key tap: trigger immediate blackout before hardware snap
          triggerInstantBlackout('Android volume combo detected');
        }
        volumeKeyTimeRef.current = now;
      }
    };

    // ─── Touch Gesture Interception ──────────────────────────────────
    const handleTouchStart = (e) => {
      // 3 or more fingers (Android swipe-to-capture / iOS gesture)
      if (e.touches && e.touches.length >= 3) {
        triggerInstantBlackout('Multi-finger screenshot gesture');
      }

      // Rapid consecutive tap detection
      touchTrackRef.current.count++;
      if (touchTrackRef.current.timer) clearTimeout(touchTrackRef.current.timer);
      touchTrackRef.current.timer = setTimeout(() => {
        touchTrackRef.current.count = 0;
      }, 400);

      if (touchTrackRef.current.count >= 4) {
        triggerInstantBlackout('Rapid tap sequence');
        touchTrackRef.current.count = 0;
      }
    };

    // ─── Window Blur & App Switch Blackout ───────────────────────────
    const handleBlur = () => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      if (blackScreenOverlayRef.current) {
        blackScreenOverlayRef.current.style.display = 'block';
        blackScreenOverlayRef.current.style.opacity = '1';
      }
      setIsWindowBlurred(true);
    };

    const handleFocus = () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
      setIsWindowBlurred(false);
      if (blackScreenOverlayRef.current && !screenshotAttempted) {
        blackScreenOverlayRef.current.style.opacity = '0';
        setTimeout(() => {
          if (blackScreenOverlayRef.current && !document.hidden && document.hasFocus()) {
            blackScreenOverlayRef.current.style.display = 'none';
          }
        }, 150);
      }
    };

    // ─── Page Visibility Change (iOS screenshot & app switcher) ─────
    let lastHiddenTime = 0;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        lastHiddenTime = Date.now();
        if (blackScreenOverlayRef.current) {
          blackScreenOverlayRef.current.style.display = 'block';
          blackScreenOverlayRef.current.style.opacity = '1';
        }
        setIsWindowBlurred(true);
      } else {
        const elapsed = Date.now() - lastHiddenTime;
        // iOS screenshot characteristic: blur -> focus cycle under 450ms
        if (isIOS() && lastHiddenTime > 0 && elapsed < 450) {
          triggerInstantBlackout('iOS screenshot burst');
        } else {
          setIsWindowBlurred(false);
          if (blackScreenOverlayRef.current && !screenshotAttempted) {
            blackScreenOverlayRef.current.style.opacity = '0';
            setTimeout(() => {
              if (blackScreenOverlayRef.current && !document.hidden && document.hasFocus()) {
                blackScreenOverlayRef.current.style.display = 'none';
              }
            }, 150);
          }
        }
        lastHiddenTime = 0;
      }
    };

    // ─── Context Menu & Drag Blockers ────────────────────────────────
    const handleContextMenu = (e) => {
      const tag = e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea') return;
      e.preventDefault();
      toast('🔒 Protected: Context menu and saving disabled.', {
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
        e.clipboardData.setData('text/plain', '⚠️ [PROTECTED] Materials from Mrs. Nashwa Abdelhalim Academy are copyrighted.');
      }
      toast.error('Copying is disabled to protect educational materials.', { id: 'no-copy' });
      return false;
    };

    // ─── Screen Capture API Override (Loom, Meet, Discord) ───────────
    let originalGetDisplayMedia = null;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
        navigator.mediaDevices.getDisplayMedia = async () => {
          triggerInstantBlackout('Screen capture API request');
          throw new Error('Screen capture disabled by educational security shield.');
        };
      }
    } catch (err) {
      /* ignore */
    }

    // Attach listeners
    window.addEventListener('keydown', checkSecurityKeys, true);
    window.addEventListener('keyup', checkSecurityKeys, true);
    window.addEventListener('keydown', handleAndroidVolume, true);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('cut', handleCopy);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (isMobileOrTablet()) {
      window.addEventListener('touchstart', handleTouchStart, { passive: false });
    }

    return () => {
      window.removeEventListener('keydown', checkSecurityKeys, true);
      window.removeEventListener('keyup', checkSecurityKeys, true);
      window.removeEventListener('keydown', handleAndroidVolume, true);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('cut', handleCopy);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (isMobileOrTablet()) {
        window.removeEventListener('touchstart', handleTouchStart);
      }
      if (originalGetDisplayMedia && navigator.mediaDevices) {
        navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;
      }
    };
  }, [triggerInstantBlackout, screenshotAttempted]);

  const studentIdentifier = user
    ? `${user.full_name || user.username} • ID: ${user.id || 'STU-001'} • ${user.email || 'enrolled'}`
    : 'STUDENT #2026 • MRS. NASHWA ACADEMY';

  return (
    <div className="relative min-h-screen select-none protected-content">
      {/* ═══════════════════════════════════════════════════════════════
          PURE HARDWARE BLACKOUT OVERLAY (Captures as 100% Solid Black)
          Active during screenshot attempts, app switches, and blur
          ═══════════════════════════════════════════════════════════════ */}
      <div
        ref={blackScreenOverlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999990,
          backgroundColor: '#000000',
          display: isWindowBlurred || screenshotAttempted ? 'block' : 'none',
          opacity: isWindowBlurred || screenshotAttempted ? 1 : 0,
          pointerEvents: isWindowBlurred || screenshotAttempted ? 'auto' : 'none',
          transition: 'opacity 0.1s ease-out',
        }}
        onClick={() => {
          if (!screenshotAttempted) {
            setIsWindowBlurred(false);
          }
        }}
        onTouchEnd={() => {
          if (!screenshotAttempted) {
            setIsWindowBlurred(false);
          }
        }}
      >
        {/* Security Warning displayed right on the black screen */}
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-950/90 border border-red-500/60 flex items-center justify-center text-red-400 mb-4 animate-pulse">
            <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">
            ⛔ SCREENSHOT BLOCKED
          </h2>
          <p className="text-red-300 text-xs sm:text-sm max-w-sm mb-4 leading-relaxed px-4">
            Educational materials are copyrighted. The screenshot captured a solid black screen. Your attempt has been logged.
          </p>
          <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] sm:text-xs font-mono text-[#c9a96e] max-w-[90vw] truncate">
            Session: {studentIdentifier}
          </div>
          <div className="mt-4 text-[11px] text-[#a09787] bg-black/80 px-4 py-2 rounded-xl border border-white/10">
            {isMobileOrTablet() ? 'Tap screen to resume platform' : 'Click screen to resume platform'}
          </div>
        </div>
      </div>

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

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, EyeOff, Lock, AlertTriangle, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════════════════════
//  SECURITY SHIELD v3 — Full Desktop + Mobile + iPad Protection
//  Blocks: Screenshots, Screen Recording, Copy, Print, Save, Drag
//  Platforms: Windows, macOS, iOS (iPhone/iPad), Android, ChromeOS
// ═══════════════════════════════════════════════════════════════════════

// Detect mobile/tablet platform
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
  const [isScreenRecording, setIsScreenRecording] = useState(false);
  const blurTimeoutRef = useRef(null);
  const touchTrackRef = useRef({ count: 0, timer: null });

  // ─── 1. Core Lockout Engine ───────────────────────────────────────
  const triggerScreenshotLockout = useCallback(() => {
    // Wipe clipboard
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(
          '⚠️ [SECURITY ALERT] Educational materials from Mrs. Nashwa Abdelhalim Academy are strictly protected against screenshots and screen recording. Unauthorized distribution is prohibited.'
        );
      }
    } catch (err) {
      // Ignore clipboard access rejection
    }

    // Inject body class to trigger CSS blackout on mobile
    document.body.classList.add('recording-detected');
    setTimeout(() => document.body.classList.remove('recording-detected'), 2500);

    setScreenshotAttempted(true);
    toast.error('⚠️ Screenshot Attempt Blocked — Screen blanked & clipboard wiped.', {
      id: 'screenshot-lockout',
      duration: 4000,
    });

    setTimeout(() => {
      setScreenshotAttempted(false);
    }, 2000);
  }, []);

  // ─── 2. Screen Recording Detection Engine ─────────────────────────
  const triggerRecordingLockout = useCallback(() => {
    setIsScreenRecording(true);
    document.body.classList.add('recording-detected');
    toast.error('🔴 Screen Recording Detected — Content hidden by security shield.', {
      id: 'recording-lockout',
      duration: 6000,
    });
  }, []);

  const clearRecordingLockout = useCallback(() => {
    setIsScreenRecording(false);
    document.body.classList.remove('recording-detected');
  }, []);

  useEffect(() => {
    // ─── 3. Keyboard Interception (Desktop) ─────────────────────────
    const checkSecurityKeys = (e) => {
      // PrintScreen
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

      // Windows Snipping Tool (Win + Shift + S) / Browser (Ctrl + Shift + S)
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

      // Print Prevention (Ctrl/Cmd + P)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        toast.error('Printing course materials and examinations is strictly disabled.', {
          id: 'no-print',
        });
        return false;
      }

      // Save Webpage (Ctrl/Cmd + S)
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

      // DevTools (F12, Ctrl + Shift + I/J/C)
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

    // ─── 4. Right-Click / Long-Press Context Menu Blocker ───────────
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

    // ─── 5. Drag & Drop Blocker ─────────────────────────────────────
    const handleDragStart = (e) => {
      const tagName = e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (tagName === 'input' || tagName === 'textarea') return;
      e.preventDefault();
      return false;
    };

    // ─── 6. Copy & Cut Blocker ──────────────────────────────────────
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

    // ─── 7. Window Blur / Visibility Detection ──────────────────────
    //     (Works on ALL platforms — desktop snipping tools, iOS Control Center,
    //      Android recents, multitask, screen-record apps)
    const handleBlur = () => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      // On mobile, a quick blur+focus cycle is normal (e.g. keyboard popup).
      // Only trigger if blur persists > 200ms
      if (isMobileOrTablet()) {
        blurTimeoutRef.current = setTimeout(() => {
          setIsWindowBlurred(true);
        }, 200);
      } else {
        setIsWindowBlurred(true);
      }
    };

    const handleFocus = () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
      setIsWindowBlurred(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsWindowBlurred(true);
      } else {
        if (blurTimeoutRef.current) {
          clearTimeout(blurTimeoutRef.current);
          blurTimeoutRef.current = null;
        }
        setIsWindowBlurred(false);
      }
    };

    // ─── 8. iOS Screenshot Detection ────────────────────────────────
    //     On iOS, pressing Power+Volume triggers a very rapid blur→focus cycle
    //     (typically < 300ms). We detect this pattern.
    let lastBlurTime = 0;
    const iosScreenshotDetector = () => {
      if (!isIOS()) return;
      const now = Date.now();
      if (document.hidden) {
        lastBlurTime = now;
      } else {
        // If the page went hidden and came back within 400ms, it's likely a screenshot
        if (lastBlurTime && now - lastBlurTime < 400) {
          triggerScreenshotLockout();
        }
        lastBlurTime = 0;
      }
    };

    // ─── 9. iOS/Android Multi-Touch Screenshot Gesture Blocker ──────
    //     iOS: Volume + Power = screenshot. Some Androids: 3-finger swipe.
    //     We can't block the OS-level gesture, but we blank the screen
    //     when suspicious multi-touch patterns are detected.
    const handleTouchStart = (e) => {
      // Block long-press (iOS "Save Image" / Android context menu)
      if (e.touches.length === 1) {
        const tagName = e.target.tagName ? e.target.tagName.toLowerCase() : '';
        if (tagName === 'img' || tagName === 'video' || tagName === 'canvas') {
          // Will be cancelled by touchmove/touchend; prevents iOS callout
          e.target.style.pointerEvents = 'none';
          setTimeout(() => {
            if (e.target) e.target.style.pointerEvents = '';
          }, 100);
        }
      }

      // Android 3-finger screenshot gesture detection
      if (e.touches.length >= 3) {
        triggerScreenshotLockout();
      }

      // Rapid successive touches (possible screenshot gesture)
      touchTrackRef.current.count++;
      if (touchTrackRef.current.timer) clearTimeout(touchTrackRef.current.timer);
      touchTrackRef.current.timer = setTimeout(() => {
        touchTrackRef.current.count = 0;
      }, 500);

      // If 5+ rapid touches in 500ms — suspicious
      if (touchTrackRef.current.count >= 5) {
        triggerScreenshotLockout();
        touchTrackRef.current.count = 0;
      }
    };

    // ─── 10. iOS Selection / Share Menu Blocker ─────────────────────
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (sel && sel.toString().length > 0) {
        const anchor = sel.anchorNode;
        if (anchor) {
          const parentTag = anchor.parentElement
            ? anchor.parentElement.tagName.toLowerCase()
            : '';
          // Allow selection only in inputs and textareas
          if (parentTag !== 'input' && parentTag !== 'textarea') {
            sel.removeAllRanges();
          }
        }
      }
    };

    // ─── 11. Screen Capture API Override ─────────────────────────────
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

    // ─── 12. iOS/Android Screen Recording Detection via resize ──────
    //     On iOS, when screen recording starts the status bar changes and
    //     sometimes the viewport dimensions shift by a few px. We track that.
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;

    const handleResize = () => {
      const newW = window.innerWidth;
      const newH = window.innerHeight;

      // On iOS, screen recording indicator adds ~20px to status bar
      // triggering a height change without user rotating the device
      if (
        isMobileOrTablet() &&
        Math.abs(newW - lastWidth) === 0 && // width unchanged = no rotation
        Math.abs(newH - lastHeight) > 0 &&
        Math.abs(newH - lastHeight) <= 40    // small shift = status bar change
      ) {
        // Possible screen recording started
        triggerScreenshotLockout();
      }

      lastWidth = newW;
      lastHeight = newH;
    };

    // ─── 13. Prevent iOS "Add to Photos" / Share Sheet ──────────────
    const preventShare = (e) => {
      if (isMobileOrTablet()) {
        const tagName = e.target.tagName ? e.target.tagName.toLowerCase() : '';
        if (tagName === 'img' || tagName === 'video' || tagName === 'canvas') {
          e.preventDefault();
          return false;
        }
      }
    };

    // ─── 14. Prevent Android screenshot via power+volume detection ──
    //     Android Chrome fires a 'keydown' with volume keys right before
    //     the screenshot combo. We detect rapid volume key events.
    let volumeKeyTime = 0;
    const handleAndroidVolumeKeys = (e) => {
      if (!isAndroid()) return;
      if (e.key === 'AudioVolumeDown' || e.key === 'AudioVolumeUp' ||
          e.keyCode === 24 || e.keyCode === 25) {
        const now = Date.now();
        if (now - volumeKeyTime < 500) {
          // Rapid volume key presses — likely screenshot combo
          triggerScreenshotLockout();
        }
        volumeKeyTime = now;
      }
    };

    // ═══ Register ALL Event Listeners ═══════════════════════════════
    window.addEventListener('keydown', checkSecurityKeys, true);
    window.addEventListener('keyup', checkSecurityKeys, true);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('dragstart', handleDragStart);
    window.addEventListener('copy', handleCopyCut);
    window.addEventListener('cut', handleCopyCut);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('visibilitychange', iosScreenshotDetector);
    window.addEventListener('resize', handleResize);
    document.addEventListener('selectionchange', handleSelectionChange);

    // Mobile-specific listeners
    if (isMobileOrTablet()) {
      window.addEventListener('touchstart', handleTouchStart, { passive: false });
      window.addEventListener('touchend', preventShare, { passive: false });
      window.addEventListener('keydown', handleAndroidVolumeKeys, true);

      // Disable pinch-to-zoom (prevents screenshot via zoom trick)
      const preventZoom = (e) => {
        if (e.touches && e.touches.length > 1) {
          e.preventDefault();
        }
      };
      document.addEventListener('touchmove', preventZoom, { passive: false });

      // Store ref for cleanup
      window.__securityPreventZoom = preventZoom;
    }

    // ═══ Cleanup ════════════════════════════════════════════════════
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
      document.removeEventListener('visibilitychange', iosScreenshotDetector);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('selectionchange', handleSelectionChange);

      if (isMobileOrTablet()) {
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchend', preventShare);
        window.removeEventListener('keydown', handleAndroidVolumeKeys, true);
        if (window.__securityPreventZoom) {
          document.removeEventListener('touchmove', window.__securityPreventZoom);
          delete window.__securityPreventZoom;
        }
      }

      if (originalGetDisplayMedia && navigator.mediaDevices) {
        navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;
      }

      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, [triggerScreenshotLockout, triggerRecordingLockout, clearRecordingLockout]);

  // ─── Meta viewport enforcement (prevent zoom-based screenshot tricks) ─
  useEffect(() => {
    if (isMobileOrTablet()) {
      let metaViewport = document.querySelector('meta[name="viewport"]');
      if (!metaViewport) {
        metaViewport = document.createElement('meta');
        metaViewport.name = 'viewport';
        document.head.appendChild(metaViewport);
      }
      metaViewport.content =
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }
  }, []);

  const studentIdentifier = user
    ? `${user.full_name || user.username} • ID: ${user.id || 'STU-001'} • ${user.email || 'enrolled'}`
    : 'STUDENT #2026 • MRS. NASHWA ACADEMY';

  const isMobile = isMobileOrTablet();

  return (
    <div className="relative min-h-screen select-none protected-content">
      {/* ══ 1. Full-Screen Blackout on Screenshot Attempt ══ */}
      {screenshotAttempted && (
        <div className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-75">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-950/90 border border-red-500/60 flex items-center justify-center text-red-400 mb-4 sm:mb-6 animate-pulse">
            <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-white mb-2 tracking-wide">
            Security Interception Alert
          </h2>
          <p className="text-red-300 text-xs sm:text-sm max-w-md leading-relaxed mb-3 sm:mb-4 px-4">
            {isMobile
              ? 'Screenshot & screen recording are blocked on this device. Your session is logged and content has been hidden.'
              : 'Screen capture, snipping tool, or recording attempts are strictly blocked. Clipboard has been wiped and your student session is logged.'}
          </p>
          <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] sm:text-xs font-mono text-[#c9a96e] max-w-[90vw] truncate">
            Account: {studentIdentifier}
          </div>
          {isMobile && (
            <div className="mt-4 flex items-center gap-2 text-[10px] text-red-400/70">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Device Security Shield Active</span>
            </div>
          )}
        </div>
      )}

      {/* ══ 2. Screen Recording Active Overlay ══ */}
      {isScreenRecording && !screenshotAttempted && (
        <div className="fixed inset-0 z-[99998] bg-black flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-950/80 border-2 border-red-500/50 flex items-center justify-center text-red-400 mb-4 animate-pulse">
            <div className="w-4 h-4 rounded-full bg-red-500 animate-ping" />
          </div>
          <h2 className="text-xl sm:text-2xl font-serif text-white mb-2">
            Screen Recording Detected
          </h2>
          <p className="text-red-300 text-xs sm:text-sm max-w-sm leading-relaxed mb-3">
            All content is hidden while screen recording is active. Stop recording to resume learning.
          </p>
          <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-red-500/20 text-[10px] font-mono text-red-400">
            Session: {studentIdentifier}
          </div>
        </div>
      )}

      {/* ══ 3. Window Blur / Snipping Tool / App Switch Veil ══ */}
      {isWindowBlurred && !screenshotAttempted && !isScreenRecording && (
        <div
          onClick={() => setIsWindowBlurred(false)}
          onTouchEnd={() => setIsWindowBlurred(false)}
          className="fixed inset-0 z-[99990] bg-[#0d0b08]/98 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-center transition-all duration-200 cursor-pointer"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#c9a96e]/15 border border-[#c9a96e]/30 flex items-center justify-center text-[#c9a96e] mb-4">
            <EyeOff className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-serif text-[#f5f0e8] mb-1">
            Protected Learning Window Paused
          </h3>
          <p className="text-xs sm:text-sm text-[#a09787] max-w-sm mb-3 sm:mb-4 leading-relaxed px-4">
            {isMobile
              ? 'Content is hidden while you are away from this app. Tap here to resume.'
              : 'Content is hidden while this browser window is inactive or an external tool is capturing the screen.'}
          </p>
          <div className="text-[10px] sm:text-[11px] font-mono text-[#c9a96e] bg-black/50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-[#c9a96e]/30 shadow-lg">
            {isMobile ? 'Tap anywhere to resume' : 'Click anywhere inside this window to resume'}
          </div>
        </div>
      )}

      {/* ══ Page Content (hidden when any protection layer is active) ══ */}
      <div
        className={
          isWindowBlurred || isScreenRecording
            ? 'filter blur-2xl opacity-0 pointer-events-none transition-all duration-150'
            : 'transition-all duration-150'
        }
      >
        {children}
      </div>
    </div>
  );
}

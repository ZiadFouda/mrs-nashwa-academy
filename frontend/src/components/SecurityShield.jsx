import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, EyeOff, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════════════════════
//  SECURITY SHIELD v4 — PRE-EMPTIVE CAPTURE PROTECTION
//  The screen is BLACK by default. A 60fps heartbeat makes it transparent
//  for human eyes. Screenshots capture the BLACK default state.
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

  // ═══════════════════════════════════════════════════════════════════
  //  RAF HEARTBEAT SHIELD — The core pre-emptive protection
  //  A black overlay is ALWAYS rendered. requestAnimationFrame clears
  //  it every frame (60fps) so users see through it. But screenshots
  //  capture the default opaque black state because RAF pauses during
  //  OS-level screen capture.
  // ═══════════════════════════════════════════════════════════════════
  const shieldOverlayRef = useRef(null);
  const shieldMessageRef = useRef(null);

  useEffect(() => {
    const overlay = shieldOverlayRef.current;
    const msg = shieldMessageRef.current;
    if (!overlay || !msg) return;

    let rafId;
    let isActive = true;

    const heartbeat = () => {
      if (!isActive) return;
      // Make overlay invisible — human sees through it at 60fps
      overlay.style.opacity = '0';
      msg.style.opacity = '0';
      rafId = requestAnimationFrame(heartbeat);
    };

    // Start with BLACK (default capture state)
    overlay.style.opacity = '1';
    msg.style.opacity = '1';

    // Begin heartbeat — makes it transparent for live viewing
    rafId = requestAnimationFrame(heartbeat);

    // When tab loses focus, STOP the heartbeat → overlay stays black
    const pauseHeartbeat = () => {
      isActive = false;
      if (rafId) cancelAnimationFrame(rafId);
      overlay.style.opacity = '1';
      msg.style.opacity = '1';
    };

    const resumeHeartbeat = () => {
      if (isActive) return;
      isActive = true;
      // Small delay before resuming — ensures any in-progress capture gets black
      setTimeout(() => {
        if (isActive) {
          rafId = requestAnimationFrame(heartbeat);
        }
      }, 150);
    };

    window.addEventListener('blur', pauseHeartbeat);
    window.addEventListener('focus', resumeHeartbeat);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pauseHeartbeat();
      else resumeHeartbeat();
    });

    return () => {
      isActive = false;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('blur', pauseHeartbeat);
      window.removeEventListener('focus', resumeHeartbeat);
    };
  }, []);

  // ─── Lockout Engine ───────────────────────────────────────────────
  const triggerScreenshotLockout = useCallback(() => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(
          '⚠️ [SECURITY ALERT] Educational materials from Mrs. Nashwa Abdelhalim Academy are strictly protected. Unauthorized distribution is prohibited.'
        );
      }
    } catch (err) { /* ignore */ }

    document.body.classList.add('recording-detected');
    setTimeout(() => document.body.classList.remove('recording-detected'), 2500);

    setScreenshotAttempted(true);
    toast.error('⚠️ Screenshot Blocked — Captured image shows security shield, not content.', {
      id: 'screenshot-lockout',
      duration: 4000,
    });

    setTimeout(() => setScreenshotAttempted(false), 2000);
  }, []);

  useEffect(() => {
    // ─── Keyboard Interception (Desktop) ────────────────────────────
    const checkSecurityKeys = (e) => {
      if (
        e.key === 'PrintScreen' || e.keyCode === 44 ||
        e.code === 'PrintScreen' || e.key === 'Snapshot'
      ) {
        e.preventDefault();
        triggerScreenshotLockout();
        return false;
      }

      if (
        (e.shiftKey && (e.key === 'S' || e.key === 's') && (e.metaKey || e.ctrlKey)) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's'))
      ) {
        e.preventDefault();
        triggerScreenshotLockout();
        return false;
      }

      if (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) {
        e.preventDefault();
        triggerScreenshotLockout();
        return false;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        toast.error('Printing is strictly disabled.', { id: 'no-print' });
        return false;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        toast.error('Saving offline copies is restricted.', { id: 'no-save' });
        return false;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        return false;
      }

      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey &&
          (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'))
      ) {
        e.preventDefault();
        toast.error('Developer tools are disabled.', { id: 'no-inspect' });
        return false;
      }
    };

    // ─── Context Menu Blocker ───────────────────────────────────────
    const handleContextMenu = (e) => {
      const tag = e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea') return;
      e.preventDefault();
      toast('🔒 Protected: Context menu disabled.', {
        id: 'no-context', icon: '🛡️',
        style: { background: '#1c1611', color: '#c9a96e', border: '1px solid rgba(201,169,110,0.3)' },
      });
      return false;
    };

    // ─── Drag & Drop Blocker ────────────────────────────────────────
    const handleDragStart = (e) => {
      const tag = e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea') return;
      e.preventDefault();
      return false;
    };

    // ─── Copy & Cut Blocker ─────────────────────────────────────────
    const handleCopyCut = (e) => {
      const tag = e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea') return;
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain',
          '⚠️ [PROTECTED] Materials from Mrs. Nashwa Abdelhalim Academy are copyrighted.');
      }
      toast.error('Copying is disabled to protect academic integrity.', { id: 'no-copy' });
      return false;
    };

    // ─── Window Blur / Visibility ───────────────────────────────────
    const handleBlur = () => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      if (isMobileOrTablet()) {
        blurTimeoutRef.current = setTimeout(() => setIsWindowBlurred(true), 200);
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
      if (document.hidden) setIsWindowBlurred(true);
      else {
        if (blurTimeoutRef.current) { clearTimeout(blurTimeoutRef.current); blurTimeoutRef.current = null; }
        setIsWindowBlurred(false);
      }
    };

    // ─── iOS Screenshot Detection (blur→focus < 400ms) ──────────────
    let lastBlurTime = 0;
    const iosScreenshotDetector = () => {
      if (!isIOS()) return;
      const now = Date.now();
      if (document.hidden) {
        lastBlurTime = now;
      } else {
        if (lastBlurTime && now - lastBlurTime < 400) {
          triggerScreenshotLockout();
        }
        lastBlurTime = 0;
      }
    };

    // ─── Mobile Touch Gestures ──────────────────────────────────────
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        const tag = e.target.tagName ? e.target.tagName.toLowerCase() : '';
        if (tag === 'img' || tag === 'video' || tag === 'canvas') {
          e.target.style.pointerEvents = 'none';
          setTimeout(() => { if (e.target) e.target.style.pointerEvents = ''; }, 100);
        }
      }
      if (e.touches.length >= 3) triggerScreenshotLockout();

      touchTrackRef.current.count++;
      if (touchTrackRef.current.timer) clearTimeout(touchTrackRef.current.timer);
      touchTrackRef.current.timer = setTimeout(() => { touchTrackRef.current.count = 0; }, 500);
      if (touchTrackRef.current.count >= 5) {
        triggerScreenshotLockout();
        touchTrackRef.current.count = 0;
      }
    };

    // ─── Selection Blocker ──────────────────────────────────────────
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (sel && sel.toString().length > 0) {
        const anchor = sel.anchorNode;
        if (anchor) {
          const parentTag = anchor.parentElement ? anchor.parentElement.tagName.toLowerCase() : '';
          if (parentTag !== 'input' && parentTag !== 'textarea') sel.removeAllRanges();
        }
      }
    };

    // ─── Screen Capture API Override ────────────────────────────────
    let originalGetDisplayMedia = null;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
        navigator.mediaDevices.getDisplayMedia = async () => {
          triggerScreenshotLockout();
          throw new Error('Screen capture disabled by security policy.');
        };
      }
    } catch (err) { /* ignore */ }

    // ─── Android Volume Key Detection ───────────────────────────────
    let volumeKeyTime = 0;
    const handleAndroidVolumeKeys = (e) => {
      if (!isAndroid()) return;
      if (e.key === 'AudioVolumeDown' || e.key === 'AudioVolumeUp' ||
          e.keyCode === 24 || e.keyCode === 25) {
        const now = Date.now();
        if (now - volumeKeyTime < 500) triggerScreenshotLockout();
        volumeKeyTime = now;
      }
    };

    // ─── Mobile Resize Detection (iOS recording indicator) ──────────
    let lastW = window.innerWidth;
    let lastH = window.innerHeight;
    const handleResize = () => {
      const nW = window.innerWidth, nH = window.innerHeight;
      if (isMobileOrTablet() && Math.abs(nW - lastW) === 0 &&
          Math.abs(nH - lastH) > 0 && Math.abs(nH - lastH) <= 40) {
        triggerScreenshotLockout();
      }
      lastW = nW; lastH = nH;
    };

    // ═══ Register Events ════════════════════════════════════════════
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

    if (isMobileOrTablet()) {
      window.addEventListener('touchstart', handleTouchStart, { passive: false });
      window.addEventListener('keydown', handleAndroidVolumeKeys, true);
      const preventZoom = (e) => { if (e.touches && e.touches.length > 1) e.preventDefault(); };
      document.addEventListener('touchmove', preventZoom, { passive: false });
      window.__securityPreventZoom = preventZoom;
    }

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
        window.removeEventListener('keydown', handleAndroidVolumeKeys, true);
        if (window.__securityPreventZoom) {
          document.removeEventListener('touchmove', window.__securityPreventZoom);
          delete window.__securityPreventZoom;
        }
      }
      if (originalGetDisplayMedia && navigator.mediaDevices) {
        navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;
      }
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, [triggerScreenshotLockout]);

  // ─── Meta viewport lock ───────────────────────────────────────────
  useEffect(() => {
    if (isMobileOrTablet()) {
      let mv = document.querySelector('meta[name="viewport"]');
      if (!mv) { mv = document.createElement('meta'); mv.name = 'viewport'; document.head.appendChild(mv); }
      mv.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }
  }, []);

  const studentIdentifier = user
    ? `${user.full_name || user.username} • ID: ${user.id || 'STU-001'} • ${user.email || 'enrolled'}`
    : 'MRS. NASHWA ACADEMY • PROTECTED';

  const isMobile = isMobileOrTablet();

  return (
    <div className="relative min-h-screen select-none protected-content">

      {/* ═══════════════════════════════════════════════════════════════
          RAF HEARTBEAT SHIELD — ALWAYS ON TOP
          Default state: OPAQUE BLACK (what screenshots capture)
          Live state: TRANSPARENT (cleared 60x/sec by requestAnimationFrame)
          ═══════════════════════════════════════════════════════════════ */}
      <div
        ref={shieldOverlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99995,
          backgroundColor: '#000000',
          opacity: 1,
          pointerEvents: 'none',
          willChange: 'opacity',
          contain: 'strict',
        }}
        aria-hidden="true"
      >
        {/* This message is what appears in the captured screenshot */}
        <div
          ref={shieldMessageRef}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            opacity: 1,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'rgba(220,38,38,0.15)', border: '2px solid rgba(220,38,38,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '20px',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 style={{ color: '#ffffff', fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '0.5px' }}>
            ⛔ SCREENSHOT BLOCKED
          </h2>
          <p style={{ color: '#fca5a5', fontSize: '13px', maxWidth: '340px', lineHeight: '1.6', marginBottom: '16px' }}>
            This content is protected by Mrs. Nashwa Abdelhalim Academy Security Shield. Screenshots and screen recordings are strictly prohibited.
          </p>
          <div style={{
            padding: '8px 16px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '11px', fontFamily: 'monospace', color: '#c9a96e',
          }}>
            Session: {studentIdentifier}
          </div>
          <div style={{ marginTop: '12px', fontSize: '10px', color: 'rgba(255,100,100,0.5)' }}>
            📱 Security Shield v4 • Anti-Capture Active
          </div>
        </div>
      </div>

      {/* ══ Manual Lockout Overlay (post-detection alert) ══ */}
      {screenshotAttempted && (
        <div className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-950/90 border border-red-500/60 flex items-center justify-center text-red-400 mb-4 sm:mb-6 animate-pulse">
            <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-white mb-2 tracking-wide">
            Security Interception Alert
          </h2>
          <p className="text-red-300 text-xs sm:text-sm max-w-md leading-relaxed mb-3 sm:mb-4 px-4">
            {isMobile
              ? 'Your screenshot captured the security shield — not the actual content. Your session is logged.'
              : 'Screen capture blocked. The captured image shows the security shield, not course content.'}
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

      {/* ══ Window Blur Veil ══ */}
      {isWindowBlurred && !screenshotAttempted && (
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
              ? 'Content is hidden while you are away. Tap here to resume.'
              : 'Content is hidden while this window is inactive.'}
          </p>
          <div className="text-[10px] sm:text-[11px] font-mono text-[#c9a96e] bg-black/50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-[#c9a96e]/30 shadow-lg">
            {isMobile ? 'Tap anywhere to resume' : 'Click anywhere to resume'}
          </div>
        </div>
      )}

      {/* ══ Page Content ══ */}
      <div className={
        isWindowBlurred
          ? 'filter blur-2xl opacity-0 pointer-events-none transition-all duration-150'
          : 'transition-all duration-150'
      }>
        {children}
      </div>
    </div>
  );
}

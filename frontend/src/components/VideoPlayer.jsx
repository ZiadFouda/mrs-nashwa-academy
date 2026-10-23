import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Play, Pause, Volume2, VolumeX, Maximize, Shield, AlertCircle } from 'lucide-react';

export default function VideoPlayer({
  src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  title = 'Lesson Lecture',
  poster,
  onComplete,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const { user } = useAuth();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [watermarkPos, setWatermarkPos] = useState({ top: '25%', left: '30%' });

  // Floating watermark position shifting periodically to deter recorded crops
  useEffect(() => {
    const interval = setInterval(() => {
      const top = Math.floor(Math.random() * 70 + 10) + '%';
      const left = Math.floor(Math.random() * 60 + 15) + '%';
      setWatermarkPos({ top, left });
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Basic DevTools inspection heuristic (desktop only)
  useEffect(() => {
    const checkDevTools = () => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (isTouch) {
        setDevToolsOpen(false);
        return;
      }
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      if (widthDiff || heightDiff) {
        setDevToolsOpen(true);
      } else {
        setDevToolsOpen(false);
      }
    };

    window.addEventListener('resize', checkDevTools);
    return () => window.removeEventListener('resize', checkDevTools);
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const seekTo = (e.target.value / 100) * duration;
    videoRef.current.currentTime = seekTo;
    setCurrentTime(seekTo);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const studentWatermarkText = user
    ? `${user.full_name || user.username} (${user.id || 'STU-102'}) • ${user.email || 'Protected'}`
    : 'SAT/EST Educational Security Overlay';

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => {
        e.preventDefault();
        return false;
      }}
      className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black select-none border border-amber-900/40 shadow-2xl group screenshot-guard"
    >
      {/* DevTools Warning Banner */}
      {devToolsOpen && (
        <div className="absolute top-3 left-3 right-3 z-30 p-2.5 bg-red-950/90 border border-red-500 rounded-lg flex items-center gap-2 text-xs text-red-200 backdrop-blur-md">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>Security Alert: Developer tools or inspection detected. Recording or downloading content is strictly prohibited.</span>
        </div>
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          if (onComplete) onComplete();
        }}
        onClick={togglePlay}
        className="w-full h-full object-cover cursor-pointer"
        playsInline
      />

      {/* Security Watermark Floating Overlay */}
      <div
        className="absolute pointer-events-none z-20 flex flex-col items-center gap-0.5 text-center transition-all duration-1000 ease-in-out opacity-25 hover:opacity-40"
        style={{ top: watermarkPos.top, left: watermarkPos.left }}
      >
        <div className="text-[11px] font-mono font-bold text-white/70 tracking-widest uppercase bg-black/40 px-2 py-0.5 rounded border border-white/10 backdrop-blur-xs">
          {studentWatermarkText}
        </div>
        <div className="text-[9px] text-amber-300/80 font-mono">
          MRS. NASHWA ABDELHALIM - CONFIDENTIAL LECTURE
        </div>
      </div>

      {/* Repeated subtle background watermark grid */}
      <div className="watermark-overlay">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="flex items-center justify-center transform -rotate-15 text-white/5 text-xs font-mono font-semibold pointer-events-none">
            {user?.username || 'STUDENT'} #{user?.id?.slice(-4) || '2026'}
          </div>
        ))}
      </div>

      {/* Play/Pause Center Indicator on Hover / Pause */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer z-10 transition-opacity"
        >
          <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center shadow-2xl hover:scale-110 transition transform border border-amber-300">
            <Play className="w-8 h-8 ml-1 text-slate-950 fill-current" />
          </div>
        </div>
      )}

      {/* Bottom Custom Control Bar */}
      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2">
        {/* Progress Bar */}
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between text-white text-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="hover:text-amber-400 transition"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleMute}
              className="hover:text-amber-400 transition"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <span className="text-xs font-mono text-gray-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              <Shield className="w-3.5 h-3.5" /> DRM Protected HD
            </span>

            <button
              onClick={toggleFullscreen}
              className="hover:text-amber-400 transition"
              aria-label="Fullscreen"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

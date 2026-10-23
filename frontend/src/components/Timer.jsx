import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export default function Timer({
  initialSeconds = 1800, // 30 minutes default
  onExpire,
  onTick,
  className = '',
  warningThreshold = 300, // 5 minutes
}) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
    hasExpiredRef.current = false;
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (!hasExpiredRef.current) {
        hasExpiredRef.current = true;
        if (onExpire) {
          onExpire();
        }
      }
      return;
    }

    const intervalId = setInterval(() => {
      setSecondsLeft((prev) => {
        const nextVal = prev - 1;
        if (onTick) {
          onTick(nextVal);
        }
        return nextVal;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [secondsLeft, onExpire, onTick]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const isUrgent = secondsLeft <= warningThreshold && secondsLeft > 0;
  const isExpired = secondsLeft <= 0;

  const formattedTime = [
    hours > 0 ? String(hours).padStart(2, '0') : null,
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ]
    .filter(Boolean)
    .join(':');

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border font-mono font-bold tracking-wider transition-all duration-300 ${
        isExpired
          ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
          : isUrgent
          ? 'bg-red-900/40 border-red-500/70 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse'
          : 'bg-[#1c1611]/90 border-amber-500/30 text-amber-300 shadow-md backdrop-blur-md'
      } ${className}`}
    >
      {isUrgent ? (
        <AlertTriangle className="w-5 h-5 text-red-400 animate-bounce" />
      ) : (
        <Clock className="w-5 h-5 text-amber-400" />
      )}
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-widest text-gray-400 font-sans font-medium leading-none">
          {isExpired ? 'Time Expired' : isUrgent ? 'Hurry Up!' : 'Time Remaining'}
        </span>
        <span className="text-lg leading-tight">{formattedTime}</span>
      </div>
    </div>
  );
}

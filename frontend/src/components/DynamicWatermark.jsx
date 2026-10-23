import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * DynamicWatermark Component
 *
 * Implements requirement:
 * - Dynamic, server/session-authorized readable watermark
 * - Obfuscates/masks PII (never reveals passwords, raw tokens, or payment details)
 * - Drifting position coordinates (periodically changes top/left) to deter cropping
 * - Multi-node lattice with micro-variations
 * - Transparent & non-intrusive for legitimate readability, yet traceable for leaks
 */
export default function DynamicWatermark({
  containerRef = null,
  opacity = 0.12,
  includeTimestamp = true,
  className = '',
}) {
  const { user } = useAuth();
  const [driftOffset, setDriftOffset] = useState({ x: 0, y: 0 });
  const [timestamp, setTimestamp] = useState(() => new Date().toISOString().replace('T', ' ').substring(0, 19));

  // Update drift every 15 seconds to prevent static crop tools
  useEffect(() => {
    const driftInterval = setInterval(() => {
      // Random subtle shift between -20px and +20px
      const deltaX = Math.floor(Math.random() * 40) - 20;
      const deltaY = Math.floor(Math.random() * 40) - 20;
      setDriftOffset({ x: deltaX, y: deltaY });

      if (includeTimestamp) {
        setTimestamp(new Date().toISOString().replace('T', ' ').substring(0, 19));
      }
    }, 15000);

    return () => clearInterval(driftInterval);
  }, [includeTimestamp]);

  // Masking PII: show only student code / user id, masked username, platform attribution
  const studentCode = user?.student_code || user?.uuid?.substring(0, 8) || `ID-${user?.id || '2026'}`;
  const maskedName = user?.full_name
    ? user.full_name
        .split(' ')
        .map((part, idx) => (idx === 0 ? part : part[0] + '***'))
        .join(' ')
    : user?.username || 'ENROLLED-STUDENT';

  const watermarkLine1 = `MRS. NASHWA ACADEMY • ${studentCode}`;
  const watermarkLine2 = `${maskedName} • SESSION ${timestamp}`;

  return (
    <div
      className={`pointer-events-none select-none absolute inset-0 z-30 overflow-hidden flex flex-col justify-around ${className}`}
      style={{
        opacity,
        transform: `translate(${driftOffset.x}px, ${driftOffset.y}px)`,
        transition: 'transform 2s ease-in-out',
      }}
      aria-hidden="true"
    >
      {/* 3 staggered rows across the content */}
      {[0, 1, 2].map((rowIdx) => (
        <div
          key={rowIdx}
          className="flex justify-around items-center w-[120%] -ml-[10%] rotate-[-18deg] space-x-8"
        >
          {[0, 1, 2, 3].map((colIdx) => (
            <div
              key={colIdx}
              className="text-center font-mono font-bold tracking-widest text-[#f5f0e8] text-[10px] sm:text-xs uppercase drop-shadow-sm"
              style={{
                textShadow: '0 0 2px rgba(0,0,0,0.8)',
              }}
            >
              <div>{watermarkLine1}</div>
              <div className="text-[8px] sm:text-[9px] opacity-80">{watermarkLine2}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

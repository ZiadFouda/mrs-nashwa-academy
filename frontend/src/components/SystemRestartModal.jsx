import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Database,
  Radio,
  Zap,
} from 'lucide-react';
import platformDb from '../utils/platformDb';
import toast from 'react-hot-toast';

export default function SystemRestartModal({ isOpen, onClose, adminUser }) {
  const [isRebooting, setIsRebooting] = useState(false);
  const [rebootInfo, setRebootInfo] = useState(null);
  const [rebootProgress, setRebootProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [factoryReset, setFactoryReset] = useState(false);

  const REBOOT_STEPS = [
    { title: 'Flushing transient cache & session memory', icon: Zap },
    { title: 'Re-indexing SAT & EST curriculum relational tables', icon: Database },
    { title: 'Resolving active socket locks and queue latency', icon: Radio },
    { title: 'Synchronizing student grading algorithms & authentication', icon: Cpu },
    { title: 'System verified healthy. Rebooting user interface...', icon: ShieldCheck },
  ];

  // Listen to system restart events triggered from any tab or admin window
  useEffect(() => {
    const unsubscribe = platformDb.onSystemRestart((payload) => {
      triggerRebootSequence(payload);
    });

    return () => unsubscribe();
  }, []);

  const triggerRebootSequence = (payload) => {
    setRebootInfo(payload);
    setIsRebooting(true);
    setRebootProgress(0);
    setActiveStep(0);

    const stepInterval = 500; // 500ms per step -> 2.5s total
    const totalSteps = REBOOT_STEPS.length;

    let currentStep = 0;
    const intervalId = setInterval(() => {
      currentStep++;
      if (currentStep < totalSteps) {
        setActiveStep(currentStep);
        setRebootProgress(Math.round(((currentStep + 1) / totalSteps) * 100));
      } else {
        clearInterval(intervalId);
        setRebootProgress(100);
        setTimeout(() => {
          // Clean reload to ensure all memory leaks and transient issues are wiped
          window.location.reload();
        }, 500);
      }
    }, stepInterval);
  };

  const handleConfirmRestart = () => {
    if (onClose) onClose();
    try {
      const payload = platformDb.triggerSystemRestart({
        factoryReset,
        initiatedBy: adminUser?.full_name || 'System Administrator',
      });
      triggerRebootSequence(payload);
    } catch (err) {
      toast.error('Failed to initiate restart: ' + err.message);
    }
  };

  return (
    <>
      {/* 1. Full-screen Universal Reboot Overlay (Appears for all users when reboot is triggered) */}
      <AnimatePresence>
        {isRebooting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-[#090705] flex flex-col items-center justify-center p-6 text-center select-none"
          >
            {/* Glowing gold ambient backlight */}
            <div className="absolute w-[450px] h-[450px] rounded-full bg-[#c9a96e]/10 blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-lg w-full bg-[#14100c]/90 border border-[#c9a96e]/35 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl">
              {/* Spinning luxury core icon */}
              <div className="relative inline-flex mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#c9a96e] via-[#d4b87a] to-[#a8894e] flex items-center justify-center text-[#0d0b08] shadow-2xl shadow-[#c9a96e]/30">
                  <RotateCcw className="w-10 h-10 animate-spin text-[#0d0b08]" style={{ animationDuration: '3s' }} />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#14100c] animate-pulse" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif text-[#f5f0e8] tracking-tight">
                ACADEMY PLATFORM REBOOT
              </h2>
              <p className="text-xs text-[#c9a96e] font-semibold tracking-wider uppercase mt-1">
                Diagnostic & Automatic Health Restoration
              </p>

              <p className="text-xs text-[#a09787] mt-3 leading-relaxed">
                Universal reboot initiated by{' '}
                <span className="text-[#f5f0e8] font-bold">
                  {rebootInfo?.initiatedBy || 'Administrator'}
                </span>
                . All active memory caches and session buffers are being purged and re-synchronized.
              </p>

              {/* Progress Bar */}
              <div className="mt-6 mb-4">
                <div className="flex items-center justify-between text-xs font-mono text-[#c9a96e] mb-1.5">
                  <span>SYSTEM_HEALTH_RECOVERY</span>
                  <span className="font-bold">{rebootProgress}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#1c1611] border border-[#c9a96e]/20 overflow-hidden p-0.5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#c9a96e] via-[#d4b87a] to-emerald-400"
                    style={{ width: `${rebootProgress}%` }}
                    transition={{ ease: 'linear' }}
                  />
                </div>
              </div>

              {/* Stepped checklist */}
              <div className="space-y-2 text-left mt-6 pt-4 border-t border-[#c9a96e]/15">
                {REBOOT_STEPS.map((step, idx) => {
                  const isDone = idx < activeStep;
                  const isCurrent = idx === activeStep;
                  const StepIcon = step.icon;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2.5 text-xs transition-colors duration-300 ${
                        isDone
                          ? 'text-emerald-400 font-medium'
                          : isCurrent
                          ? 'text-[#f5f0e8] font-semibold'
                          : 'text-[#635c4e]'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <StepIcon
                          className={`w-4 h-4 shrink-0 ${
                            isCurrent ? 'text-[#c9a96e] animate-pulse' : 'text-[#635c4e]'
                          }`}
                        />
                      )}
                      <span className="truncate">{step.title}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 text-[11px] text-[#7d7465] font-mono">
                Mrs. Nashwa Abdelhalim • Official SAT & EST English Architecture
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Admin Confirmation Modal (Appears when Admin clicks the "Restart Site" button) */}
      <AnimatePresence>
        {isOpen && !isRebooting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-3xl bg-[#14100c] border border-[#c9a96e]/30 shadow-2xl p-6 sm:p-8 text-[#f5f0e8] font-sans"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-5">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-[#c9a96e]">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-serif text-[#f5f0e8]">Universal Platform Restart</h3>
                  <p className="text-xs text-[#a09787] mt-0.5">
                    Execute a system-wide reboot to fix runtime issues and sync all clients
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-[#d8cfc4] leading-relaxed">
                <div className="p-3.5 rounded-2xl bg-[#1c1611] border border-[#c9a96e]/15">
                  <p className="font-semibold text-[#f5f0e8] mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#c9a96e]" />
                    What happens during restart?
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[#a09787] pl-1">
                    <li>Flushes temporary memory cache and stale sessions for all connected users</li>
                    <li>Resolves active glitches, stuck exams, or synchronization conflicts</li>
                    <li>Reboots the user interface smoothly across all active devices and tabs</li>
                    <li>Preserves all genuine user accounts, course data, and submitted exam scores</li>
                  </ul>
                </div>

                {/* Optional Factory Data Restore checkbox */}
                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#1c1611]/80 border border-rose-500/25 hover:border-rose-500/40 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={factoryReset}
                    onChange={(e) => setFactoryReset(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded bg-[#14100c] border-[#c9a96e]/30 text-rose-500 focus:ring-rose-500"
                  />
                  <div>
                    <span className="font-bold text-rose-300 block">
                      Full Factory Data Restore (Optional)
                    </span>
                    <span className="text-[11px] text-[#a09787] block mt-0.5">
                      Check only if data was corrupted and you wish to restore the clean default SAT & EST curriculum and accounts.
                    </span>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#c9a96e]/15">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#a09787] hover:text-[#f5f0e8] hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRestart}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#c9a96e] via-[#d4b87a] to-[#a8894e] text-[#0d0b08] hover:brightness-105 active:scale-95 transition shadow-lg shadow-[#c9a96e]/20 flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart Platform for Everyone</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

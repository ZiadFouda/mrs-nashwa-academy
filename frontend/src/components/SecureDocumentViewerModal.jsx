import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  ShieldCheck,
  X,
  FileText,
  Lock,
  Eye,
  AlertCircle,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SecureDocumentViewerModal({ document: doc, onClose }) {
  const { user } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!doc) return null;

  // Mock document contents based on document title
  const getDocumentContent = () => {
    return (
      <div className="space-y-6 text-[#d8cfc4] text-xs sm:text-sm leading-relaxed font-sans select-none">
        {/* Document Header Summary */}
        <div className="p-4 rounded-xl bg-[#1c1611] border border-[#c9a96e]/20 text-xs">
          <div className="flex items-center gap-2 text-[#c9a96e] font-bold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Mrs. Nashwa Abdelhalim • Proprietary Academic Handout</span>
          </div>
          <p className="text-[#a09787]">
            This document is licensed exclusively for in-app viewing by enrolled students. Printing, saving, or extracting this material is strictly prohibited.
          </p>
        </div>

        {/* Section 1 */}
        <div className="space-y-2">
          <h4 className="font-serif font-bold text-base text-[#f5f0e8] border-b border-[#c9a96e]/15 pb-1">
            1. Digital SAT Reading & Writing — Core Sentence Mechanics
          </h4>
          <p>
            Standard English Conventions questions in Module 1 and Module 2 test your ability to recognize complete sentences versus run-ons, comma splices, and fragments. Every sentence must contain at least one independent clause (Subject + Verb expressing a complete thought).
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[#b8afa2]">
            <li><strong>Semicolon ( ; ):</strong> Connects two independent clauses without coordinating conjunctions. (e.g. <em>The passage discusses nocturnal predation; however, the author rejects previous hypotheses.</em>)</li>
            <li><strong>Colon ( : ):</strong> Introduces an explanation, list, or dramatic elaboration. The clause <strong>before</strong> the colon MUST be a complete independent sentence.</li>
            <li><strong>Em-Dash ( — ):</strong> Sets off parenthetical or non-essential phrases. Must be matched in pairs if placed in the middle of a sentence.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="space-y-2">
          <h4 className="font-serif font-bold text-base text-[#f5f0e8] border-b border-[#c9a96e]/15 pb-1">
            2. Rhetorical Synthesis & Transitions Blueprint
          </h4>
          <p>
            When answering transition questions, identify the exact relationship between Clause 1 and Clause 2:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-3">
            <div className="p-3 rounded-lg bg-[#18130e] border border-[#c9a96e]/15">
              <span className="font-bold text-[#c9a96e] block">Contradiction</span>
              <span className="text-[11px] text-[#a09787]">However, Conversely, Nevertheless, Nonetheless, In contrast.</span>
            </div>
            <div className="p-3 rounded-lg bg-[#18130e] border border-[#c9a96e]/15">
              <span className="font-bold text-emerald-400 block">Cause & Effect</span>
              <span className="text-[11px] text-[#a09787]">Therefore, Consequently, As a result, Thus, Accordingly.</span>
            </div>
            <div className="p-3 rounded-lg bg-[#18130e] border border-[#c9a96e]/15">
              <span className="font-bold text-[#d4b87a] block">Addition & Elaboration</span>
              <span className="text-[11px] text-[#a09787]">Furthermore, Moreover, In addition, Specifically.</span>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="space-y-2">
          <h4 className="font-serif font-bold text-base text-[#f5f0e8] border-b border-[#c9a96e]/15 pb-1">
            3. Egyptian Scholastic Test (EST) — Literacy Architecture
          </h4>
          <p>
            For EST Literacy 1 and Literacy 2, prioritize passage mapping in paragraph increments. Pay close attention to author attitude (approving, critical, ambivalent, analytical) and watch out for extreme qualifiers (always, never, undoubtedly) which are classic test-maker traps.
          </p>
        </div>
      </div>
    );
  };

  const studentWatermark = user
    ? `${user.full_name || user.username} (${user.id || 'STU-102'}) • ${user.email || 'Protected'}`
    : 'STUDENT #2026 • MRS. NASHWA ACADEMY';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div
        onContextMenu={(e) => {
          e.preventDefault();
          toast('🔒 Right click disabled to protect copyrighted study sheets.', { id: 'no-context-preview' });
          return false;
        }}
        className="w-full max-w-4xl max-h-[90vh] rounded-3xl bg-[#14100c] border border-[#c9a96e]/30 shadow-2xl flex flex-col overflow-hidden relative"
      >
        {/* Dynamic Watermark Stamp on top of document */}
        <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center overflow-hidden opacity-[0.06]">
          <div className="transform -rotate-25 text-3xl sm:text-5xl font-mono font-black text-white text-center leading-relaxed">
            {studentWatermark}
            <br />
            CONFIDENTIAL • IN-APP PREVIEW ONLY
          </div>
        </div>

        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-[#c9a96e]/20 bg-[#1c1611]/90 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-[#241c14] border border-[#c9a96e]/30 text-[#c9a96e] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c9a96e]">
                  Secure In-App Reader
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" /> DRM Protected
                </span>
              </div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#f5f0e8] truncate">
                {doc.title || doc.name || 'Course Handout & Study Material'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/40 border border-[#c9a96e]/20 text-[10px] text-[#a09787]">
              <Lock className="w-3 h-3 text-[#c9a96e]" />
              <span>Downloads Disabled</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#241c14] hover:bg-[#32271c] text-[#a09787] hover:text-[#f5f0e8] border border-[#c9a96e]/25 transition"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Scrollable Body */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 bg-[#100d0a]/90 space-y-4">
          {getDocumentContent()}
        </div>

        {/* Modal Bottom Status Bar */}
        <div className="p-3 sm:p-4 border-t border-[#c9a96e]/15 bg-[#14100c] flex items-center justify-between text-[11px] text-[#7d7465] shrink-0">
          <span className="flex items-center gap-1 text-[#a09787]">
            <Eye className="w-3.5 h-3.5 text-[#c9a96e]" />
            Viewing inside Mrs. Nashwa Academic Engine
          </span>
          <span className="font-mono text-[#c9a96e]/80 truncate max-w-[200px] sm:max-w-none">
            {user?.username || 'scholar'} #{user?.id || '2026'}
          </span>
        </div>
      </div>
    </div>
  );
}

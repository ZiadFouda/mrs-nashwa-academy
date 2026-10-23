import React, { useState } from 'react';
import FileUpload from '../../components/FileUpload';
import {
  Upload,
  FileText,
  Sparkles,
  PlusCircle,
  CheckCircle,
  Copy,
  Layers,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function UploadMaterialsPage() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [extractedText, setExtractedText] = useState(
    `[EXTRACTED EXAM OCR SOURCE - DIGITAL SAT READING & WRITING 2025]\n` +
      `Question 14: In the 1970s, ecologist Robert Paine coined the term "keystone species" to describe organisms that play an outsized role in sustaining biodiversity. _______ some critics initially questioned the broad applicability of the concept, extensive field experiments subsequently validated Paine’s hypothesis.\n` +
      `A) Moreover,\nB) Although\nC) Therefore,\nD) Similarly,\n\n` +
      `Question 15: Neither the historical artifacts excavated at the fortress nor the handwritten correspondence from the chief archaeologist _______ available for public exhibition.\n` +
      `A) is\nB) are\nC) were\nD) have been`
  );

  // Quick Question Builder Form
  const [mcqForm, setMcqForm] = useState({
    question: 'In the 1970s, ecologist Robert Paine coined the term "keystone species" to describe organisms that play an outsized role in sustaining biodiversity. _______ some critics initially questioned the broad applicability of the concept, extensive field experiments subsequently validated Paine’s hypothesis.',
    optionA: 'Moreover,',
    optionB: 'Although',
    optionC: 'Therefore,',
    optionD: 'Similarly,',
    correctOption: 'B',
    explanation: 'Choice B is correct. "Although" provides the necessary concession and contrast between initial skepticism and subsequent experimental validation.',
    grade: '11',
    subject: 'English (Reading & Writing)',
  });

  const [savedQuestions, setSavedQuestions] = useState([]);

  const handleFilesSelected = (files) => {
    setUploadedFiles(files);
    toast.success(`OCR scan finished for ${files[0]?.name || 'uploaded file'}`);
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!mcqForm.question || !mcqForm.optionA) {
      toast.error('Question prompt and options are required.');
      return;
    }

    const newQ = {
      id: `q-ocr-${Date.now()}`,
      ...mcqForm,
    };
    setSavedQuestions([newQ, ...savedQuestions]);
    toast.success('Question saved to Mrs. Nashwa’s English Question Bank!');

    // Reset form with clean template
    setMcqForm({
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'A',
      explanation: '',
      grade: '11',
      subject: 'English (Reading & Writing)',
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#f5f0e8] flex items-center gap-3">
            <Upload className="w-8 h-8 text-[#c9a96e]" />
            <span>Upload Materials & Question OCR Extractor</span>
          </h1>
          <p className="text-[#a09787] text-xs sm:text-sm mt-1">
            Upload SAT Reading & Writing past papers, EST English worksheets, or image scans to extract questions into Mrs. Nashwa's question bank.
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="p-6 rounded-2xl bg-[#14100c]/90 border border-[#c9a96e]/20 shadow-xl backdrop-blur-xl">
        <FileUpload
          onFilesSelected={handleFilesSelected}
          label="Drag & Drop SAT/EST English Exam PDF, Handout, or Worksheet Images"
        />
      </div>

      {/* Two Columns: Extracted OCR Preview on left, Quick Question Form on right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Extracted Text Preview */}
        <div className="p-6 rounded-2xl bg-[#14100c]/90 border border-[#c9a96e]/20 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#c9a96e]/15 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#c9a96e]" />
                <h3 className="font-serif font-bold text-[#f5f0e8] text-sm">
                  Extracted English OCR Text
                </h3>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(extractedText);
                  toast.success('Copied extracted text!');
                }}
                className="px-2.5 py-1 rounded-lg bg-[#1c1611] hover:bg-[#282018] border border-[#c9a96e]/20 text-xs text-[#d4b87a] flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5 text-[#c9a96e]" /> Copy
              </button>
            </div>

            <textarea
              rows={12}
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-[#0d0b08] border border-[#c9a96e]/20 text-[#d8cfc4] font-mono text-xs focus:outline-none focus:border-[#c9a96e]"
            />
          </div>

          <p className="text-[11px] text-[#7d7465] mt-3">
            Tip: You can highlight and copy text segments directly from this OCR window into the question builder on the right.
          </p>
        </div>

        {/* Quick Question Generator Form */}
        <div className="p-6 rounded-2xl bg-[#14100c]/90 border border-[#c9a96e]/20 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-[#c9a96e]/15 mb-4">
            <PlusCircle className="w-4 h-4 text-[#c9a96e]" />
            <h3 className="font-serif font-bold text-[#f5f0e8] text-sm">
              Quick English Question Builder
            </h3>
          </div>

          <form onSubmit={handleAddQuestion} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-[#d8cfc4] mb-1">
                Question Prompt / Reading Context
              </label>
              <textarea
                rows={3}
                required
                value={mcqForm.question}
                onChange={(e) => setMcqForm({ ...mcqForm, question: e.target.value })}
                placeholder="Enter English passage, grammar prompt, or vocabulary question..."
                className="w-full px-3 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/20 text-[#f5f0e8] focus:outline-none focus:border-[#c9a96e]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#a09787] mb-1">Option A</label>
                <input
                  type="text"
                  required
                  value={mcqForm.optionA}
                  onChange={(e) => setMcqForm({ ...mcqForm, optionA: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/20 text-[#f5f0e8] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#a09787] mb-1">Option B</label>
                <input
                  type="text"
                  required
                  value={mcqForm.optionB}
                  onChange={(e) => setMcqForm({ ...mcqForm, optionB: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/20 text-[#f5f0e8] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#a09787] mb-1">Option C</label>
                <input
                  type="text"
                  required
                  value={mcqForm.optionC}
                  onChange={(e) => setMcqForm({ ...mcqForm, optionC: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/20 text-[#f5f0e8] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#a09787] mb-1">Option D</label>
                <input
                  type="text"
                  required
                  value={mcqForm.optionD}
                  onChange={(e) => setMcqForm({ ...mcqForm, optionD: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/20 text-[#f5f0e8] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#a09787] mb-1">Correct Option</label>
                <select
                  value={mcqForm.correctOption}
                  onChange={(e) => setMcqForm({ ...mcqForm, correctOption: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d0b08] border border-[#c9a96e]/20 text-[#c9a96e] font-bold focus:outline-none"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>
              <div>
                <label className="block text-[#a09787] mb-1">Target Grade</label>
                <select
                  value={mcqForm.grade}
                  onChange={(e) => setMcqForm({ ...mcqForm, grade: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d0b08] border border-[#c9a96e]/20 text-[#f5f0e8] focus:outline-none"
                >
                  <option value="10">Grade 10</option>
                  <option value="11">Grade 11</option>
                  <option value="12">Grade 12</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#a09787] mb-1">Model Explanation & Rule Notes</label>
              <textarea
                rows={2}
                value={mcqForm.explanation}
                onChange={(e) => setMcqForm({ ...mcqForm, explanation: e.target.value })}
                placeholder="Explain the grammatical or rhetorical logic..."
                className="w-full px-3 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/20 text-[#f5f0e8] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-[#c9a96e]/20 hover:brightness-105"
            >
              Save Question to Academy Bank
            </button>
          </form>
        </div>
      </div>

      {/* Saved Questions Queue */}
      {savedQuestions.length > 0 && (
        <div className="p-6 rounded-2xl bg-[#14100c]/90 border border-[#c9a96e]/20 shadow-xl backdrop-blur-xl">
          <h3 className="font-serif font-bold text-[#f5f0e8] text-base mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span>Newly Created Questions in Queue ({savedQuestions.length})</span>
          </h3>

          <div className="space-y-3">
            {savedQuestions.map((sq, i) => (
              <div
                key={sq.id}
                className="p-4 rounded-xl bg-[#1c1611] border border-[#c9a96e]/15 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="text-[#c9a96e] font-mono font-bold">
                    Q{i + 1} (Grade {sq.grade}):
                  </span>{' '}
                  <span className="text-[#f5f0e8] font-medium">{sq.question}</span>
                  <span className="text-emerald-400 block mt-1 font-mono">
                    Correct: Option {sq.correctOption}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

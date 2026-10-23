import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import platformDb from '../../utils/platformDb';
import {
  PlusCircle,
  Clock,
  HelpCircle,
  Eye,
  Trash2,
  CheckCircle,
  Save,
  BookOpen,
  ArrowRight,
  Sparkles,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateAssignmentPage() {
  const navigate = useNavigate();
  const availableCourses = platformDb.getCourses();

  const [assignmentMeta, setAssignmentMeta] = useState({
    title: '',
    course_id: availableCourses[0]?.id || 'c-sat-rw-11',
    grade: '11',
    exam_type: 'Digital SAT',
    time_limit_minutes: 30,
    passing_score: 75,
    auto_submit: true,
    shuffle_questions: true,
    description: '',
  });

  const [questions, setQuestions] = useState(() => platformDb.getQuestions().slice(0, 3));
  const [showPreview, setShowPreview] = useState(false);

  // New question draft
  const [newQType, setNewQType] = useState('mcq');
  const [draftQ, setDraftQ] = useState({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correct_option: 'A',
    correct_text: '',
    explanation: '',
  });

  const handleAddDraftQuestion = (e) => {
    e.preventDefault();
    if (!draftQ.question) {
      toast.error('Question text is required');
      return;
    }

    const createdQuestion = {
      id: `q-custom-${Date.now()}`,
      type: newQType,
      question: draftQ.question,
      options:
        newQType === 'mcq'
          ? [
              { id: 'A', text: draftQ.optionA },
              { id: 'B', text: draftQ.optionB },
              { id: 'C', text: draftQ.optionC },
              { id: 'D', text: draftQ.optionD },
            ]
          : newQType === 'true_false'
          ? [
              { id: 'A', text: 'True' },
              { id: 'B', text: 'False' },
            ]
          : [],
      correct_option: draftQ.correct_option,
      correct_text: draftQ.correct_text,
      explanation: draftQ.explanation || 'Refer to lecture notes for detailed theorem proof.',
    };

    setQuestions([...questions, createdQuestion]);
    toast.success('Question added to exam list!');

    // Reset draft
    setDraftQ({
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correct_option: 'A',
      correct_text: '',
      explanation: '',
    });
  };

  const handleRemoveQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
    toast.success('Question removed.');
  };

  const handleSaveAssignment = (e) => {
    e.preventDefault();
    if (!assignmentMeta.title.trim()) {
      toast.error('Please provide an assignment title');
      return;
    }
    if (questions.length === 0) {
      toast.error('Please include at least one question');
      return;
    }

    try {
      const savedId = platformDb.saveAssignment({
        ...assignmentMeta,
        type: assignmentMeta.exam_type === 'Digital SAT' ? 'SAT Timed Drill' : 'EST Literacy Exam',
        total_questions: questions.length,
        due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
        status: 'Active',
        questions: questions,
      });

      toast.success('Assignment created & published in database!');
      navigate('/assignments');
    } catch (err) {
      toast.error(err.message || 'Failed to publish assignment');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <PlusCircle className="w-8 h-8 text-amber-400" />
            <span>Create Timed Assignment / Mock Exam</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Build standardized tests with countdown limits, anti-tab switch detection, and instant question review.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold transition flex items-center gap-2"
          >
            <Eye className="w-4 h-4 text-blue-400" />
            <span>Live Student Preview ({questions.length} Qs)</span>
          </button>
          <button
            onClick={handleSaveAssignment}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition shadow-lg shadow-amber-400/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Publish Exam</span>
          </button>
        </div>
      </div>

      {/* Assignment Setup Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#14100c]/90 border border-[#c9a96e]/20 shadow-xl backdrop-blur-xl space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <span>General Exam Specifications</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="block font-semibold text-gray-300 mb-1.5">Exam Title</label>
            <input
              type="text"
              required
              value={assignmentMeta.title}
              onChange={(e) => setAssignmentMeta({ ...assignmentMeta, title: e.target.value })}
              placeholder="e.g. Digital SAT Reading & Writing Module 2 Diagnostic Simulation"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-400 text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-300 mb-1.5">Target Course</label>
            <select
              value={assignmentMeta.course_id}
              onChange={(e) => setAssignmentMeta({ ...assignmentMeta, course_id: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none text-sm"
            >
              {COURSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} (Grade {c.grade})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-300 mb-1.5">Time Limit (Minutes)</label>
            <input
              type="number"
              value={assignmentMeta.time_limit_minutes}
              onChange={(e) =>
                setAssignmentMeta({ ...assignmentMeta, time_limit_minutes: Number(e.target.value) })
              }
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-300 mb-1.5">Passing Score (%)</label>
            <input
              type="number"
              value={assignmentMeta.passing_score}
              onChange={(e) =>
                setAssignmentMeta({ ...assignmentMeta, passing_score: Number(e.target.value) })
              }
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-300 mb-1.5">Exam Category</label>
            <select
              value={assignmentMeta.exam_type}
              onChange={(e) =>
                setAssignmentMeta({ ...assignmentMeta, exam_type: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white"
            >
              <option value="Digital SAT">Digital SAT</option>
              <option value="EST">EST</option>
              <option value="Weekly Quiz">Weekly Quiz</option>
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-white/10 text-xs text-gray-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={assignmentMeta.auto_submit}
              onChange={(e) =>
                setAssignmentMeta({ ...assignmentMeta, auto_submit: e.target.checked })
              }
              className="w-4 h-4 rounded text-amber-500"
            />
            <span>Auto-submit when timer expires</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={assignmentMeta.shuffle_questions}
              onChange={(e) =>
                setAssignmentMeta({ ...assignmentMeta, shuffle_questions: e.target.checked })
              }
              className="w-4 h-4 rounded text-amber-500"
            />
            <span>Randomize question sequence for each student</span>
          </label>
        </div>
      </div>

      {/* Add New Question Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#14100c]/90 border border-[#c9a96e]/20 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <span>Add Question #{questions.length + 1}</span>
          </h3>

          <div className="flex items-center gap-2 text-xs">
            {['mcq', 'true_false', 'fill_in_blank'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setNewQType(t)}
                className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition border ${
                  newQType === t
                    ? 'bg-[#18130e] text-[#c9a96e] border-[#c9a96e] shadow-md'
                    : 'bg-[#18130e] text-[#a09787] border-[#c9a96e]/15 hover:border-[#c9a96e]/30 hover:text-[#f5f0e8]'
                }`}
              >
                {t.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleAddDraftQuestion} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-300 mb-1">Question Prompt</label>
            <textarea
              rows={3}
              required
              value={draftQ.question}
              onChange={(e) => setDraftQ({ ...draftQ, question: e.target.value })}
              placeholder="Type the reading passage, rhetorical synthesis prompt, or grammar question..."
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {newQType === 'mcq' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 mb-1">Option A</label>
                <input
                  type="text"
                  required
                  value={draftQ.optionA}
                  onChange={(e) => setDraftQ({ ...draftQ, optionA: e.target.value })}
                  placeholder="Option text A"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Option B</label>
                <input
                  type="text"
                  required
                  value={draftQ.optionB}
                  onChange={(e) => setDraftQ({ ...draftQ, optionB: e.target.value })}
                  placeholder="Option text B"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Option C</label>
                <input
                  type="text"
                  required
                  value={draftQ.optionC}
                  onChange={(e) => setDraftQ({ ...draftQ, optionC: e.target.value })}
                  placeholder="Option text C"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Option D</label>
                <input
                  type="text"
                  required
                  value={draftQ.optionD}
                  onChange={(e) => setDraftQ({ ...draftQ, optionD: e.target.value })}
                  placeholder="Option text D"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
            </div>
          )}

          {newQType === 'fill_in_blank' && (
            <div>
              <label className="block text-gray-400 mb-1">Numerical Correct Answer</label>
              <input
                type="text"
                required
                value={draftQ.correct_text}
                onChange={(e) => setDraftQ({ ...draftQ, correct_text: e.target.value })}
                placeholder="e.g. 1.5 or -4"
                className="w-full max-w-xs px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-amber-300 font-mono"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {newQType !== 'fill_in_blank' && (
              <div>
                <label className="block text-gray-400 mb-1">Select Correct Answer</label>
                <select
                  value={draftQ.correct_option}
                  onChange={(e) => setDraftQ({ ...draftQ, correct_option: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-amber-300 font-bold"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  {newQType === 'mcq' && (
                    <>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </>
                  )}
                </select>
              </div>
            )}

            <div>
              <label className="block text-gray-400 mb-1">Explanation / Solution Steps</label>
              <input
                type="text"
                value={draftQ.explanation}
                onChange={(e) => setDraftQ({ ...draftQ, explanation: e.target.value })}
                placeholder="Explain the shortcut or theorem to the scholar..."
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Append Question to Exam</span>
            </button>
          </div>
        </form>
      </div>

      {/* Current Question Bank for this Assignment */}
      <div className="space-y-4">
        <h3 className="font-bold text-white text-base">
          Exam Question Bank ({questions.length} Items Configured)
        </h3>

        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-start justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-amber-400 font-mono font-bold text-xs">Q{idx + 1}</span>
                  <span className="text-[10px] text-gray-400 font-mono uppercase bg-white/5 px-2 py-0.5 rounded">
                    {q.type}
                  </span>
                </div>
                <p className="text-sm font-medium text-white">{q.question}</p>
                <p className="text-xs text-emerald-400 mt-1 font-mono">
                  Correct Answer: {q.type === 'fill_in_blank' ? q.correct_text : `Option ${q.correct_option}`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveQuestion(q.id)}
                className="p-2 text-gray-400 hover:text-red-400 transition"
                title="Remove Question"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Live Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-3xl bg-[#18130e] border border-amber-900/30 p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Student Examination Preview
                </span>
                <h3 className="text-lg font-bold text-white">{assignmentMeta.title || 'Untitled Exam'}</h3>
              </div>
              <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-xs font-bold text-amber-300 font-mono">Question {idx + 1}:</span>
                  <p className="text-sm font-medium text-white my-2">{q.question}</p>
                  <div className="space-y-1.5 pl-2 text-xs text-gray-300">
                    {q.options?.map((opt) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <span className="font-bold text-amber-400">{opt.id})</span>
                        <span>{opt.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

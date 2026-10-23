import React, { useState } from 'react';
import platformDb from '../../utils/platformDb';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Users,
  DollarSign,
  Star,
  CheckCircle,
  X,
  PlayCircle,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CourseManagementPage() {
  const [courses, setCourses] = useState(() => platformDb.getCourses());
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const refreshCourses = () => {
    setCourses(platformDb.getCourses());
  };

  const [formData, setFormData] = useState({
    title: '',
    code: '',
    grade: '11',
    exam_type: 'Digital SAT',
    subject: 'English (Reading & Writing)',
    price: '1,800 EGP',
    subscription_type: 'Monthly',
    description: '',
    thumbnail: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
    lessons_count: 20,
    assignments_count: 10,
  });

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      code: `SAT-RW-${Date.now().toString().slice(-3)}`,
      grade: '11',
      exam_type: 'Digital SAT',
      subject: 'English (Reading & Writing)',
      price: '1,800 EGP',
      subscription_type: 'Monthly',
      description: '',
      thumbnail: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
      lessons_count: 24,
      assignments_count: 12,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (course) => {
    setEditingCourse(course);
    setFormData(course);
    setShowModal(true);
  };

  const handleSaveCourse = (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Course title is required');
      return;
    }

    try {
      if (editingCourse) {
        platformDb.saveCourse({ ...editingCourse, ...formData });
        toast.success('Course updated in platform database!');
      } else {
        platformDb.saveCourse({
          ...formData,
          enrolled_count: 0,
          rating: 5.0,
          progress: 0,
          status: 'Available',
        });
        toast.success('New course added and published to scholars!');
      }
      refreshCourses();
      setShowModal(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save course');
    }
  };

  const handleDeleteCourse = (id) => {
    if (window.confirm('Are you sure you want to remove this course from catalog?')) {
      platformDb.deleteCourse(id);
      refreshCourses();
      toast.success('Course removed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-amber-400" />
            <span>Course Catalog Management</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Configure SAT & EST curricula, pricing tiers, and lecture modules for Grades 10–12.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-amber-400/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Course</span>
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="rounded-2xl bg-[#14100c]/90 border border-[#c9a96e]/20 overflow-hidden shadow-xl hover:border-[#c9a96e]/40 transition flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-[#241a12] text-[#c9a96e] text-[10px] font-bold border border-[#c9a96e]/30 backdrop-blur-sm">
                    Grade {course.grade}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-amber-900/90 text-amber-300 text-[10px] font-bold border border-amber-400/30 backdrop-blur-sm">
                    {course.exam_type}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-amber-300 text-xs font-mono font-bold">
                  {course.price} ({course.subscription_type})
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-base font-bold text-white mb-1.5 leading-snug">
                  {course.title}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4">
                  {course.description}
                </p>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5 text-center text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Scholars</span>
                    <span className="font-bold text-white font-mono">{course.enrolled_count}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Lessons</span>
                    <span className="font-bold text-white font-mono">{course.lessons_count}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Rating</span>
                    <span className="font-bold text-amber-300 font-mono flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 fill-amber-300" /> {course.rating}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center justify-between gap-2">
              <button
                onClick={() => handleOpenEdit(course)}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition flex items-center justify-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5 text-[#c9a96e]" />
                <span>Edit Course</span>
              </button>
              <button
                onClick={() => handleDeleteCourse(course.id)}
                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition border border-red-500/20"
                title="Delete Course"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Course Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl bg-[#18130e] border border-amber-900/30 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <h3 className="text-xl font-bold text-white">
                {editingCourse ? 'Edit Course Curriculum' : 'Create New Course'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Digital SAT Reading & Writing Masterclass"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Grade</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none"
                  >
                    <option value="10">Grade 10</option>
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Exam Type</label>
                  <select
                    value={formData.exam_type}
                    onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none"
                  >
                    <option value="Digital SAT">Digital SAT</option>
                    <option value="EST">EST</option>
                    <option value="Both SAT & EST">Both SAT & EST</option>
                    <option value="Foundation">Foundation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Billing Type</label>
                  <select
                    value={formData.subscription_type}
                    onChange={(e) => setFormData({ ...formData, subscription_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Course-based">Course-based</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Tuition / Fee (EGP)</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="1,800 EGP"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Lectures Count</label>
                  <input
                    type="number"
                    value={formData.lessons_count}
                    onChange={(e) => setFormData({ ...formData, lessons_count: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Course Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline topics, objectives, and test preparation coverage..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition"
                >
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

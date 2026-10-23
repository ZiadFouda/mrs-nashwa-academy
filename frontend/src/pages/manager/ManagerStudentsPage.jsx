import React, { useState, useEffect } from 'react';
import platformDb from '../../utils/platformDb';
import { getDeviceFingerprint } from '../../utils/deviceFingerprint';
import {
  Users,
  Smartphone,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  UserPlus,
  RefreshCw,
  KeyRound,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  GraduationCap,
  Sparkles,
  Lock,
  Unlock,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManagerStudentsPage() {
  const [students, setStudents] = useState(() => platformDb.getStudentsWithDetails());
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [editingStudent, setEditingStudent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Student Form
  const [newStudentData, setNewStudentData] = useState({
    username: '',
    password: 'Student2026!',
    full_name: '',
    email: '',
    grade: '11',
    phone: '',
    parent_name: '',
    parent_phone: '',
    target_exam: 'Digital SAT & EST English',
    device_lock_enabled: true,
  });

  const refreshStudents = () => {
    setStudents(platformDb.getStudentsWithDetails());
  };

  const togglePasswordVisibility = (studentId) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  // 1. Reset Device Lock for student
  const handleResetDevice = (student) => {
    if (
      window.confirm(
        `Are you sure you want to reset the authorized device for ${student.full_name}? The student will be allowed to bind to a new device on their next sign-in.`
      )
    ) {
      try {
        platformDb.resetStudentDevice(student.id);
        refreshStudents();
        toast.success(`Device lock reset for ${student.full_name}. They can now sign in from a new browser.`);
      } catch (err) {
        toast.error('Failed to reset device: ' + err.message);
      }
    }
  };

  // 2. Toggle Device Lock Enforcement
  const handleToggleDeviceLock = (student) => {
    const nextState = !student.device_lock_enabled;
    try {
      platformDb.toggleStudentDeviceLock(student.id, nextState);
      refreshStudents();
      toast.success(
        `Single-device lock ${nextState ? 'ENABLED' : 'DISABLED'} for ${student.full_name}.`
      );
    } catch (err) {
      toast.error('Failed to update device lock: ' + err.message);
    }
  };

  // 3. Edit Student Data
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      platformDb.updateUser(editingStudent.id, {
        full_name: editingStudent.full_name,
        password: editingStudent.password,
        phone: editingStudent.phone,
        grade: editingStudent.grade,
        target_exam: editingStudent.target_exam,
        parent_name: editingStudent.parent_name,
        parent_phone: editingStudent.parent_phone,
        status: editingStudent.status,
      });
      refreshStudents();
      setEditingStudent(null);
      toast.success('Student data updated directly in platform database!');
    } catch (err) {
      toast.error('Update failed: ' + err.message);
    }
  };

  // 4. Create New Student
  const handleCreateStudent = (e) => {
    e.preventDefault();
    if (!newStudentData.username.trim() || !newStudentData.full_name.trim()) {
      toast.error('Username and Full Name are required.');
      return;
    }

    try {
      platformDb.addUser({
        ...newStudentData,
        role: 'student',
      });
      refreshStudents();
      setShowAddModal(false);
      setNewStudentData({
        username: '',
        password: 'Student2026!',
        full_name: '',
        email: '',
        grade: '11',
        phone: '',
        parent_name: '',
        parent_phone: '',
        target_exam: 'Digital SAT & EST English',
        device_lock_enabled: true,
      });
      toast.success('New student profile created and saved in system!');
    } catch (err) {
      toast.error(err.message || 'Failed to create student');
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      (s.student_code || '').toLowerCase().includes(query) ||
      (s.full_name || '').toLowerCase().includes(query) ||
      (s.username || '').toLowerCase().includes(query) ||
      (s.phone || '').includes(query) ||
      (s.email || '').toLowerCase().includes(query);

    const matchesGrade = gradeFilter === 'all' || s.grade === gradeFilter;

    let matchesDevice = true;
    if (deviceFilter === 'locked') {
      matchesDevice = s.bound_device && s.device_lock_enabled !== false;
    } else if (deviceFilter === 'unlocked') {
      matchesDevice = !s.bound_device;
    } else if (deviceFilter === 'disabled') {
      matchesDevice = s.device_lock_enabled === false;
    }

    return matchesSearch && matchesGrade && matchesDevice;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#1c1611] via-[#241c14] to-[#14100c] border border-[#c9a96e]/30 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a96e]/15 text-[#d4b87a] text-xs font-semibold mb-3 border border-[#c9a96e]/25">
              <ShieldCheck className="w-4 h-4 text-[#c9a96e]" />
              <span>Manager Terminal • Single-Device & Hardware Enforcement</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#f5f0e8]">
              All Scholars Directory & Device Control
            </h1>
            <p className="text-[#a09787] text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Complete student records with official IDs, credentials, diagnostic averages, and real-time browser/device lockdown management.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] font-bold text-xs uppercase tracking-wider transition hover:brightness-105 active:scale-95 shadow-lg shadow-[#c9a96e]/20 flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Scholar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <span className="text-[10px] sm:text-xs font-semibold text-[#a09787] uppercase truncate block">
            Total Enrolled Scholars
          </span>
          <div className="text-xl sm:text-3xl font-serif text-[#f5f0e8] mt-1">{students.length}</div>
          <p className="text-[10px] text-emerald-400 mt-0.5">Grades 10, 11 & 12</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <span className="text-[10px] sm:text-xs font-semibold text-[#a09787] uppercase truncate block">
            Locked to Device
          </span>
          <div className="text-xl sm:text-3xl font-serif text-emerald-400 mt-1">
            {students.filter((s) => s.bound_device).length}
          </div>
          <p className="text-[10px] text-[#a09787] mt-0.5">Bound to specific hardware</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <span className="text-[10px] sm:text-xs font-semibold text-[#a09787] uppercase truncate block">
            Unbound / New Devices
          </span>
          <div className="text-xl sm:text-3xl font-serif text-[#d4b87a] mt-1">
            {students.filter((s) => !s.bound_device).length}
          </div>
          <p className="text-[10px] text-[#a09787] mt-0.5">Will bind on first login</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#18130e] border border-[#c9a96e]/20 shadow-xl">
          <span className="text-[10px] sm:text-xs font-semibold text-[#a09787] uppercase truncate block">
            Cohort Diagnostic Avg
          </span>
          <div className="text-xl sm:text-3xl font-serif text-[#c9a96e] mt-1">
            {students.length > 0
              ? Math.round(students.reduce((acc, s) => acc + (s.avg_score || 85), 0) / students.length)
              : 88}
            %
          </div>
          <p className="text-[10px] text-emerald-400 mt-0.5">Target: 760+ SAT R&W</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#14100c]/90 border border-[#c9a96e]/20 backdrop-blur-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#a09787] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Student ID (e.g. NAS-2026), Name, Username, Phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/20 text-[#f5f0e8] placeholder-[#7d7465] text-xs focus:outline-none focus:border-[#c9a96e]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/20 text-[#f5f0e8] text-xs focus:outline-none focus:border-[#c9a96e]"
          >
            <option value="all">All Grades</option>
            <option value="10">Grade 10</option>
            <option value="11">Grade 11</option>
            <option value="12">Grade 12</option>
          </select>

          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/20 text-[#f5f0e8] text-xs focus:outline-none focus:border-[#c9a96e]"
          >
            <option value="all">All Device States</option>
            <option value="locked">Locked to Device</option>
            <option value="unlocked">Awaiting Binding</option>
            <option value="disabled">Lock Disabled</option>
          </select>
        </div>
      </div>

      {/* Students Complete Directory Table */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#14100c]/90 border border-[#c9a96e]/20 overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#d8cfc4]">
            <thead className="bg-[#1c1611] border-b border-[#c9a96e]/20 text-[10px] font-mono uppercase tracking-wider text-[#a09787]">
              <tr>
                <th className="py-3.5 px-4">Student ID & Scholar</th>
                <th className="py-3.5 px-4">Credentials (User / Pass)</th>
                <th className="py-3.5 px-4">Grade & Exam Target</th>
                <th className="py-3.5 px-4">Phone & Parent Contact</th>
                <th className="py-3.5 px-4">Single-Device Lock</th>
                <th className="py-3.5 px-4">Performance</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c9a96e]/10">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#a09787]">
                    No student records match the search query.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isPasswordShown = revealedPasswords[student.id];
                  const isBound = !!student.bound_device;
                  const isLockEnabled = student.device_lock_enabled !== false;

                  return (
                    <tr key={student.id} className="hover:bg-white/5 transition">
                      {/* ID & Scholar Name */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              student.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                            }
                            alt={student.full_name}
                            className="w-9 h-9 rounded-xl object-cover border border-[#c9a96e]/30 shrink-0"
                          />
                          <div>
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#c9a96e]/15 text-[#d4b87a] font-bold border border-[#c9a96e]/25">
                              {student.student_code || student.id}
                            </span>
                            <div className="font-serif font-bold text-[#f5f0e8] text-sm mt-0.5">
                              {student.full_name}
                            </div>
                            <span className="text-[10px] text-[#a09787]">{student.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Credentials (Username & Password) */}
                      <td className="py-4 px-4 font-mono">
                        <div className="text-[11px] text-[#f5f0e8]">
                          <span className="text-[#a09787]">User:</span> @{student.username}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[#a09787]">Pass:</span>
                          <span className="text-[#c9a96e] font-bold">
                            {isPasswordShown ? student.password || 'Student2026!' : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(student.id)}
                            className="text-[#a09787] hover:text-[#f5f0e8] ml-1"
                            title={isPasswordShown ? 'Hide Password' : 'Show Password'}
                          >
                            {isPasswordShown ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Grade & Target */}
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-[#241c14] border border-[#c9a96e]/25 text-[#d4b87a] font-bold text-[10px] inline-block">
                          Grade {student.grade || '11'}
                        </span>
                        <div className="text-[11px] text-[#f5f0e8] mt-1">
                          {student.target_exam || 'Digital SAT & EST'}
                        </div>
                      </td>

                      {/* Contact & Parent Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-[11px] text-[#f5f0e8]">
                          <Phone className="w-3 h-3 text-[#c9a96e]" />
                          <span>{student.phone || '+20 100 000 0000'}</span>
                        </div>
                        <div className="text-[10px] text-[#a09787] mt-1">
                          Guardian: <strong className="text-[#d8cfc4]">{student.parent_name || 'Dr. Parent'}</strong> (
                          {student.parent_phone || '+20 100 000 0000'})
                        </div>
                      </td>

                      {/* Single Device Lock Status & Controls */}
                      <td className="py-4 px-4">
                        {!isLockEnabled ? (
                          <div className="flex items-center gap-1.5 text-amber-400 font-medium text-[11px]">
                            <Unlock className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>Lock Disabled</span>
                          </div>
                        ) : isBound ? (
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 font-semibold text-[10px]">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span className="truncate max-w-[170px]" title={student.bound_device.deviceLabel}>
                                {student.bound_device.deviceLabel}
                              </span>
                            </div>
                            <div className="text-[9px] text-[#a09787] font-mono">
                              Bound: {new Date(student.bound_at || student.created_at).toLocaleDateString()}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleResetDevice(student)}
                              className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline flex items-center gap-1 mt-0.5"
                            >
                              <RefreshCw className="w-3 h-3" /> Reset / Unbind Device
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#241c14] border border-[#c9a96e]/20 text-[#a09787] text-[10px]">
                              <Smartphone className="w-3 h-3 text-[#c9a96e]" /> Awaiting First Sign-In
                            </span>
                            <div className="text-[9px] text-[#7d7465]">Will automatically lock on login</div>
                          </div>
                        )}
                      </td>

                      {/* Diagnostic Score & Attendance */}
                      <td className="py-4 px-4 font-mono">
                        <div className="font-bold text-emerald-400 text-sm">
                          {student.avg_score || 88}% Avg
                        </div>
                        <div className="text-[10px] text-[#a09787]">
                          Att: {student.attendance || '98%'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingStudent({ ...student })}
                          className="p-1.5 rounded-lg bg-[#1c1611] hover:bg-[#282018] border border-[#c9a96e]/25 text-[#d4b87a] transition"
                          title="Edit Scholar Details directly in platform"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleDeviceLock(student)}
                          className={`p-1.5 rounded-lg border transition ${
                            isLockEnabled
                              ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400'
                              : 'bg-amber-950/60 border-amber-500/30 text-amber-400'
                          }`}
                          title={isLockEnabled ? 'Disable device lockdown for this student' : 'Enable device lockdown'}
                        >
                          {isLockEnabled ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-[#14100c] border border-[#c9a96e]/30 p-6 sm:p-8 shadow-2xl text-[#f5f0e8]">
            <div className="flex items-center justify-between pb-4 border-b border-[#c9a96e]/20 mb-5">
              <div>
                <h3 className="text-xl font-serif text-[#f5f0e8]">Edit Scholar Profile</h3>
                <p className="text-xs text-[#a09787]">
                  Student ID: <span className="font-mono text-[#c9a96e]">{editingStudent.student_code}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="text-[#a09787] hover:text-[#f5f0e8]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#d8cfc4] uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editingStudent.full_name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, full_name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/25 text-[#f5f0e8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#d8cfc4] uppercase mb-1">
                    Password (In-Site Update)
                  </label>
                  <input
                    type="text"
                    value={editingStudent.password}
                    onChange={(e) => setEditingStudent({ ...editingStudent, password: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/25 text-[#f5f0e8] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#d8cfc4] uppercase mb-1">
                    Student Phone
                  </label>
                  <input
                    type="text"
                    value={editingStudent.phone}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/25 text-[#f5f0e8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#d8cfc4] uppercase mb-1">
                    Grade Level
                  </label>
                  <select
                    value={editingStudent.grade}
                    onChange={(e) => setEditingStudent({ ...editingStudent, grade: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/25 text-[#f5f0e8]"
                  >
                    <option value="10">Grade 10</option>
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#d8cfc4] uppercase mb-1">
                    Account Status
                  </label>
                  <select
                    value={editingStudent.status}
                    onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/25 text-[#f5f0e8]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#d8cfc4] uppercase mb-1">
                    Guardian Name
                  </label>
                  <input
                    type="text"
                    value={editingStudent.parent_name || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, parent_name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/25 text-[#f5f0e8]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#d8cfc4] uppercase mb-1">
                    Guardian Phone
                  </label>
                  <input
                    type="text"
                    value={editingStudent.parent_phone || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, parent_phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/25 text-[#f5f0e8]"
                  />
                </div>
              </div>

              {/* Reset Device Lock Quick Action in Edit Modal */}
              {editingStudent.bound_device && (
                <div className="p-3 rounded-xl bg-[#1c1611] border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-amber-300 block">Bound Device Registered</span>
                    <span className="text-[10px] text-[#a09787] block truncate max-w-xs">
                      {editingStudent.bound_device.deviceLabel}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      platformDb.resetStudentDevice(editingStudent.id);
                      setEditingStudent({ ...editingStudent, bound_device: null });
                      refreshStudents();
                      toast.success('Device lock reset!');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40 hover:bg-amber-500/30"
                  >
                    Reset Lock
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#c9a96e]/15">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl text-[#a09787] hover:text-[#f5f0e8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] font-bold"
                >
                  Save Changes Directly
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Scholar Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-[#14100c] border border-[#c9a96e]/30 p-6 sm:p-8 shadow-2xl text-[#f5f0e8]">
            <div className="flex items-center justify-between pb-4 border-b border-[#c9a96e]/20 mb-5">
              <h3 className="text-xl font-serif text-[#f5f0e8]">Enroll New Scholar</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#a09787] hover:text-[#f5f0e8]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#d8cfc4] uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newStudentData.full_name}
                  onChange={(e) => setNewStudentData({ ...newStudentData, full_name: e.target.value })}
                  placeholder="e.g. Farida Hany"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/25 text-[#f5f0e8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#d8cfc4] uppercase mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={newStudentData.username}
                    onChange={(e) => setNewStudentData({ ...newStudentData, username: e.target.value })}
                    placeholder="e.g. farida_hany"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/25 text-[#f5f0e8]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#d8cfc4] uppercase mb-1">
                    Password
                  </label>
                  <input
                    type="text"
                    value={newStudentData.password}
                    onChange={(e) => setNewStudentData({ ...newStudentData, password: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/25 text-[#f5f0e8] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#d8cfc4] uppercase mb-1">
                    Grade Level
                  </label>
                  <select
                    value={newStudentData.grade}
                    onChange={(e) => setNewStudentData({ ...newStudentData, grade: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/25 text-[#f5f0e8]"
                  >
                    <option value="10">Grade 10</option>
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#d8cfc4] uppercase mb-1">
                    Target Exam
                  </label>
                  <select
                    value={newStudentData.target_exam}
                    onChange={(e) => setNewStudentData({ ...newStudentData, target_exam: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/25 text-[#f5f0e8]"
                  >
                    <option value="Digital SAT & EST English">Digital SAT & EST</option>
                    <option value="Digital SAT Only">Digital SAT Only</option>
                    <option value="EST Literacy Only">EST Literacy Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#d8cfc4] uppercase mb-1">
                    Student Phone
                  </label>
                  <input
                    type="text"
                    value={newStudentData.phone}
                    onChange={(e) => setNewStudentData({ ...newStudentData, phone: e.target.value })}
                    placeholder="+20 10..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/25 text-[#f5f0e8]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#d8cfc4] uppercase mb-1">
                    Guardian Phone
                  </label>
                  <input
                    type="text"
                    value={newStudentData.parent_phone}
                    onChange={(e) => setNewStudentData({ ...newStudentData, parent_phone: e.target.value })}
                    placeholder="+20 10..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1c1611] border border-[#c9a96e]/25 text-[#f5f0e8]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-2 cursor-pointer text-[#a09787]">
                <input
                  type="checkbox"
                  checked={newStudentData.device_lock_enabled}
                  onChange={(e) => setNewStudentData({ ...newStudentData, device_lock_enabled: e.target.checked })}
                  className="w-4 h-4 rounded bg-[#1c1611] border-[#c9a96e]/30 text-[#c9a96e]"
                />
                <span className="text-xs text-[#f5f0e8]">
                  Enforce Single-Device & Browser Lock (Restricts student to 1 primary device)
                </span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#c9a96e]/15">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-[#a09787] hover:text-[#f5f0e8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#a8894e] text-[#0d0b08] font-bold"
                >
                  Enroll Scholar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

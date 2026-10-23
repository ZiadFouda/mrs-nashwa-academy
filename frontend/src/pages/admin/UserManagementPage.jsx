import React, { useState, useEffect } from 'react';
import platformDb from '../../utils/platformDb';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Copy,
  Check,
  Shield,
  FileSpreadsheet,
  Link as LinkIcon,
  X,
  KeyRound,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserManagementPage() {
  const [users, setUsers] = useState(() => platformDb.getUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showLinkParentModal, setShowLinkParentModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [generatedCreds, setGeneratedCreds] = useState(null);
  const [hasCopied, setHasCopied] = useState(false);

  // Form states for Create User
  const [formData, setFormData] = useState({
    username: '',
    password: 'Student2026!',
    full_name: '',
    email: '',
    role: 'student',
    grade: '11',
    phone: '',
    parent_name: '',
    parent_phone: '',
  });

  // Bulk input state
  const [bulkInput, setBulkInput] = useState(
    'ahmed_hassan,Ahmed Hassan,ahmed@school.eg,11,+201011112233\nmariam_saad,Mariam Saad,mariam@school.eg,10,+201022223344'
  );

  const refreshUsers = () => {
    setUsers(platformDb.getUsers());
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesGrade = gradeFilter === 'all' || u.grade === gradeFilter;
    return matchesSearch && matchesRole && matchesGrade;
  });

  const handleToggleStatus = (id) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    const newStatus = target.status === 'active' ? 'inactive' : 'active';
    platformDb.updateUser(id, { status: newStatus });
    refreshUsers();
    toast.success(`User status updated to ${newStatus}.`);
  };

  const handleDeleteUser = (id, username) => {
    if (window.confirm(`Are you sure you want to permanently delete user "${username}"?`)) {
      platformDb.deleteUser(id);
      refreshUsers();
      toast.success(`User "${username}" deleted.`);
    }
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!formData.username || !formData.full_name) {
      toast.error('Username and Full Name are required');
      return;
    }

    try {
      const created = platformDb.addUser({
        username: formData.username.toLowerCase().replace(/\s+/g, '_'),
        password: formData.password || 'Student2026!',
        full_name: formData.full_name,
        email: formData.email || `${formData.username}@student.edu.eg`,
        role: formData.role,
        grade: formData.grade,
        phone: formData.phone || '+20 100 000 0000',
        parent_name: formData.parent_name || 'Guardian',
        parent_phone: formData.parent_phone || '+20 100 111 2222',
        target_exam: 'Digital SAT & EST English',
      });

      refreshUsers();
      setGeneratedCreds({
        username: created.username,
        password: formData.password || 'Student2026!',
        name: created.full_name,
      });
      setShowCreateModal(false);
      toast.success('User created and saved to platform database!');
    } catch (err) {
      toast.error(err.message || 'Failed to create user');
    }
  };

  const handleBulkCreate = (e) => {
    e.preventDefault();
    const lines = bulkInput.trim().split('\n');
    const newStudents = [];

    lines.forEach((line) => {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        newStudents.push({
          username: parts[0],
          password: 'Student2026!',
          full_name: parts[1],
          email: parts[2] || `${parts[0]}@student.edu.eg`,
          grade: parts[3] || '11',
          phone: parts[4] || '+20 100 000 0000',
          role: 'student',
        });
      }
    });

    if (newStudents.length > 0) {
      platformDb.bulkAddUsers(newStudents);
      refreshUsers();
      setShowBulkModal(false);
      toast.success(`Successfully imported and saved ${newStudents.length} students!`);
    } else {
      toast.error('Invalid CSV format. Please review lines.');
    }
  };

  const handleCopyCredentials = () => {
    if (generatedCreds) {
      navigator.clipboard.writeText(
        `Mrs. Nashwa Abdelhalim Platform Credentials:\nPortal: https://sat-est-academy.com/login\nUsername: ${generatedCreds.username}\nPassword: ${generatedCreds.password}`
      );
      setHasCopied(true);
      toast.success('Credentials copied to clipboard!');
      setTimeout(() => setHasCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-amber-400" />
            <span>User Management</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Manage student registrations, parent linkages, credentials, and role privileges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold transition flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Bulk CSV Import</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-amber-400/20 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Single User</span>
          </button>
        </div>
      </div>

      {/* Generated Credentials Popup Banner */}
      {generatedCreds && (
        <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-400/60 shadow-xl flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-400 text-slate-950">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                New Credentials Generated for {generatedCreds.name}
              </p>
              <p className="text-xs text-amber-200 font-mono mt-0.5">
                Username: <span className="text-white font-bold">{generatedCreds.username}</span> | Password: <span className="text-white font-bold">{generatedCreds.password}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCredentials}
              className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
            >
              {hasCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{hasCopied ? 'Copied' : 'Copy Credentials'}</span>
            </button>
            <button
              onClick={() => setGeneratedCreds(null)}
              className="p-1.5 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, username, or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <Filter className="w-4 h-4 text-amber-400" />
            <span>Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-300">
            <span>Grade:</span>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none"
            >
              <option value="all">All Grades</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-white/10 bg-[#14100c]/90 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-white/5 uppercase text-[10px] tracking-wider text-gray-400 border-b border-white/10">
              <tr>
                <th className="px-5 py-3.5">Student / User</th>
                <th className="px-4 py-3.5">Grade & Target</th>
                <th className="px-4 py-3.5">Linked Parent</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Avg Mastery</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-400">
                    No users found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white text-sm">{u.full_name}</div>
                      <div className="text-gray-400 text-[11px] font-mono">
                        @{u.username} • {u.email}
                      </div>
                      <div className="text-[10px] text-gray-500">{u.phone}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-amber-300 block">Grade {u.grade}</span>
                      <span className="text-[11px] text-gray-400">{u.target_exam}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-white">{u.parent_name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{u.parent_phone}</div>
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setShowLinkParentModal(true);
                        }}
                        className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 mt-1"
                      >
                        <LinkIcon className="w-3 h-3" /> Change Parent Link
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          u.status === 'active'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-950 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {u.status === 'active' ? (
                          <>
                            <CheckCircle className="w-3 h-3" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-white">
                      {u.avg_score}%
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setGeneratedCreds({
                            username: u.username,
                            password: u.password || 'Student2026!',
                            name: u.full_name,
                          });
                          toast.success('Generated reset credentials.');
                        }}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-300 transition"
                        title="Reset & view credentials"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.username)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Single User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-[#18130e] border border-amber-900/30 p-6 sm:p-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <h3 className="text-xl font-bold text-white">Create New Scholar / User</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="e.g. Karim Tamer"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. karim_tamer"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="parent">Parent</option>
                    <option value="teacher">Teacher</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Student Phone / WhatsApp</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+20 100 000 0000"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 border-t border-white/10">
                <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2">
                  Parent Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Parent Name</label>
                    <input
                      type="text"
                      value={formData.parent_name}
                      onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                      placeholder="e.g. Dr. Tarek"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Parent Phone</label>
                    <input
                      type="text"
                      value={formData.parent_phone}
                      onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                      placeholder="+20 100 111 2222"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition"
                >
                  Create & Generate Passcode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-[#18130e] border border-amber-900/30 p-6 sm:p-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="text-xl font-bold text-white">Bulk Student CSV Import</h3>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-300 mb-3">
              Format: <span className="font-mono text-amber-300">username, full_name, email, grade, phone</span> (one scholar per line)
            </p>
            <textarea
              rows={6}
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/50 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-amber-400 mb-4"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkCreate}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md"
              >
                Import Scholars
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Parent Modal */}
      {showLinkParentModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#18130e] border border-amber-900/30 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">
              Link Parent to {selectedUser.full_name}
            </h3>
            <p className="text-xs text-gray-300 mb-4">
              Select or assign a verified parent phone number to link their portal overview.
            </p>
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Parent Full Name</label>
                <input
                  type="text"
                  defaultValue={selectedUser.parent_name}
                  id="link_parent_name"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Parent Phone</label>
                <input
                  type="text"
                  defaultValue={selectedUser.parent_phone}
                  id="link_parent_phone"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowLinkParentModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const pName = document.getElementById('link_parent_name').value;
                  const pPhone = document.getElementById('link_parent_phone').value;
                  setUsers((prev) =>
                    prev.map((u) =>
                      u.id === selectedUser.id ? { ...u, parent_name: pName, parent_phone: pPhone } : u
                    )
                  );
                  setShowLinkParentModal(false);
                  toast.success('Parent linkage updated.');
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md"
              >
                Save Parent Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

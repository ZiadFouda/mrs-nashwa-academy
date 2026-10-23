import React, { useState } from 'react';
import platformDb from '../../utils/platformDb';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserPlus,
  Search,
  Filter,
  Check,
  X,
  FileCheck,
  Eye,
  DollarSign,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function EnrollmentPage() {
  const allUsers = platformDb.getUsers();
  const allCourses = platformDb.getCourses();
  const [enrollments, setEnrollments] = useState(() => platformDb.getEnrollments());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showManualEnrollModal, setShowManualEnrollModal] = useState(false);

  const refreshEnrollments = () => {
    setEnrollments(platformDb.getEnrollments());
  };

  const [enrollForm, setEnrollForm] = useState({
    student_name: allUsers[0]?.full_name || 'Scholar',
    student_email: allUsers[0]?.email || 'student@school.eg',
    course_name: allCourses[0]?.title || 'Digital SAT English',
    grade: 'Grade 11',
    plan: 'Monthly Subscription',
    amount: '1,800 EGP',
    payment_method: 'InstaPay',
    instapay_ref: `IPN-${Date.now().toString().slice(-6)}`,
  });

  const filteredEnrollments = enrollments.filter((enr) => {
    const matchesSearch =
      (enr.student_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (enr.course_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (enr.instapay_ref || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || enr.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleVerifyPayment = (id, approved = true) => {
    platformDb.updateEnrollment(id, { payment_status: approved ? 'Verified' : 'Rejected' });
    refreshEnrollments();
    if (approved) {
      toast.success('Payment verified! Scholar course access unlocked.');
    } else {
      toast.error('Payment rejected. Student notified.');
    }
    setSelectedReceipt(null);
  };

  const handleManualEnroll = (e) => {
    e.preventDefault();
    platformDb.saveEnrollment({
      ...enrollForm,
      payment_status: 'Verified',
      enrolled_at: new Date().toISOString().split('T')[0],
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    refreshEnrollments();
    setShowManualEnrollModal(false);
    toast.success('Student enrolled and active in database.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-emerald-400" />
            <span>Enrollments & InstaPay Verification</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Review monthly subscriptions, InstaPay transaction references, and grant course access.
          </p>
        </div>

        <button
          onClick={() => setShowManualEnrollModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-slate-950 text-xs font-bold transition shadow-lg shadow-emerald-400/20 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Manual Student Enrollment</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <span className="text-xs font-semibold text-gray-400 uppercase">Total Collected</span>
          <div className="text-3xl font-black text-white mt-1">14,200 EGP</div>
          <p className="text-xs text-emerald-400 mt-1">Current Billing Cycle</p>
        </div>
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <span className="text-xs font-semibold text-gray-400 uppercase">Verified Enrollments</span>
          <div className="text-3xl font-black text-emerald-400 mt-1">
            {enrollments.filter((e) => e.payment_status === 'Verified').length} Active
          </div>
          <p className="text-xs text-gray-400 mt-1">Full curriculum access</p>
        </div>
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <span className="text-xs font-semibold text-gray-400 uppercase">Pending Verification</span>
          <div className="text-3xl font-black text-amber-400 mt-1">
            {enrollments.filter((e) => e.payment_status === 'Pending Verification').length} Pending
          </div>
          <p className="text-xs text-amber-300 mt-1">Action required</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student, course, or InstaPay ref..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-emerald-400"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-300 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-emerald-400" />
          <span>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Verified">Verified</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="rounded-2xl border border-white/10 bg-[#14100c]/90 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-white/5 uppercase text-[10px] tracking-wider text-gray-400 border-b border-white/10">
              <tr>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-4 py-3.5">Course Enrolled</th>
                <th className="px-4 py-3.5">Amount & Method</th>
                <th className="px-4 py-3.5">Reference / InstaPay</th>
                <th className="px-4 py-3.5">Payment Status</th>
                <th className="px-5 py-3.5 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEnrollments.map((enr) => (
                <tr key={enr.id} className="hover:bg-white/5 transition">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-white text-sm">{enr.student_name}</div>
                    <div className="text-gray-400 text-[11px] font-mono">{enr.student_email}</div>
                    <span className="text-[10px] text-amber-300">{enr.grade}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-white">{enr.course_name}</div>
                    <div className="text-[10px] text-gray-400">{enr.plan}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-mono font-bold text-white text-sm">{enr.amount}</div>
                    <div className="text-[10px] text-gray-400">{enr.payment_method}</div>
                  </td>
                  <td className="px-4 py-4 font-mono text-[11px]">
                    <span className="bg-black/40 px-2 py-1 rounded border border-white/10 text-amber-300">
                      {enr.instapay_ref}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        enr.payment_status === 'Verified'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : enr.payment_status === 'Pending Verification'
                          ? 'bg-amber-950 text-amber-400 border border-amber-500/30 animate-pulse'
                          : 'bg-red-950 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {enr.payment_status === 'Verified' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Active / Verified
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" /> Pending Check
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right space-x-2">
                    {enr.payment_status === 'Pending Verification' ? (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleVerifyPayment(enr.id, true)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md"
                          title="Confirm InstaPay Receipt"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleVerifyPayment(enr.id, false)}
                          className="px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs"
                          title="Reject"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-[11px]">Enrolled & Active</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Enroll Modal */}
      {showManualEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-[#18130e] border border-amber-900/30 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="text-xl font-bold text-white">Manual Student Enrollment</h3>
              <button onClick={() => setShowManualEnrollModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualEnroll} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Student</label>
                <select
                  value={enrollForm.student_name}
                  onChange={(e) => {
                    const st = INITIAL_STUDENTS_LIST.find((s) => s.full_name === e.target.value);
                    setEnrollForm({
                      ...enrollForm,
                      student_name: e.target.value,
                      student_email: st?.email || '',
                      grade: `Grade ${st?.grade || '11'}`,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs"
                >
                  {INITIAL_STUDENTS_LIST.map((s) => (
                    <option key={s.id} value={s.full_name}>
                      {s.full_name} (Grade {s.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Course Curriculum</label>
                <select
                  value={enrollForm.course_name}
                  onChange={(e) => {
                    const crs = COURSES.find((c) => c.title === e.target.value);
                    setEnrollForm({
                      ...enrollForm,
                      course_name: e.target.value,
                      amount: crs?.price || '1,800 EGP',
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs"
                >
                  {COURSES.map((c) => (
                    <option key={c.id} value={c.title}>
                      {c.title} ({c.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Plan</label>
                  <select
                    value={enrollForm.plan}
                    onChange={(e) => setEnrollForm({ ...enrollForm, plan: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs"
                  >
                    <option value="Monthly Subscription">Monthly Subscription</option>
                    <option value="Course-based Access">Course-based Access</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Payment Method</label>
                  <select
                    value={enrollForm.payment_method}
                    onChange={(e) => setEnrollForm({ ...enrollForm, payment_method: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs"
                  >
                    <option value="InstaPay">InstaPay Egypt</option>
                    <option value="Vodafone Cash">Vodafone Cash</option>
                    <option value="Direct Bank Wire">Direct Bank Wire</option>
                    <option value="Cash at Center">Cash at Center</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowManualEnrollModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs"
                >
                  Grant Course Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

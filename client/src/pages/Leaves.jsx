import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { Calendar, Send, Check, X, FileText, AlertCircle, Clock } from 'lucide-react';

/**
 * Leave Application and Review Desk
 */
const Leaves = () => {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Apply Form State
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    type: 'Casual',
    reason: '',
  });

  // Rejection Dialog State
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('/leaves');
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve leave records.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate || !form.reason) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      await axios.post('/leaves', form);
      setForm({ startDate: '', endDate: '', type: 'Casual', reason: '' });
      fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      setError('');
      await axios.patch(`/leaves/${id}`, { status: 'Approved' });
      fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve leave');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason) return;

    try {
      setActionLoading(true);
      setError('');
      await axios.patch(`/leaves/${rejectingId}`, { status: 'Rejected', rejectionReason });
      setRejectingId(null);
      setRejectionReason('');
      fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject leave');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
      Approved: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
      Rejected: 'bg-rose-500/10 text-rose-400 border border-rose-500/25',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 animate-fadeIn">
      
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">Leave Planner</h1>
        <p className="text-slate-500 text-sm mt-1">
          {isAdmin 
            ? 'Review and manage company-wide leave applications and time-off bookings.' 
            : 'Submit casual, sick, or maternity leave requests and monitor approvals.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Apply Form (Employee) / Overview Stats (Admin) */}
        <div className="space-y-6 lg:col-span-1">
          {!isAdmin ? (
            <GlassCard className="space-y-5">
              <h2 className="text-lg font-bold text-slate-800">Request Time Off</h2>
              
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Leave Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 text-sm cursor-pointer"
                  >
                    <option value="Casual">Casual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Maternity/Paternity">Maternity/Paternity</option>
                    <option value="LOP">Loss of Pay (LOP)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">End Date</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason for Request</label>
                  <textarea
                    rows="4"
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    placeholder="Provide details about your request..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 text-sm resize-none placeholder-slate-400"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>{actionLoading ? 'Submitting...' : 'Send Application'}</span>
                </button>
              </form>
            </GlassCard>
          ) : (
            <GlassCard className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800">System Metrics</h2>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-650">
                <span className="text-slate-500 uppercase font-semibold">Total Requests Handled</span>
                <p className="text-2xl font-bold text-slate-800 mt-1">{leaves.length}</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-600">
                <span className="text-amber-500/80 uppercase font-semibold">Pending Decisions</span>
                <p className="text-2xl font-bold mt-1">
                  {leaves.filter((l) => l.status === 'Pending').length}
                </p>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right Column: Leaves History table (Employee personal / Admin full list) */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="overflow-x-auto p-0 border border-slate-200">
            <table className="w-full border-collapse text-left text-sm text-slate-600 min-w-[600px]">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  {isAdmin && <th className="px-6 py-4">Employee</th>}
                  <th className="px-6 py-4">Duration & Type</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Status</th>
                  {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.length > 0 ? (
                  leaves.map((leave) => (
                    <tr key={leave._id} className="hover:bg-slate-50/50 transition-all">
                      {isAdmin && (
                        <td className="px-6 py-4 flex flex-col">
                          <span className="font-bold text-slate-800">
                            {leave.employee?.firstName} {leave.employee?.lastName}
                          </span>
                          <span className="text-xs text-slate-500 mt-0.5">{leave.employee?.employeeId}</span>
                        </td>
                      )}
                      <td className="px-6 py-4 flex flex-col">
                        <span className="text-slate-800 font-semibold">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-indigo-600 font-semibold mt-0.5">{leave.type} Leave</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 max-w-xs break-words">
                        <p className="font-medium text-slate-700">{leave.reason}</p>
                        {leave.rejectionReason && (
                          <p className="text-rose-600 font-semibold mt-1">Rejection note: {leave.rejectionReason}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(leave.status)}</td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          {leave.status === 'Pending' ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleApprove(leave._id)}
                                disabled={actionLoading}
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 transition-all cursor-pointer"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setRejectingId(leave._id)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 font-medium">Reviewed</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? '5' : '4'} className="text-center py-12 text-slate-500">
                      No leave requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </GlassCard>
        </div>

      </div>

      {/* ================= REJECTION REASON DIALOG ================= */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-white/10 animate-fadeIn relative">
            <button
              onClick={() => setRejectingId(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-slate-100 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Rejection Reason</h3>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Reason Details *</label>
                <textarea
                  rows="3"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this request is being rejected..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm resize-none placeholder-slate-500"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 border border-white/10 bg-white/5 transition-all text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-md transition-all text-xs cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;

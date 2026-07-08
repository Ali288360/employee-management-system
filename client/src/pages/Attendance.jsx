import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { Calendar, CheckCircle2, AlertTriangle, AlertCircle, Clock, Search, ArrowDownCircle } from 'lucide-react';

/**
 * Attendance Logs and Check-in desk
 */
const Attendance = () => {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';

  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ totalDays: 0, stats: { Present: 0, Late: 0, 'Half-Day': 0, Absent: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError('');
      const [historyRes, statsRes] = await Promise.all([
        axios.get('/attendance/history'),
        axios.get('/attendance/stats'),
      ]);
      setHistory(historyRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Present: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
      Late: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
      'Half-Day': 'bg-violet-500/10 text-violet-400 border border-violet-500/25',
      Absent: 'bg-rose-500/10 text-rose-400 border border-rose-500/25',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${styles[status] || ''}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${
          status === 'Present' ? 'bg-emerald-400' :
          status === 'Late' ? 'bg-amber-400' :
          status === 'Half-Day' ? 'bg-violet-400' : 'bg-rose-400'
        }`}></span>
        {status}
      </span>
    );
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '--';
    const hours = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60);
    return `${hours.toFixed(1)} hrs`;
  };

  // Filter logs for Admin search
  const filteredHistory = history.filter((log) => {
    if (!isAdmin) return true; // Employee history is already personal
    const query = searchQuery.toLowerCase();
    const fullName = `${log.employee?.firstName || ''} ${log.employee?.lastName || ''}`.toLowerCase();
    const empId = (log.employee?.employeeId || '').toLowerCase();
    const dept = (log.employee?.department || '').toLowerCase();
    const dateStr = log.date.toLowerCase();
    return fullName.includes(query) || empId.includes(query) || dept.includes(query) || dateStr.includes(query);
  });

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

      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">Attendance Analytics</h1>
        <p className="text-slate-505 text-sm mt-1">
          {isAdmin 
            ? 'Monitor employee daily punch in times, checkouts, and shift configurations.' 
            : 'Track your personal shift registrations, overtime hours, and attendance parameters.'}
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <GlassCard interactive>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Present Days</span>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">{stats.stats?.Present || 0}</h3>
        </GlassCard>
        <GlassCard interactive>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Late Clock-Ins</span>
          <h3 className="text-2xl font-bold text-amber-600 mt-2">{stats.stats?.Late || 0}</h3>
        </GlassCard>
        <GlassCard interactive>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Half-Days</span>
          <h3 className="text-2xl font-bold text-violet-600 mt-2">{stats.stats?.['Half-Day'] || 0}</h3>
        </GlassCard>
        <GlassCard interactive>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Total Logged Days</span>
          <h3 className="text-2xl font-bold text-indigo-600 mt-2">{stats.totalDays}</h3>
        </GlassCard>
      </div>

      {/* Admin Search bar */}
      {isAdmin && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter records by date, employee name, ID, or department..."
            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder-slate-400 shadow-sm"
          />
        </div>
      )}

      {/* Table list */}
      <GlassCard className="overflow-x-auto p-0 border border-slate-200">
        <table className="w-full border-collapse text-left text-sm text-slate-650 min-w-[700px]">
          <thead className="bg-slate-50 text-slate-505 border-b border-slate-200 uppercase tracking-wider text-[11px] font-bold">
            <tr>
              {isAdmin && <th className="px-6 py-4">Employee</th>}
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Check-In</th>
              <th className="px-6 py-4">Check-Out</th>
              <th className="px-6 py-4">Hours Logged</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/50 transition-all">
                  {isAdmin && (
                    <td className="px-6 py-4 flex flex-col">
                      <span className="font-bold text-slate-800">
                        {log.employee?.firstName} {log.employee?.lastName}
                      </span>
                      <span className="text-xs text-slate-500 mt-0.5">{log.employee?.employeeId} ({log.employee?.department})</span>
                    </td>
                  )}
                  <td className="px-6 py-4 font-mono font-medium text-slate-700">{log.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{formatTime(log.checkIn)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-rose-600" />
                      <span>{formatTime(log.checkOut)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {calculateHours(log.checkIn, log.checkOut)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {getStatusBadge(log.status)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isAdmin ? '6' : '5'} className="text-center py-12 text-slate-500">
                  No attendance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
};

export default Attendance;

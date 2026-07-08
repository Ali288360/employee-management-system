import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import axios from 'axios';
import {
  Users,
  CalendarDays,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Briefcase,
  AlertCircle
} from 'lucide-react';

/**
 * Multi-role Dashboard page
 */
const Dashboard = () => {
  const { user, employee } = useAuth();
  
  // Dashboard stats
  const [adminStats, setAdminStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    checkedInToday: 0,
    payrollTotal: 0,
  });
  const [employeeStats, setEmployeeStats] = useState({
    totalDays: 0,
    present: 0,
    late: 0,
    leaves: 0,
  });
  const [todayAttendance, setTodayAttendance] = useState({
    checkedIn: false,
    checkedOut: false,
    attendance: null,
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const isAdmin = user.role === 'admin';

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      if (isAdmin) {
        // Fetch Admin statistics
        const [empRes, leaveRes, attHistoryRes] = await Promise.all([
          axios.get('/employees'),
          axios.get('/leaves'),
          axios.get('/attendance/history'),
        ]);

        const employees = empRes.data;
        const leaves = leaveRes.data;
        const attHistory = attHistoryRes.data;

        // Calculate counts
        const activeEmployees = employees.filter(e => e.status === 'active');
        const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
        const payrollTotal = activeEmployees.reduce((sum, e) => sum + e.salary, 0);

        const todayStr = new Date().toLocaleDateString('en-CA');
        const checkedInToday = attHistory.filter(a => a.date === todayStr).length;

        setAdminStats({
          totalEmployees: employees.length,
          pendingLeaves,
          checkedInToday,
          payrollTotal,
        });
      } else {
        // Fetch Employee statistics
        const [todayRes, statsRes, leavesRes] = await Promise.all([
          axios.get('/attendance/today'),
          axios.get('/attendance/stats'),
          axios.get('/leaves'),
        ]);

        setTodayAttendance(todayRes.data);
        
        const statsData = statsRes.data;
        const leavesCount = leavesRes.data.filter(l => l.status === 'Approved').length;

        setEmployeeStats({
          totalDays: statsData.totalDays,
          present: statsData.stats?.Present || 0,
          late: statsData.stats?.Late || 0,
          leaves: leavesCount,
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Could not retrieve dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setError('');
      const res = await axios.post('/attendance/check-in');
      setTodayAttendance({
        checkedIn: true,
        checkedOut: false,
        attendance: res.data.attendance,
      });
      // Refresh statistics
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setError('');
      const res = await axios.post('/attendance/check-out');
      setTodayAttendance({
        checkedIn: true,
        checkedOut: true,
        attendance: res.data.attendance,
      });
      // Refresh statistics
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Alert Header */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-900/70 to-cyan-900/40 p-6 md:p-8 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Welcome back, {isAdmin ? 'Admin' : `${employee?.firstName} ${employee?.lastName}`}
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            {isAdmin 
              ? 'Oversee operations, approve leave requests, review employee attendance, and generate payroll records.'
              : `Your dashboard details your attendance history, leaf records, and generated payslips.`}
          </p>
        </div>

        {/* Live Clock Card */}
        <div className="glass-panel px-6 py-4 rounded-2xl flex flex-col items-center justify-center border border-white/10 shrink-0 text-center">
          <span className="text-sm font-semibold tracking-wider text-slate-400 uppercase">Current Time</span>
          <span className="text-2xl md:text-3xl font-bold font-mono text-indigo-300 mt-1">
            {currentTime.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {isAdmin ? (
        /* ================= ADMIN VIEW ================= */
        <div className="space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassCard interactive className="flex items-center gap-5">
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/25 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Employees</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{adminStats.totalEmployees}</h3>
              </div>
            </GlassCard>

            <GlassCard interactive className="flex items-center gap-5">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Leaves</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{adminStats.pendingLeaves}</h3>
              </div>
            </GlassCard>

            <GlassCard interactive className="flex items-center gap-5">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Checked In Today</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{adminStats.checkedInToday}</h3>
              </div>
            </GlassCard>

            <GlassCard interactive className="flex items-center gap-5">
              <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/25 text-cyan-600 dark:text-cyan-400 rounded-xl flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monthly Payroll Base</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
                  ${adminStats.payrollTotal.toLocaleString()}
                </h3>
              </div>
            </GlassCard>
          </div>

          {/* Quick Actions Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GlassCard className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Management Shortcuts</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/employees"
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/10 border border-slate-200/80 dark:border-white/5 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 hover:border-slate-350 dark:hover:border-white/10 transition-all group"
                >
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Manage Directory</span>
                  <ArrowRight className="w-4 h-4 text-indigo-650 dark:text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  to="/leaves"
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/10 border border-slate-200/80 dark:border-white/5 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 hover:border-slate-350 dark:hover:border-white/10 transition-all group"
                >
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Approve Leaves</span>
                  <ArrowRight className="w-4 h-4 text-indigo-655 dark:text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  to="/payslips"
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/10 border border-slate-200/80 dark:border-white/5 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 hover:border-slate-350 dark:hover:border-white/10 transition-all group"
                >
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Generate Payslips</span>
                  <ArrowRight className="w-4 h-4 text-indigo-650 dark:text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/10 border border-slate-200/80 dark:border-white/5 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 hover:border-slate-350 dark:hover:border-white/10 transition-all group"
                >
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Administrative Profile</span>
                  <ArrowRight className="w-4 h-4 text-indigo-650 dark:text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col justify-center items-center text-center p-8 border-indigo-500/20 bg-indigo-50/10 dark:bg-indigo-950/10">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-455 flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Company Overview Healthy</h2>
              <p className="text-slate-505 dark:text-slate-400 text-sm max-w-sm mt-2 leading-relaxed">
                All employee records, daily attendance tracking, leaf allocations, and monthly generated payslips are synchronized.
              </p>
            </GlassCard>
          </div>
        </div>
      ) : (
        /* ================= EMPLOYEE VIEW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Actions: Check In / Check Out */}
          <div className="lg:col-span-2 space-y-8">
            <GlassCard className="flex flex-col justify-between p-8 relative overflow-hidden border-indigo-500/20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Attendance Desk</span>
                  <h2 className="text-2xl font-bold text-white">Daily Session Logs</h2>
                  <p className="text-slate-400 text-sm max-w-md">
                    Check in to start your work shift, and check out before you finish. The cut-off for a Late mark is 9:15 AM.
                  </p>
                </div>

                {/* Clock graphic */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Logged status</p>
                    <p className="text-sm font-bold text-slate-200 mt-0.5">
                      {!todayAttendance.checkedIn 
                        ? 'Not Checked In' 
                        : todayAttendance.checkedOut 
                          ? 'Checked Out' 
                          : 'On Duty'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-8">
                {!todayAttendance.checkedIn ? (
                  <button
                    onClick={handleCheckIn}
                    disabled={actionLoading}
                    className="flex-1 min-w-[150px] py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium rounded-2xl shadow-lg shadow-indigo-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoading ? 'Loading...' : 'Mark Check-In'}
                  </button>
                ) : !todayAttendance.checkedOut ? (
                  <button
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                    className="flex-1 min-w-[150px] py-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-medium rounded-2xl shadow-lg shadow-rose-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoading ? 'Loading...' : 'Mark Check-Out'}
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-center gap-2.5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 font-semibold text-sm">
                    <CheckCircle className="w-5 h-5" />
                    <span>Attendance log completed for today.</span>
                  </div>
                )}
              </div>

              {/* Display Today's Check-In details */}
              {todayAttendance.attendance && (
                <div className="grid grid-cols-2 gap-4 mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider font-semibold">Check-In:</span>
                    <p className="text-sm font-bold text-slate-850 mt-1">
                      {new Date(todayAttendance.attendance.checkIn).toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider font-semibold">Check-Out:</span>
                    <p className="text-sm font-bold text-slate-850 mt-1">
                      {todayAttendance.attendance.checkOut 
                        ? new Date(todayAttendance.attendance.checkOut).toLocaleTimeString() 
                        : 'Active Session'}
                    </p>
                  </div>
                </div>
              )}
            </GlassCard>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Link to="/attendance" className="glass-panel-interactive p-6 rounded-2xl space-y-2">
                <CalendarDays className="w-7 h-7 text-indigo-600" />
                <h3 className="font-bold text-slate-800">Attendance Log</h3>
                <p className="text-xs text-slate-500">View your full checking history.</p>
              </Link>
              <Link to="/leaves" className="glass-panel-interactive p-6 rounded-2xl space-y-2">
                <Briefcase className="w-7 h-7 text-amber-600" />
                <h3 className="font-bold text-slate-800">Apply Leave</h3>
                <p className="text-xs text-slate-500">Check balance and request leave.</p>
              </Link>
              <Link to="/payslips" className="glass-panel-interactive p-6 rounded-2xl space-y-2">
                <FileSpreadsheet className="w-7 h-7 text-emerald-600" />
                <h3 className="font-bold text-slate-800">Download Payslips</h3>
                <p className="text-xs text-slate-500">Print or view monthly slips.</p>
              </Link>
            </div>
          </div>

          {/* Sidebar Stats Summary */}
          <div className="space-y-6">
            <GlassCard className="space-y-6">
              <h3 className="font-bold text-slate-850 text-lg">My Metrics</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Days Checked In</span>
                  <span className="text-lg font-bold text-slate-800">{employeeStats.totalDays}</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Present Markings</span>
                  <span className="text-lg font-bold text-emerald-655">{employeeStats.present}</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Late Markings</span>
                  <span className="text-lg font-bold text-rose-600">{employeeStats.late}</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Approved Leaves</span>
                  <span className="text-lg font-bold text-indigo-650">{employeeStats.leaves}</span>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 border border-slate-200 text-center bg-slate-50/50">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Office Profile</p>
              <h4 className="text-sm font-bold text-slate-800 mt-2">{employee?.designation}</h4>
              <p className="text-xs text-indigo-600 mt-0.5">{employee?.department} Dept.</p>
              <div className="mt-4 pt-4 border-t border-slate-200/80 flex justify-around text-xs">
                <div>
                  <span className="text-slate-500 font-semibold uppercase tracking-wider">Employee ID</span>
                  <p className="font-bold text-slate-700 mt-1">{employee?.employeeId}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold uppercase tracking-wider">Joining Date</span>
                  <p className="font-bold text-slate-700 mt-1">
                    {employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

        </div>
      )}
    </div>
  );
};

export default Dashboard;

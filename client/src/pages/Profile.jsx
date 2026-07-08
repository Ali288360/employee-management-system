import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { User, Shield, KeyRound, AlertCircle, CheckCircle, Smartphone, Mail, Tag, Calendar, Send } from 'lucide-react';

/**
 * User Profile settings and Password modification, with SMTP Email test function.
 */
const Profile = () => {
  const { user, employee } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Test Email state
  const [testEmailInput, setTestEmailInput] = useState('abdialiaa200@gmail.com');
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailSuccess, setTestEmailSuccess] = useState('');
  const [testEmailError, setTestEmailError] = useState('');

  const isAdmin = user.role === 'admin';

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await axios.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      setSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmailSubmit = async (e) => {
    e.preventDefault();
    if (!testEmailInput) {
      setTestEmailError('Please enter a target email address.');
      return;
    }

    try {
      setTestEmailLoading(true);
      setTestEmailError('');
      setTestEmailSuccess('');

      const res = await axios.post('/auth/test-email', {
        email: testEmailInput,
      });

      setTestEmailSuccess(res.data.message || 'Test email dispatched successfully.');
    } catch (err) {
      setTestEmailError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'SMTP Dispatch failed. Please verify SMTP keys in your server/.env file.'
      );
    } finally {
      setTestEmailLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">Profile Workspace</h1>
        <p className="text-slate-550 text-sm mt-1">Review your personal file records and security configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Card: Account Metadata */}
        <div className="md:col-span-2 space-y-6">
          <GlassCard className="space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-200/60 pb-4">
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl flex items-center justify-center text-indigo-650">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-850">
                  {isAdmin ? 'System Administrator' : `${employee?.firstName} ${employee?.lastName}`}
                </h2>
                <span className="text-xs font-semibold text-indigo-650 uppercase tracking-widest block mt-0.5">
                  {isAdmin ? 'Superadmin privileges' : `${employee?.designation} (${employee?.department})`}
                </span>
              </div>
            </div>

            {/* Profile fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-slate-500 font-semibold uppercase tracking-wider block">Email Address</span>
                  <span className="text-slate-800 font-bold block mt-0.5">{user.email}</span>
                </div>
              </div>

              {!isAdmin && (
                <>
                  <div className="flex items-center gap-3">
                    <Tag className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-slate-500 font-semibold uppercase tracking-wider block">Employee ID</span>
                      <span className="text-slate-800 font-bold block mt-0.5">{employee?.employeeId}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-slate-500 font-semibold uppercase tracking-wider block">Phone Number</span>
                      <span className="text-slate-800 font-bold block mt-0.5">{employee?.phoneNumber || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-slate-500 font-semibold uppercase tracking-wider block">Contract Date</span>
                      <span className="text-slate-800 font-bold block mt-0.5">
                        {employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-slate-500 font-semibold uppercase tracking-wider block">Access Permissions</span>
                  <span className="text-slate-800 font-mono font-bold block mt-0.5 uppercase">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Side Column (Change Password & Email Test) */}
        <div className="md:col-span-1 space-y-6">
          {/* Card 1: Change Password */}
          <GlassCard className="space-y-5">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-650" />
              <h3 className="font-bold text-slate-800">Security Credentials</h3>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <p>{success}</p>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </GlassCard>

          {/* Card 2: SMTP Email Delivery Test */}
          <GlassCard className="space-y-5">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-650" />
              <h3 className="font-bold text-slate-800">SMTP Diagnostics</h3>
            </div>

            {testEmailError && (
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="break-words max-w-full">{testEmailError}</p>
              </div>
            )}

            {testEmailSuccess && (
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-650 dark:text-emerald-400 text-xs">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <p>{testEmailSuccess}</p>
              </div>
            )}

            <form onSubmit={handleTestEmailSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-slate-505 uppercase tracking-wider">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={testEmailInput}
                  onChange={(e) => setTestEmailInput(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={testEmailLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testEmailLoading ? 'Sending...' : 'Send Test Email'}</span>
              </button>
            </form>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default Profile;

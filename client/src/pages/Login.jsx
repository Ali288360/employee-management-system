import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { KeyRound, Mail, AlertTriangle, HelpCircle, Activity, Sun, Moon, ArrowRight, ArrowLeft } from 'lucide-react';
import axios from 'axios';

/**
 * Premium split-screen login page conforming to slate/indigo design standards.
 */
const Login = () => {
  const { user, login, error: authError } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // Track selected portal: null | 'admin' | 'employee'
  const [portalRole, setPortalRole] = useState(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [setupMessage, setSetupMessage] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const navigate = useNavigate();

  // If already logged in, redirect to root dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      // Attempt login
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed');
      // If user list is empty, offer initial setup
      if (err.message.includes('Invalid') || err.message.includes('not found')) {
        setShowSetup(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInitialSetup = async () => {
    try {
      setLoading(true);
      const res = await axios.post('/auth/setup');
      setSetupMessage(`Success! Admin: ${res.data.email} | Pass: ${res.data.password}`);
      setEmail(res.data.email);
      setPassword(res.data.password);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Setup already performed or failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-[#0b0f19] transition-colors duration-300 relative select-none">
      
      {/* Floating Top Right Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-655 dark:text-slate-350 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm cursor-pointer flex items-center justify-center transition-all duration-200"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-500" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-650" />
          )}
        </button>
      </div>

      {/* LEFT SPLIT PANEL: Corporate Navy Steel Panel (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0f172a] via-[#131e35] to-[#1e293b] text-white flex-col justify-between p-16 relative overflow-hidden border-r border-white/5">
        
        {/* Background Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[150px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-slate-500/5 blur-[150px]"></div>

        {/* Brand Header top */}
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight block leading-none">Employee MS</span>
            <span className="text-[9px] text-slate-450 uppercase font-bold tracking-widest block mt-0.5">
              Management System
            </span>
          </div>
        </div>

        {/* Middle Welcome message */}
        <div className="z-10 max-w-lg space-y-4">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Employee<br />
            Management System
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Streamline your workforce operations, track attendance, manage payroll, and empower your team securely.
          </p>
        </div>

        {/* Footer info bottom */}
        <div className="z-10">
          <p className="text-xs text-slate-505">© 2026 GreatStack. All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT SPLIT PANEL: Login Card & Portal Selectors */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        
        {/* Mobile Background Orbs */}
        <div className="lg:hidden absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px]"></div>
        
        <div className="w-full max-w-md z-10 space-y-8">
          
          {/* Mobile-only header info */}
          <div className="lg:hidden flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-slate-800 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-3">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              Employee MS
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Management System Portal</p>
          </div>

          {!portalRole ? (
            /* ================= PORTAL SELECTION STATE ================= */
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-slate-550 dark:text-slate-455 text-sm mt-1 leading-relaxed">
                  Select your portal to securely access the system.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {/* Admin Portal Button */}
                <button
                  onClick={() => setPortalRole('admin')}
                  className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-850/80 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/15 rounded-2xl shadow-xs transition-all duration-200 cursor-pointer group"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-605 dark:group-hover:text-indigo-400 transition-colors">
                    Admin Portal
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-605 dark:group-hover:text-indigo-400 transition-all" />
                </button>

                {/* Employee Portal Button */}
                <button
                  onClick={() => setPortalRole('employee')}
                  className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-850/80 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/15 rounded-2xl shadow-xs transition-all duration-200 cursor-pointer group"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-605 dark:group-hover:text-indigo-400 transition-colors">
                    Employee Portal
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-605 dark:group-hover:text-indigo-400 transition-all" />
                </button>
              </div>
            </div>
          ) : (
            /* ================= LOGIN FORM STATE ================= */
            <div className="space-y-6 animate-slideInRight">
              
              {/* Back Link */}
              <button
                onClick={() => {
                  setPortalRole(null);
                  setError('');
                  setShowSetup(false);
                }}
                className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-455 dark:hover:text-indigo-400 transition-colors cursor-pointer group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to Portal Selection</span>
              </button>

              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight capitalize">
                  {portalRole} Login
                </h2>
                <p className="text-slate-555 dark:text-slate-455 text-sm mt-1 leading-relaxed">
                  Enter your credentials to sign in.
                </p>
              </div>

              {/* Login Form Container Card */}
              <div className="glass-panel rounded-lg p-8 border border-slate-200 dark:border-white/10 relative shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Error alerts */}
                  {(error || authError) && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-655 dark:text-red-400 text-xs">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <p>{error || authError}</p>
                    </div>
                  )}

                  {setupMessage && (
                    <div className="p-4 rounded-xl bg-emerald-505/10 border border-emerald-500/20 text-emerald-650 dark:text-emerald-400 text-xs break-all">
                      <p className="font-bold mb-1">Development Account Created:</p>
                      <p>{setupMessage}</p>
                    </div>
                  )}

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-505 dark:text-slate-400">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={portalRole === 'admin' ? 'admin@ems.com' : 'employee@ems.com'}
                        className="w-full bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-lg py-3.5 pl-12 pr-4 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-400 dark:placeholder-slate-505"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-505 dark:text-slate-400">
                      Password
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-lg py-3.5 pl-12 pr-4 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-400 dark:placeholder-slate-505"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-650 text-white font-semibold rounded-lg shadow-sm hover:shadow-indigo-550/20 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-sm"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>

                {/* Quick Demo setup button for empty databases (only on Admin) */}
                {showSetup && portalRole === 'admin' && (
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 text-center">
                    <p className="text-xs text-slate-455 dark:text-slate-500 mb-3 flex items-center justify-center gap-1.5 font-medium">
                      <HelpCircle className="w-3.5 h-3.5" />
                      No admin account configured yet?
                    </p>
                    <button
                      onClick={handleInitialSetup}
                      className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/10 hover:bg-indigo-100/50 dark:hover:bg-indigo-500/10 px-4 py-2 rounded-lg transition-all cursor-pointer font-semibold"
                    >
                      Create Default Admin Account
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer note (Mobile only) */}
          <div className="lg:hidden text-center text-[10px] text-slate-550 dark:text-slate-650">
            <p>© 2026 GreatStack. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

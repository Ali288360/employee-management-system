import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileSpreadsheet,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';

/**
 * YouTube-style sidebar navigation component with responsive drawer on mobile
 * Conforms to the slate/indigo project specification
 */
const Navbar = () => {
  const { user, employee, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user.role === 'admin';
  
  const displayName = isAdmin 
    ? 'Admin' 
    : employee 
      ? `${employee.firstName} ${employee.lastName}` 
      : 'Employee';

  const displayRole = isAdmin 
    ? 'Administrator' 
    : employee?.designation || 'Staff';

  const avatarChar = displayName.charAt(0).toUpperCase();

  const navLinks = isAdmin
    ? [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/employees', label: 'Employees', icon: Users },
        { to: '/leaves', label: 'Leave', icon: Briefcase },
        { to: '/payslips', label: 'Payslips', icon: FileSpreadsheet },
        { to: '/profile', label: 'Settings', icon: Settings },
      ]
    : [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/attendance', label: 'Attendance', icon: Users },
        { to: '/leaves', label: 'Leave', icon: Briefcase },
        { to: '/payslips', label: 'Payslips', icon: FileSpreadsheet },
        { to: '/profile', label: 'Settings', icon: Settings },
      ];

  const activeLinkClass = ({ isActive }) =>
    `flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-650 shadow-xs'
        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
    }`;

  const SidebarContent = () => (
    <div className="flex flex-col h-full sidebar-panel py-6 px-4 text-slate-100">
      
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/35">
          <User className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-extrabold text-base tracking-tight leading-none text-white">Employee MS</h1>
          <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-1 block">
            Management System
          </span>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="flex items-center gap-3 px-3 py-4 rounded-xl bg-slate-800/30 border border-white/5 mb-8">
        <div className="w-10 h-10 rounded-lg bg-slate-700/60 border border-slate-600/50 flex items-center justify-center text-sm font-bold text-white uppercase select-none">
          {avatarChar}
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-100 truncate">{displayName}</h2>
          <span className="text-[11px] text-slate-500 truncate block mt-0.5">{displayRole}</span>
        </div>
      </div>

      {/* NAVIGATION Label */}
      <div className="px-3 mb-3">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
          Navigation
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsMobileOpen(false)}
              className={activeLinkClass}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-indigo-400" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Theme Toggler Switch */}
      <div className="px-1 mb-4">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between w-full px-3.5 py-3 rounded-lg text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-200 cursor-pointer select-none"
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
          <span className="text-[9px] bg-slate-800 text-slate-450 border border-slate-700/60 px-2 py-0.5 rounded-md uppercase font-bold tracking-wider">
            {theme}
          </span>
        </button>
      </div>

      {/* Sign Out Button (at the bottom) */}
      <div className="pt-6 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 select-none">
        <SidebarContent />
      </aside>

      {/* Mobile Top Navigation Bar */}
      <header className="lg:hidden w-full bg-[#0f172a] text-slate-100 flex items-center justify-between py-3.5 px-4 border-b border-white/5 select-none print:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm">Employee MS</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Mobile Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg border border-slate-700/80 cursor-pointer flex items-center justify-center"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>

          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 bg-slate-800 rounded-lg border border-slate-700 text-slate-300 hover:text-slate-100 cursor-pointer"
          >
            {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Sliding Sidebar Drawer Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex print:hidden">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setIsMobileOpen(false)}></div>
          <aside className="relative w-64 h-full animate-slideInRight">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
};

export default Navbar;

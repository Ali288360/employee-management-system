import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Payslips from './pages/Payslips';
import Profile from './pages/Profile';

/**
 * Main application routing configuration with layout wrapper
 */
function App() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f8fafc] text-slate-900">
      {/* Sidebar navigation */}
      {user && <Navbar />}
      
      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        <div className="flex-1">
          <Routes>
            {/* Public login route */}
            <Route path="/login" element={<Login />} />

            {/* Protected dashboard route (Both employee and admin) */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin protected Employee Management CRUD */}
            <Route
              path="/employees"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <EmployeeList />
                </ProtectedRoute>
              }
            />

            {/* Protected Attendance Management */}
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <Attendance />
                </ProtectedRoute>
              }
            />

            {/* Protected Leaves Management */}
            <Route
              path="/leaves"
              element={
                <ProtectedRoute>
                  <Leaves />
                </ProtectedRoute>
              }
            />

            {/* Protected Payslips Management */}
            <Route
              path="/payslips"
              element={
                <ProtectedRoute>
                  <Payslips />
                </ProtectedRoute>
              }
            />

            {/* Protected Profile settings */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Catch all fallback redirecting to root */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;

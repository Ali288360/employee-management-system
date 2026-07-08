import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GlassCard from '../components/GlassCard';
import { Search, UserPlus, Edit2, UserMinus, X, Check, EyeOff, AlertCircle } from 'lucide-react';

/**
 * Admin-only Employee directory CRUD
 */
const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);

  // Form states
  const [addForm, setAddForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    employeeId: '',
    department: '',
    designation: '',
    salary: '',
    phoneNumber: '',
  });

  const [editForm, setEditForm] = useState({
    email: '',
    oldEmail: '',
    firstName: '',
    lastName: '',
    department: '',
    designation: '',
    salary: '',
    phoneNumber: '',
    status: 'active',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('/employees');
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve employee list.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await axios.post('/employees', addForm);
      setIsAddOpen(false);
      // Reset form
      setAddForm({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        employeeId: '',
        department: '',
        designation: '',
        salary: '',
        phoneNumber: '',
      });
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create employee');
    }
  };

  const handleEditOpen = (emp) => {
    setCurrentEmployee(emp);
    setEditForm({
      email: emp.user?.email || '',
      oldEmail: emp.user?.email || '',
      firstName: emp.firstName,
      lastName: emp.lastName,
      department: emp.department,
      designation: emp.designation,
      salary: emp.salary,
      phoneNumber: emp.phoneNumber || '',
      status: emp.status,
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await axios.put(`/employees/${currentEmployee._id}`, editForm);
      setIsEditOpen(false);
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update employee');
    }
  };

  const handleDeactivate = async (id, name) => {
    if (window.confirm(`Are you sure you want to deactivate ${name}'s account?`)) {
      try {
        setError('');
        await axios.delete(`/employees/${id}`);
        fetchEmployees();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to deactivate employee');
      }
    }
  };

  // Filter list
  const filteredEmployees = employees.filter((emp) => {
    const query = search.toLowerCase();
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const empId = emp.employeeId.toLowerCase();
    const dept = emp.department.toLowerCase();
    return fullName.includes(query) || empId.includes(query) || dept.includes(query);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6 animate-fadeIn">
      
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">Employee Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage corporate staff records and contract metadata.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-2xl shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filters */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, employee ID, or department..."
          className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder-slate-400 shadow-sm"
        />
      </div>

      {/* Grid / Table Container */}
      <GlassCard className="overflow-x-auto p-0 border border-slate-200">
        <table className="w-full border-collapse text-left text-sm text-slate-600 min-w-[800px]">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[11px] font-bold">
            <tr>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Department & Role</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Salary</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => (
                <tr key={emp._id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-6 py-4 flex flex-col">
                    <span className="font-bold text-slate-800">{emp.firstName} {emp.lastName}</span>
                    <span className="text-xs text-slate-500 mt-0.5">{emp.user?.email}</span>
                  </td>
                  <td className="px-6 py-4 font-mono font-semibold text-slate-700">{emp.employeeId}</td>
                  <td className="px-6 py-4 flex flex-col">
                    <span className="text-slate-700 font-medium">{emp.designation}</span>
                    <span className="text-xs text-indigo-600 font-semibold mt-0.5">{emp.department}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{emp.phoneNumber || 'N/A'}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">${emp.salary.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      emp.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                        : 'bg-red-55/60 text-red-600 border border-red-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditOpen(emp)}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-indigo-600 text-slate-500 transition-all cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {emp.status === 'active' && (
                        <button
                          onClick={() => handleDeactivate(emp._id, `${emp.firstName} ${emp.lastName}`)}
                          className="p-2 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 hover:text-red-600 text-red-500 transition-all cursor-pointer"
                          title="Deactivate Staff"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-12 text-slate-500">
                  No employee records matching criteria found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </GlassCard>

      {/* ================= ADD EMPLOYEE MODAL ================= */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 md:p-8 border border-white/10 max-h-[90vh] overflow-y-auto animate-fadeIn relative">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-6">Create New Employee</h3>

            <form onSubmit={handleAddSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">First Name *</label>
                  <input
                    type="text"
                    value={addForm.firstName}
                    onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={addForm.lastName}
                    onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password *</label>
                  <input
                    type="password"
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Employee ID *</label>
                  <input
                    type="text"
                    value={addForm.employeeId}
                    onChange={(e) => setAddForm({ ...addForm, employeeId: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Department *</label>
                  <input
                    type="text"
                    value={addForm.department}
                    onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Designation *</label>
                  <input
                    type="text"
                    value={addForm.designation}
                    onChange={(e) => setAddForm({ ...addForm, designation: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Basic Salary ($) *</label>
                  <input
                    type="number"
                    value={addForm.salary}
                    onChange={(e) => setAddForm({ ...addForm, salary: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={addForm.phoneNumber}
                    onChange={(e) => setAddForm({ ...addForm, phoneNumber: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 border border-white/10 bg-white/5 transition-all text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium shadow-md hover:from-indigo-500 transition-all text-sm cursor-pointer"
                >
                  Register Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT EMPLOYEE MODAL ================= */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 md:p-8 border border-white/10 max-h-[90vh] overflow-y-auto animate-fadeIn relative">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-6">Edit Employee Record</h3>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">First Name</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Last Name</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Department</label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Designation</label>
                  <input
                    type="text"
                    value={editForm.designation}
                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Basic Salary ($)</label>
                  <input
                    type="number"
                    value={editForm.salary}
                    onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Account Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 border border-white/10 bg-white/5 transition-all text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium shadow-md hover:from-indigo-500 transition-all text-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;

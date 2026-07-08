import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { FileSpreadsheet, Printer, Plus, AlertCircle, Eye, X, Download } from 'lucide-react';

/**
 * Payslips Generation, history and printable preview
 */
const Payslips = () => {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';

  const [payslips, setPayslips] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Modal print state
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  // Generate Payslip Form State
  const [form, setForm] = useState({
    employeeId: '',
    month: '',
    allowances: 0,
    deductions: 0,
  });
  
  const [selectedEmpBasic, setSelectedEmpBasic] = useState(0);

  useEffect(() => {
    fetchPayslips();
    if (isAdmin) {
      fetchEmployees();
    }
  }, []);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('/payslips');
      setPayslips(res.data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve payslip listings.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('/employees');
      // Only active employees
      setEmployees(res.data.filter((e) => e.status === 'active'));
    } catch (err) {
      console.error(err);
    }
  };

  // Sync basic salary when employee is selected in form
  useEffect(() => {
    if (form.employeeId) {
      const emp = employees.find((e) => e._id === form.employeeId);
      setSelectedEmpBasic(emp ? emp.salary : 0);
    } else {
      setSelectedEmpBasic(0);
    }
  }, [form.employeeId, employees]);

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    if (!form.employeeId || !form.month) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      await axios.post('/payslips', form);
      setForm({ employeeId: '', month: '', allowances: 0, deductions: 0 });
      fetchPayslips();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate payslip');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getMonthName = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 animate-fadeIn print:p-0 print:bg-white print:text-black">
      
      {/* Hide controls when printing */}
      <div className="space-y-8 print:hidden">
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Title */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">Payroll Registry</h1>
          <p className="text-slate-500 text-sm mt-1">
            {isAdmin 
              ? 'Compile monthly staff allowances, generate payslips, and overview operational accounts.' 
              : 'Access, download, or print your monthly work contract payslip statements.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Generate Form (Admin) / Info Card (Employee) */}
          <div className="space-y-6 lg:col-span-1">
            {isAdmin ? (
              <GlassCard className="space-y-5">
                <h2 className="text-lg font-bold text-slate-800">Compile Payslip</h2>
                
                <form onSubmit={handleGenerateSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Employee</label>
                    <select
                      value={form.employeeId}
                      onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 text-sm cursor-pointer"
                      required
                    >
                      <option value="">-- Choose Employee --</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.firstName} {emp.lastName} ({emp.employeeId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Month</label>
                    <input
                      type="month"
                      value={form.month}
                      onChange={(e) => setForm({ ...form, month: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-slate-850 focus:outline-none focus:border-indigo-500 text-sm cursor-pointer"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Allowances ($)</label>
                      <input
                        type="number"
                        value={form.allowances}
                        onChange={(e) => setForm({ ...form, allowances: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Deductions ($)</label>
                      <input
                        type="number"
                        value={form.deductions}
                        onChange={(e) => setForm({ ...form, deductions: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-slate-800 focus:outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>
                  </div>

                  {selectedEmpBasic > 0 && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-505 font-medium">Basic Salary:</span>
                        <span className="font-semibold text-slate-700">${selectedEmpBasic.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200/80 pt-2 font-bold text-slate-800">
                        <span>Computed Net:</span>
                        <span className="text-indigo-600 font-extrabold">
                          ${(selectedEmpBasic + Number(form.allowances) - Number(form.deductions)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{actionLoading ? 'Compiling...' : 'Generate Payslip'}</span>
                  </button>
                </form>
              </GlassCard>
            ) : (
              <GlassCard className="space-y-4 text-center p-8">
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileSpreadsheet className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Personal Statements</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  View, audit and print your detailed salary summaries. All figures are formatted according to official employment contracts.
                </p>
              </GlassCard>
            )}
          </div>

          {/* Right Column: Payslip history table */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="overflow-x-auto p-0 border border-slate-200">
              <table className="w-full border-collapse text-left text-sm text-slate-600 min-w-[500px]">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[11px] font-bold">
                  <tr>
                    {isAdmin && <th className="px-6 py-4">Employee</th>}
                    <th className="px-6 py-4">Month</th>
                    <th className="px-6 py-4">Net Salary</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payslips.length > 0 ? (
                    payslips.map((slip) => (
                      <tr key={slip._id} className="hover:bg-slate-50/50 transition-all">
                        {isAdmin && (
                          <td className="px-6 py-4 flex flex-col">
                            <span className="font-bold text-slate-800">
                              {slip.employee?.firstName} {slip.employee?.lastName}
                            </span>
                            <span className="text-xs text-slate-500 mt-0.5">{slip.employee?.employeeId}</span>
                          </td>
                        )}
                        <td className="px-6 py-4 font-mono font-semibold text-slate-700">
                          {getMonthName(slip.month)}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-850">
                          ${slip.netSalary.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase">
                            {slip.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedPayslip(slip)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-indigo-650 transition-all text-xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isAdmin ? '5' : '4'} className="text-center py-12 text-slate-500">
                        No payslips have been compiled.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </GlassCard>
          </div>

        </div>
      </div>

      {/* ================= PRINT PREVIEW MODAL & PRINT VIEW ================= */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm print:relative print:inset-auto print:bg-white print:p-0 print:block">
          <div className="glass-panel w-full max-w-3xl rounded-3xl p-6 md:p-8 border border-white/10 bg-slate-950 max-h-[90vh] overflow-y-auto relative animate-fadeIn print:border-none print:shadow-none print:bg-white print:text-black print:max-h-none print:overflow-visible">
            
            {/* Close & Print buttons - Hide on print */}
            <div className="absolute top-4 right-4 flex items-center gap-2 print:hidden">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-md"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-slate-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Payslip Structure */}
            <div className="bg-slate-900/40 p-6 md:p-8 rounded-2xl border border-white/5 print:bg-white print:text-black print:p-0 print:border-none">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-6 print:border-black print:text-black">
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent print:text-black print:bg-none print:text-2xl">
                    CORPORATE EMS SOLUTIONS LTD
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 print:text-black">123 Corporate Blvd, Ste 500, New York, NY</p>
                </div>
                <div className="mt-4 sm:mt-0 text-left sm:text-right">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 print:text-black">Payment Receipt</span>
                  <h3 className="text-lg font-mono font-bold text-slate-200 mt-0.5 print:text-black">
                    {selectedPayslip.month}
                  </h3>
                </div>
              </div>

              {/* Employee & Payslip Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-b border-white/5 text-xs print:border-black print:text-black">
                <div>
                  <span className="text-slate-500 font-semibold block">Employee Name</span>
                  <span className="font-bold text-slate-200 mt-1 block print:text-black">
                    {selectedPayslip.employee?.firstName} {selectedPayslip.employee?.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Employee ID</span>
                  <span className="font-mono font-bold text-slate-200 mt-1 block print:text-black">
                    {selectedPayslip.employee?.employeeId}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Designation</span>
                  <span className="font-medium text-slate-200 mt-1 block print:text-black">
                    {selectedPayslip.employee?.designation}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Department</span>
                  <span className="font-medium text-slate-200 mt-1 block print:text-black">
                    {selectedPayslip.employee?.department}
                  </span>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 text-xs text-slate-300 print:text-black">
                
                {/* Earnings */}
                <div className="space-y-3">
                  <h4 className="font-bold text-indigo-400 border-b border-white/5 pb-2 uppercase tracking-wide print:text-black print:border-black">
                    Earnings Breakdown
                  </h4>
                  <div className="flex justify-between">
                    <span>Basic Salary</span>
                    <span className="font-semibold text-slate-200 print:text-black">
                      ${selectedPayslip.basicSalary.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Performance Allowances</span>
                    <span className="font-semibold text-slate-200 print:text-black">
                      ${selectedPayslip.allowances.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-3">
                  <h4 className="font-bold text-rose-400 border-b border-white/5 pb-2 uppercase tracking-wide print:text-black print:border-black">
                    Deductions Breakdown
                  </h4>
                  <div className="flex justify-between">
                    <span>Provident Fund / Tax Ded.</span>
                    <span className="font-semibold text-slate-200 print:text-black">
                      ${selectedPayslip.deductions.toLocaleString()}
                    </span>
                  </div>
                </div>

              </div>

              {/* Net Salary Summary */}
              <div className="mt-6 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/10 flex justify-between items-center text-sm print:bg-white print:border-black print:text-black">
                <div>
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider print:text-black">Net Salary Paid</span>
                  <p className="text-slate-500 text-[10px] mt-0.5 print:text-black">Calculated: Basic + Allowances - Deductions</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-indigo-300 print:text-black">
                    ${selectedPayslip.netSalary.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-12 mt-16 pt-6 text-[10px] text-slate-500 border-t border-white/5 print:border-black print:text-black">
                <div className="text-center">
                  <div className="border-b border-slate-700 mx-auto w-32 h-6 print:border-black"></div>
                  <p className="mt-2 font-medium">Employee Signature</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-slate-700 mx-auto w-32 h-6 print:border-black"></div>
                  <p className="mt-2 font-medium">Authorized Registrar</p>
                </div>
              </div>

            </div>

            {/* Print styling injection */}
            <style dangerouslySetInnerHTML={{__html: `
              @media print {
                body {
                  background: white !important;
                  color: black !important;
                }
                nav, footer, .print\\:hidden {
                  display: none !important;
                }
                .glass-panel {
                  background: white !important;
                  border: none !important;
                  box-shadow: none !important;
                  color: black !important;
                }
              }
            `}} />

          </div>
        </div>
      )}
    </div>
  );
};

export default Payslips;

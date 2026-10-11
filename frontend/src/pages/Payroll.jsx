// frontend/src/pages/Payroll.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import {
  Calculator,
  Printer,
  CheckCircle,
  Clock,
  DollarSign,
  FileSpreadsheet,
  AlertCircle,
  Building,
  User,
  ShieldCheck,
  Send,
  Coins
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const Payroll = () => {
  const { user, formatCurrency, formatDate, showToast, confirmAction, settings } = useAuth();
  const isAdminOrHr = user && (user.role === 'admin' || user.role === 'hr');

  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calculation Modal state
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
  const [calcScope, setCalcScope] = useState('all'); // 'all', 'department', 'individual'
  const [calcMonth, setCalcMonth] = useState(new Date().getMonth() + 1);
  const [calcYear, setCalcYear] = useState(new Date().getFullYear());
  const [calcDeptId, setCalcDeptId] = useState('');
  const [calcEmpId, setCalcEmpId] = useState('');

  // A5 Payslip Modal state
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [activePayslip, setActivePayslip] = useState(null);

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const [pRes, deptRes, empRes] = await Promise.all([
        api.get('/payroll/periods'),
        api.get('/employees/departments'),
        api.get('/employees')
      ]);

      if (pRes.success) {
        setPeriods(pRes.data);
        if (pRes.data.length > 0 && !selectedPeriod) {
          loadPeriodPayslips(pRes.data[0].id);
        }
      }
      if (deptRes.success) setDepartments(deptRes.data);
      if (empRes.success) setEmployees(empRes.data);
    } catch (err) {
      showToast('Error', 'Failed to fetch payroll records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPeriodPayslips = async (periodId) => {
    try {
      const res = await api.get(`/payroll/periods/${periodId}/payslips`);
      if (res.success) {
        setSelectedPeriod(res.data.period);
        setPayslips(res.data.payslips);
      }
    } catch (err) {
      showToast('Error', 'Failed to load period payslips', 'error');
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  // Run Calculation
  const handleCalculatePayroll = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/payroll/calculate', {
        month: calcMonth,
        year: calcYear,
        scope: calcScope,
        department_id: calcDeptId,
        employee_id: calcEmpId
      });

      if (res.success) {
        showToast('Payroll Processed', res.message, 'success');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setIsCalcModalOpen(false);
        fetchPeriods();
        if (res.data?.period_id) {
          loadPeriodPayslips(res.data.period_id);
        }
      }
    } catch (err) {
      showToast('Calculation Failed', err.message || 'Error processing payroll', 'error');
    }
  };

  // Update Period Status (Approve / Mark as Paid)
  const handleStatusChange = (status) => {
    if (!selectedPeriod) return;

    confirmAction({
      title: status === 'Paid' ? 'Mark Payroll as PAID?' : 'Approve Payroll Period?',
      message: status === 'Paid'
        ? `This will mark all payslips in ${selectedPeriod.title} as PAID, and automatically record loan deductions towards active loan schedules.`
        : `Are you sure you want to approve ${selectedPeriod.title}?`,
      confirmText: `Yes, Set to ${status}`,
      onConfirm: async () => {
        try {
          const res = await api.put(`/payroll/periods/${selectedPeriod.id}/status`, { status });
          if (res.success) {
            showToast('Status Updated', `Payroll period is now ${status}`, 'success');
            loadPeriodPayslips(selectedPeriod.id);
            fetchPeriods();
          }
        } catch (err) {
          showToast('Error', err.message || 'Failed to update status', 'error');
        }
      }
    });
  };

  // Open A5 Payslip Modal
  const openPayslip = async (payslipId) => {
    try {
      const res = await api.get(`/payroll/payslips/${payslipId}`);
      if (res.success) {
        setActivePayslip(res.data.payslip);
        setIsPayslipModalOpen(true);
      }
    } catch (err) {
      showToast('Error', 'Failed to retrieve payslip', 'error');
    }
  };

  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.classList.remove('printing-payslip');
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const handlePrint = () => {
    document.body.classList.add('printing-payslip');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-payslip');
    }, 1500);
  };

  const columns = [
    {
      header: 'Employee',
      accessor: 'first_name',
      sortable: true,
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            {row.first_name} {row.last_name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {row.emp_code} • {row.cpr_no} ({row.is_gcc_citizen ? 'Citizen' : 'Expat'})
          </div>
        </div>
      )
    },
    {
      header: 'Basic Salary',
      accessor: 'basic_salary',
      sortable: true,
      render: (row) => formatCurrency(row.basic_salary)
    },
    {
      header: 'Allowances (HR/Car/Mob)',
      accessor: 'housing_allowance',
      render: (row) => {
        const allowances = parseFloat(row.housing_allowance || 0) + parseFloat(row.transport_allowance || 0) + parseFloat(row.car_allowance || 0) + parseFloat(row.mobile_allowance || 0) + parseFloat(row.food_allowance || 0) + parseFloat(row.other_allowance || 0);
        return formatCurrency(allowances);
      }
    },
    {
      header: 'Overtime (OT)',
      accessor: 'ot_amount',
      render: (row) => {
        const ot = parseFloat(row.ot_amount || 0);
        return ot > 0 ? (
          <div>
            <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>+{formatCurrency(ot)}</span>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{row.ot_hours} hrs</div>
          </div>
        ) : (
          '—'
        );
      }
    },
    {
      header: 'Gross Earnings',
      accessor: 'total_earnings',
      sortable: true,
      render: (row) => <strong style={{ color: 'var(--primary)' }}>{formatCurrency(row.total_earnings)}</strong>
    },
    {
      header: 'GOSI Deduction',
      accessor: 'gosi_employee_deduction',
      render: (row) => (
        <div>
          <span style={{ color: 'var(--danger)', fontWeight: 600 }}>-{formatCurrency(row.gosi_employee_deduction)}</span>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Co: {formatCurrency(row.gosi_employer_contribution)}</div>
        </div>
      )
    },
    {
      header: 'Loan / Deductions',
      accessor: 'loan_deduction',
      render: (row) => {
        const loan = parseFloat(row.loan_deduction || 0);
        const abs = parseFloat(row.absent_deduction || 0);
        return (
          <div style={{ fontSize: '0.8rem' }}>
            {loan > 0 && <div>Loan: <span style={{ color: 'var(--danger)' }}>-{formatCurrency(loan)}</span></div>}
            {abs > 0 && <div>Abs: <span style={{ color: 'var(--danger)' }}>-{formatCurrency(abs)}</span></div>}
            {loan === 0 && abs === 0 && <span style={{ color: 'var(--text-muted)' }}>—</span>}
          </div>
        );
      }
    },
    {
      header: 'Net Salary (BHD)',
      accessor: 'net_salary',
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#059669', fontFamily: 'var(--font-display)' }}>
          {formatCurrency(row.net_salary)}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'payment_status',
      render: (row) => (
        <span className={`badge ${row.payment_status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
          {row.payment_status}
        </span>
      )
    },
    {
      header: 'A5 Payslip',
      render: (row) => (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => openPayslip(row.id)}
          title="Open A5 Printable Payslip"
        >
          <Printer size={14} /> Print A5
        </button>
      )
    }
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.25rem', alignItems: 'center' }}>
        <div className="page-title-group">
          <h2>Payroll Processing & A5 Payslip Generator</h2>
          <p>Bahrain Labor Law compliant calculations: GOSI, LMRA, Overtime multipliers, Loans & Allowances</p>
        </div>

        <div className="header-action-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Period Selector Tabs */}
          {periods.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', alignItems: 'center' }}>
              {periods.map((p) => {
                const isSelected = selectedPeriod?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => loadPeriodPayslips(p.id)}
                    className="btn"
                    style={{
                      background: isSelected ? 'var(--primary)' : '#ffffff',
                      color: isSelected ? '#ffffff' : 'var(--text-primary)',
                      border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      boxShadow: isSelected ? '0 2px 6px rgba(37,99,235,0.25)' : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '0.45rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontSize: '0.825rem', fontWeight: 700, lineHeight: 1.2 }}>{p.title}</div>
                    <div style={{ fontSize: '0.72rem', opacity: isSelected ? 0.92 : 0.75, display: 'flex', gap: '0.4rem', marginTop: '0.15rem' }}>
                      <span>{p.total_employees} Employees</span>
                      <span>• {formatCurrency(p.total_net)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {isAdminOrHr && (
            <button className="btn btn-gold" onClick={() => setIsCalcModalOpen(true)} style={{ whiteSpace: 'nowrap' }}>
              <Calculator size={16} /> Run Salary Calculation Engine
            </button>
          )}
        </div>
      </div>

      {/* Selected Period Summary Banner */}
      {selectedPeriod && (
        <div className="card" style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--text-primary)' }}>{selectedPeriod.title}</h3>
                <span className={`badge ${selectedPeriod.status === 'Paid' ? 'badge-success' : selectedPeriod.status === 'Approved' ? 'badge-info' : 'badge-warning'}`}>
                  {selectedPeriod.status}
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Period: {formatDate(selectedPeriod.start_date)} to {formatDate(selectedPeriod.end_date)} • Processed for {selectedPeriod.total_employees} staff members
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Total Gross</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(selectedPeriod.total_gross)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Total Deductions</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--danger)' }}>-{formatCurrency(selectedPeriod.total_deductions)}</div>
              </div>
              <div style={{ background: '#ffffff', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 800 }}>Total Net Payable</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
                  {formatCurrency(selectedPeriod.total_net)}
                </div>
              </div>

              {isAdminOrHr && selectedPeriod.status !== 'Paid' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {selectedPeriod.status === 'Draft' || selectedPeriod.status === 'Processing' ? (
                    <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange('Approved')}>
                      <CheckCircle size={14} /> Approve Payroll
                    </button>
                  ) : (
                    <button className="btn btn-success btn-sm" onClick={() => handleStatusChange('Paid')}>
                      <DollarSign size={14} /> Disburse & Mark Paid
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payslips DataTable */}
      <DataTable
        columns={columns}
        data={payslips}
        searchPlaceholder="Search payslips by employee, CPR, status..."
      />

      {/* 1. CALCULATE PAYROLL ENGINE MODAL */}
      <Modal
        isOpen={isCalcModalOpen}
        onClose={() => setIsCalcModalOpen(false)}
        title="Execute Salary Calculation Engine"
        size="default"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsCalcModalOpen(false)}>Cancel</button>
            <button className="btn btn-gold" onClick={handleCalculatePayroll}>
              <Calculator size={15} /> Calculate & Generate Payslips
            </button>
          </>
        }
      >
        <form onSubmit={handleCalculatePayroll}>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.35rem' }}>
              Bahrain Labor Law Rule Compliance
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Engine automatically factors in: Basic Salary + Housing/Transport/Car allowances, Attendance punches, Overtime multipliers (1.25x day / 1.50x weekend), GOSI (Citizen {settings.gosi_citizen_emp_rate}% vs Expat {settings.gosi_expat_emp_rate}%), LMRA fee ({settings.lmra_monthly_fee} BD), and active Loan EMI repayments.
            </p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Payroll Month</label>
              <select
                className="form-control"
                value={calcMonth}
                onChange={(e) => setCalcMonth(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <option key={m} value={m}>
                    {new Date(2026, m - 1, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">Year</label>
              <select
                className="form-control"
                value={calcYear}
                onChange={(e) => setCalcYear(Number(e.target.value))}
              >
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">Calculation Scope</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input
                  type="radio"
                  name="scope"
                  value="all"
                  checked={calcScope === 'all'}
                  onChange={() => setCalcScope('all')}
                />
                <span>All Active Employees ({employees.length})</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input
                  type="radio"
                  name="scope"
                  value="department"
                  checked={calcScope === 'department'}
                  onChange={() => setCalcScope('department')}
                />
                <span>Department-wise</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input
                  type="radio"
                  name="scope"
                  value="individual"
                  checked={calcScope === 'individual'}
                  onChange={() => setCalcScope('individual')}
                />
                <span>Individual Employee</span>
              </label>
            </div>
          </div>

          {calcScope === 'department' && (
            <div className="form-group">
              <label className="form-label required">Select Department</label>
              <select
                className="form-control"
                required
                value={calcDeptId}
                onChange={(e) => setCalcDeptId(e.target.value)}
              >
                <option value="">-- Choose Department --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}

          {calcScope === 'individual' && (
            <div className="form-group">
              <label className="form-label required">Select Employee</label>
              <select
                className="form-control"
                required
                value={calcEmpId}
                onChange={(e) => setCalcEmpId(e.target.value)}
              >
                <option value="">-- Choose Employee --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.emp_code} - {emp.first_name} {emp.last_name}</option>
                ))}
              </select>
            </div>
          )}
        </form>
      </Modal>

      {/* 2. DEDICATED A5 PAYSLIP PRINTABLE MODAL */}
      <Modal
        isOpen={isPayslipModalOpen}
        onClose={() => setIsPayslipModalOpen(false)}
        title="Official A5 Salary Payslip"
        size="lg"
        footer={
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              Standard A5 Laser / Thermal Print Layout
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setIsPayslipModalOpen(false)}>Close</button>
              <button className="btn btn-primary" onClick={handlePrint}>
                <Printer size={15} /> Print A5 Payslip
              </button>
            </div>
          </div>
        }
      >
        {activePayslip && (
          <div className="payslip-a5-container">
            {/* Payslip Header */}
            <div className="payslip-header-grid">
              <div className="payslip-company-info">
                <h2>{settings.company_name}</h2>
                <p>{settings.company_address}</p>
                <p>CR No: {settings.cr_no} | Tel: {settings.company_phone} | VAT: {settings.tax_number || 'Exempt'}</p>
              </div>

              <div className="payslip-title-badge">
                <h3>SALARY PAYSLIP</h3>
                <div className="payslip-period-pill">
                  {activePayslip.period_title}
                </div>
              </div>
            </div>

            {/* Employee Metadata Table */}
            <table className="payslip-emp-meta-table">
              <tbody>
                <tr>
                  <td className="meta-label">Employee Name:</td>
                  <td><strong>{activePayslip.first_name} {activePayslip.last_name}</strong></td>
                  <td className="meta-label">Employee Code:</td>
                  <td><strong>{activePayslip.emp_code}</strong></td>
                </tr>
                <tr>
                  <td className="meta-label">CPR / National ID:</td>
                  <td>{activePayslip.cpr_no}</td>
                  <td className="meta-label">Department:</td>
                  <td>{activePayslip.department_name}</td>
                </tr>
                <tr>
                  <td className="meta-label">Designation:</td>
                  <td>{activePayslip.designation_name}</td>
                  <td className="meta-label">Date of Joining:</td>
                  <td>{formatDate(activePayslip.date_of_joining)}</td>
                </tr>
                <tr>
                  <td className="meta-label">Bank & Account:</td>
                  <td>{activePayslip.bank_name || 'NBB'} ({activePayslip.bank_account_no || '001234567890'})</td>
                  <td className="meta-label">GOSI / LMRA No:</td>
                  <td>{activePayslip.gosi_no || 'Registered'} / {activePayslip.lmra_no || 'N/A'}</td>
                </tr>
              </tbody>
            </table>

            {/* Side-by-Side Breakdown Table */}
            <div className="payslip-breakdown-grid">
              {/* Earnings Box */}
              <div className="breakdown-box">
                <div className="breakdown-box-title">Earnings ({settings.currency})</div>
                <table className="breakdown-table">
                  <tbody>
                    <tr>
                      <td>Basic Salary</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(activePayslip.basic_salary)}</td>
                    </tr>
                    {parseFloat(activePayslip.housing_allowance) > 0 && (
                      <tr>
                        <td>Housing Allowance (HR)</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(activePayslip.housing_allowance)}</td>
                      </tr>
                    )}
                    {parseFloat(activePayslip.transport_allowance) > 0 && (
                      <tr>
                        <td>Transport Allowance</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(activePayslip.transport_allowance)}</td>
                      </tr>
                    )}
                    {parseFloat(activePayslip.car_allowance) > 0 && (
                      <tr>
                        <td>Car Allowance</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(activePayslip.car_allowance)}</td>
                      </tr>
                    )}
                    {parseFloat(activePayslip.mobile_allowance) > 0 && (
                      <tr>
                        <td>Mobile Allowance</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(activePayslip.mobile_allowance)}</td>
                      </tr>
                    )}
                    {parseFloat(activePayslip.food_allowance) > 0 && (
                      <tr>
                        <td>Food Allowance</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(activePayslip.food_allowance)}</td>
                      </tr>
                    )}
                    {parseFloat(activePayslip.ot_amount) > 0 && (
                      <>
                        {parseFloat(activePayslip.day_ot_amount || 0) > 0 && (
                          <tr>
                            <td>Day Overtime ({activePayslip.day_ot_hours} hrs @ 1.25x)</td>
                            <td style={{ textAlign: 'right', color: 'var(--accent-gold)' }}>+{formatCurrency(activePayslip.day_ot_amount)}</td>
                          </tr>
                        )}
                        {parseFloat(activePayslip.night_ot_amount || 0) > 0 && (
                          <tr>
                            <td>Night OT - Art. 54 ({activePayslip.night_ot_hours} hrs @ 1.50x)</td>
                            <td style={{ textAlign: 'right', color: '#7c3aed' }}>+{formatCurrency(activePayslip.night_ot_amount)}</td>
                          </tr>
                        )}
                        {parseFloat(activePayslip.holiday_ot_amount || 0) > 0 && (
                          <tr>
                            <td>Holiday / Rest-Day OT ({activePayslip.holiday_ot_hours} hrs @ 1.50x)</td>
                            <td style={{ textAlign: 'right', color: '#b91c1c' }}>+{formatCurrency(activePayslip.holiday_ot_amount)}</td>
                          </tr>
                        )}
                        {parseFloat(activePayslip.day_ot_amount || 0) === 0 && parseFloat(activePayslip.night_ot_amount || 0) === 0 && parseFloat(activePayslip.holiday_ot_amount || 0) === 0 && (
                          <tr>
                            <td>Overtime Pay ({activePayslip.ot_hours} hrs)</td>
                            <td style={{ textAlign: 'right', color: 'var(--accent-gold)' }}>+{formatCurrency(activePayslip.ot_amount)}</td>
                          </tr>
                        )}
                      </>
                    )}
                    {parseFloat(activePayslip.bonus) > 0 && (
                      <tr>
                        <td>Bonus / Performance</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(activePayslip.bonus)}</td>
                      </tr>
                    )}
                    <tr className="breakdown-total-row">
                      <td><strong>TOTAL GROSS EARNINGS</strong></td>
                      <td style={{ textAlign: 'right', color: 'var(--primary)' }}><strong>{formatCurrency(activePayslip.total_earnings)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Deductions Box */}
              <div className="breakdown-box">
                <div className="breakdown-box-title">Deductions ({settings.currency})</div>
                <table className="breakdown-table">
                  <tbody>
                    <tr>
                      <td>GOSI Social Insurance ({activePayslip.is_gcc_citizen ? 'Citizen 7%' : 'Expat 1%'})</td>
                      <td style={{ textAlign: 'right', color: 'var(--danger)' }}>-{formatCurrency(activePayslip.gosi_employee_deduction)}</td>
                    </tr>
                    {parseFloat(activePayslip.loan_deduction) > 0 && (
                      <tr>
                        <td>Loan / Salary Advance Installment</td>
                        <td style={{ textAlign: 'right', color: 'var(--danger)' }}>-{formatCurrency(activePayslip.loan_deduction)}</td>
                      </tr>
                    )}
                    {parseFloat(activePayslip.absent_deduction) > 0 && (
                      <tr>
                        <td>Absenteeism Deduction ({activePayslip.absent_days} days)</td>
                        <td style={{ textAlign: 'right', color: 'var(--danger)' }}>-{formatCurrency(activePayslip.absent_deduction)}</td>
                      </tr>
                    )}
                    {parseFloat(activePayslip.other_deduction) > 0 && (
                      <tr>
                        <td>Other Deductions</td>
                        <td style={{ textAlign: 'right', color: 'var(--danger)' }}>-{formatCurrency(activePayslip.other_deduction)}</td>
                      </tr>
                    )}
                    <tr className="breakdown-total-row">
                      <td><strong>TOTAL DEDUCTIONS</strong></td>
                      <td style={{ textAlign: 'right', color: 'var(--danger)' }}><strong>-{formatCurrency(activePayslip.total_deductions)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Net Amount Box */}
            <div className="payslip-net-box">
              <div className="net-label">NET AMOUNT TO BE PAID:</div>
              <div className="net-amount-highlight">{formatCurrency(activePayslip.net_salary)}</div>
            </div>

            {/* Attendance Snapshot */}
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
              <span>Present Days: <strong>{activePayslip.present_days}</strong></span>
              <span>Absent Days: <strong>{activePayslip.absent_days}</strong></span>
              <span>OT Hours: <strong>{activePayslip.ot_hours} hrs</strong></span>
              <span>Payment Mode: <strong>{activePayslip.payment_method || 'Bank Transfer / SBP'}</strong></span>
            </div>

            {/* Signatures */}
            <div className="payslip-signatures">
              <div className="sig-block">
                <div>Authorized Signatory</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>HR & Finance Department</div>
              </div>
              <div className="sig-block">
                <div>Employee Signature</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Received & Accepted</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

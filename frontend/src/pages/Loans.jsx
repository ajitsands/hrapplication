// frontend/src/pages/Loans.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import {
  Coins,
  Plus,
  CheckCircle,
  Clock,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const Loans = () => {
  const { user, formatCurrency, showToast, confirmAction, settings } = useAuth();
  const isAdminOrHr = user && (user.role === 'admin' || user.role === 'hr' || user.role === 'super_admin' || user.role === 'superadmin');

  const [loans, setLoans] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Loan Modal
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [loanForm, setLoanForm] = useState({
    employee_id: '',
    loan_title: 'Personal Emergency Advance',
    loan_amount: 500,
    monthly_installment: 50,
    total_installments: 10,
    start_month: new Date().getMonth() + 1,
    start_year: new Date().getFullYear(),
    reason: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lRes, empRes] = await Promise.all([
        api.get('/loans'),
        api.get('/employees')
      ]);

      if (lRes.success) setLoans(lRes.data);
      if (empRes.success) setEmployees(empRes.data);
    } catch (err) {
      showToast('Error', 'Failed to load loans records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAmountOrInstallmentChange = (amt, inst) => {
    const amount = parseFloat(amt || 0);
    const installments = parseInt(inst || 1, 10);
    const monthly = installments > 0 ? Math.round((amount / installments) * 1000) / 1000 : amount;

    setLoanForm((prev) => ({
      ...prev,
      loan_amount: amount,
      total_installments: installments,
      monthly_installment: monthly
    }));
  };

  const handleLoanSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!loanForm.employee_id) {
        showToast('Error', 'Please select an employee', 'error');
        return;
      }

      const res = await api.post('/loans', loanForm);
      if (res.success) {
        showToast('Loan Registered', 'Employee loan schedule created!', 'success');
        confetti({ particleCount: 70, spread: 50 });
        setIsLoanModalOpen(false);
        fetchData();
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to create loan', 'error');
    }
  };

  const columns = [
    {
      header: 'Employee',
      accessor: 'first_name',
      sortable: true,
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700 }}>{row.first_name} {row.last_name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.emp_code} • {row.department_name}</div>
        </div>
      )
    },
    {
      header: 'Loan Title',
      accessor: 'loan_title',
      render: (row) => <strong>{row.loan_title}</strong>
    },
    {
      header: 'Total Loan',
      accessor: 'loan_amount',
      sortable: true,
      render: (row) => <strong style={{ color: 'var(--primary)' }}>{formatCurrency(row.loan_amount)}</strong>
    },
    {
      header: 'Monthly EMI',
      accessor: 'monthly_installment',
      render: (row) => <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{formatCurrency(row.monthly_installment)}/mo</span>
    },
    {
      header: 'Installments Progress',
      accessor: 'paid_installments',
      render: (row) => {
        const pct = row.total_installments > 0 ? Math.round((row.paid_installments / row.total_installments) * 100) : 0;
        return (
          <div style={{ width: '130px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
              <span>{row.paid_installments}/{row.total_installments} Paid</span>
              <span>{pct}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginTop: '0.2rem' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: 'var(--success)' }} />
            </div>
          </div>
        );
      }
    },
    {
      header: 'Remaining Balance',
      accessor: 'remaining_amount',
      sortable: true,
      render: (row) => <strong style={{ color: '#b91c1c' }}>{formatCurrency(row.remaining_amount)}</strong>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`badge ${row.status === 'Active' ? 'badge-primary' : row.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
          {row.status}
        </span>
      )
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h2>Loans & Salary Advances</h2>
          <p>Manage employee loans, EMI installment schedules, and automated monthly payroll deductions</p>
        </div>

        {isAdminOrHr && (
          <div className="header-action-group">
            <button className="btn btn-primary" onClick={() => setIsLoanModalOpen(true)}>
              <Plus size={16} /> Disburse Loan / Advance
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={loans}
        searchPlaceholder="Search loans by employee, title, status..."
      />

      {/* NEW LOAN MODAL */}
      <Modal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        title="Register Employee Loan / Salary Advance"
        size="default"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsLoanModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleLoanSubmit}>Approve & Disburse</button>
          </>
        }
      >
        <form onSubmit={handleLoanSubmit}>
          <div className="form-group">
            <label className="form-label required">Select Employee</label>
            <select
              className="form-control"
              required
              value={loanForm.employee_id}
              onChange={(e) => setLoanForm({ ...loanForm, employee_id: e.target.value })}
            >
              <option value="">-- Choose Employee --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.emp_code} - {emp.first_name} {emp.last_name} (Basic: {formatCurrency(emp.basic_salary)})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label required">Loan Purpose / Title</label>
            <input
              type="text"
              className="form-control"
              required
              value={loanForm.loan_title}
              onChange={(e) => setLoanForm({ ...loanForm, loan_title: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Loan Principal ({settings.currency})</label>
              <input
                type="number"
                step="0.001"
                className="form-control"
                required
                value={loanForm.loan_amount}
                onChange={(e) => handleAmountOrInstallmentChange(e.target.value, loanForm.total_installments)}
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Number of Installments (Months)</label>
              <input
                type="number"
                min="1"
                className="form-control"
                required
                value={loanForm.total_installments}
                onChange={(e) => handleAmountOrInstallmentChange(loanForm.loan_amount, e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Auto-Calculated Monthly EMI Deduction</label>
            <input
              type="text"
              className="form-control"
              readOnly
              value={formatCurrency(loanForm.monthly_installment)}
              style={{ background: '#f8fafc', fontWeight: 800, color: 'var(--danger)' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes & Justification</label>
            <textarea
              className="form-control"
              rows={2}
              value={loanForm.reason}
              onChange={(e) => setLoanForm({ ...loanForm, reason: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

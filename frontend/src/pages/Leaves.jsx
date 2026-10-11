// frontend/src/pages/Leaves.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import {
  CalendarDays,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const Leaves = () => {
  const { user, formatDate, showToast, confirmAction } = useAuth();
  const isAdminOrHr = user && (user.role === 'admin' || user.role === 'hr');

  const [leaves, setLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Apply Modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    employee_id: '',
    leave_type_id: 1,
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date().toISOString().slice(0, 10),
    total_days: 1,
    reason: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lRes, ltRes, empRes] = await Promise.all([
        api.get('/leaves'),
        api.get('/leaves/types'),
        api.get('/employees')
      ]);

      if (lRes.success) setLeaves(lRes.data);
      if (ltRes.success) setLeaveTypes(ltRes.data);
      if (empRes.success) setEmployees(empRes.data);
    } catch (err) {
      showToast('Error', 'Failed to load leaves records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDatesChange = (start, end) => {
    const t1 = new Date(start);
    const t2 = new Date(end);
    let diff = 1;
    if (t2 >= t1) {
      diff = Math.round((t2 - t1) / (1000 * 60 * 60 * 24)) + 1;
    }
    setApplyForm((prev) => ({ ...prev, start_date: start, end_date: end, total_days: diff }));
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    try {
      const empId = user?.role === 'employee' ? user.employee_id : applyForm.employee_id;
      if (!empId) {
        showToast('Error', 'Please select an employee', 'error');
        return;
      }

      const res = await api.post('/leaves/apply', { ...applyForm, employee_id: empId });
      if (res.success) {
        showToast('Application Submitted', 'Leave request recorded successfully!', 'success');
        confetti({ particleCount: 60, spread: 45 });
        setIsApplyModalOpen(false);
        setApplyForm({
          employee_id: '',
          leave_type_id: 1,
          start_date: new Date().toISOString().slice(0, 10),
          end_date: new Date().toISOString().slice(0, 10),
          total_days: 1,
          reason: ''
        });
        fetchData();
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to submit leave', 'error');
    }
  };

  const handleStatusUpdate = (leaveId, status) => {
    confirmAction({
      title: `${status} Leave Request?`,
      message: `Are you sure you want to mark this leave application as ${status}?`,
      confirmText: status,
      isDanger: status === 'Rejected',
      onConfirm: async () => {
        try {
          const res = await api.put(`/leaves/${leaveId}/status`, { status });
          if (res.success) {
            showToast('Success', `Leave application has been ${status}`, 'success');
            fetchData();
          }
        } catch (err) {
          showToast('Error', err.message || 'Failed to update status', 'error');
        }
      }
    });
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
      header: 'Leave Type',
      accessor: 'leave_type_name',
      render: (row) => (
        <span className="badge badge-primary" style={{ fontWeight: 700 }}>
          {row.leave_type_name}
        </span>
      )
    },
    {
      header: 'Duration & Dates',
      accessor: 'start_date',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{formatDate(row.start_date)} to {formatDate(row.end_date)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.total_days} Day(s)</div>
        </div>
      )
    },
    {
      header: 'Reason',
      accessor: 'reason',
      render: (row) => <span style={{ fontSize: '0.85rem' }}>{row.reason}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => {
        let b = 'badge-warning';
        if (row.status === 'Approved') b = 'badge-success';
        if (row.status === 'Rejected') b = 'badge-danger';
        return <span className={`badge ${b}`}>{row.status}</span>;
      }
    },
    ...(isAdminOrHr
      ? [
          {
            header: 'Actions',
            render: (row) =>
              row.status === 'Pending' ? (
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleStatusUpdate(row.id, 'Approved')}
                    title="Approve Leave"
                  >
                    <CheckCircle size={13} /> Approve
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleStatusUpdate(row.id, 'Rejected')}
                    title="Reject Leave"
                  >
                    <XCircle size={13} /> Reject
                  </button>
                </div>
              ) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  By {row.approver_name || 'Admin'}
                </span>
              )
          }
        ]
      : [])
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h2>Leaves & Vacations Management</h2>
          <p>Annual, Sick, Maternity, and Casual leave tracking with approval workflows</p>
        </div>

        <div className="header-action-group">
          <button className="btn btn-primary" onClick={() => setIsApplyModalOpen(true)}>
            <Plus size={16} /> Apply Leave
          </button>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={leaves}
        searchPlaceholder="Search leave requests..."
      />

      {/* APPLY LEAVE MODAL */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Submit Leave Application"
        size="default"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsApplyModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleApplySubmit}>Submit Application</button>
          </>
        }
      >
        <form onSubmit={handleApplySubmit}>
          {isAdminOrHr && (
            <div className="form-group">
              <label className="form-label required">Select Employee</label>
              <select
                className="form-control"
                required
                value={applyForm.employee_id}
                onChange={(e) => setApplyForm({ ...applyForm, employee_id: e.target.value })}
              >
                <option value="">-- Choose Employee --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.emp_code} - {emp.first_name} {emp.last_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label required">Leave Category</label>
            <select
              className="form-control"
              value={applyForm.leave_type_id}
              onChange={(e) => setApplyForm({ ...applyForm, leave_type_id: e.target.value })}
            >
              {leaveTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.name} ({lt.days_allowed_per_year} days/yr, {lt.is_paid ? 'Paid' : 'Unpaid'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Start Date</label>
              <input
                type="date"
                className="form-control"
                required
                value={applyForm.start_date}
                onChange={(e) => handleDatesChange(e.target.value, applyForm.end_date)}
              />
            </div>

            <div className="form-group">
              <label className="form-label required">End Date</label>
              <input
                type="date"
                className="form-control"
                required
                value={applyForm.end_date}
                onChange={(e) => handleDatesChange(applyForm.start_date, e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Calculated Days</label>
            <input
              type="text"
              className="form-control"
              readOnly
              value={`${applyForm.total_days} Day(s)`}
              style={{ background: '#f1f5f9', fontWeight: 700 }}
            />
          </div>

          <div className="form-group">
            <label className="form-label required">Reason for Leave</label>
            <textarea
              className="form-control"
              required
              rows={3}
              placeholder="e.g. Annual leave for travel, Medical appointment, etc."
              value={applyForm.reason}
              onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

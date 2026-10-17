// frontend/src/components/UserManagement.jsx

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';
import { ResetPasswordModal } from './ResetPasswordModal';
import {
  Users,
  UserPlus,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Power,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  Building2,
  Lock,
  Mail,
  User
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const UserManagement = () => {
  const { user: currentAuthUser, showToast, confirmAction, formatDate } = useAuth();
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // User Create / Edit Modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Reset Password Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [targetResetUser, setTargetResetUser] = useState(null);

  const initialUserForm = {
    username: '',
    email: '',
    role: 'employee',
    employee_id: '',
    password: '',
    status: 'active',
    must_change_password: true
  };

  const [userForm, setUserForm] = useState(initialUserForm);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [usersRes, empRes] = await Promise.all([
        api.get('/users', {
          role: roleFilter !== 'all' ? roleFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchTerm.trim() || undefined
        }),
        api.get('/employees')
      ]);

      if (usersRes.success) setUsers(usersRes.data || []);
      if (empRes.success) setEmployees(empRes.data || []);
    } catch (err) {
      showToast('Error', err.message || 'Failed to fetch user accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  // Handle Search Input (simple local filtering fallback + API)
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const uname = (u.username || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    const cpr = (u.cpr_no || '').toLowerCase();
    const empCode = (u.emp_code || '').toLowerCase();
    return uname.includes(q) || email.includes(q) || fullName.includes(q) || cpr.includes(q) || empCode.includes(q);
  });

  // Open Create User Modal
  const handleOpenCreate = () => {
    setEditingUser(null);
    setUserForm(initialUserForm);
    setIsUserModalOpen(true);
  };

  // Open Edit User Modal
  const handleOpenEdit = (userItem) => {
    setEditingUser(userItem);
    setUserForm({
      username: userItem.username || '',
      email: userItem.email || '',
      role: userItem.role || 'employee',
      employee_id: userItem.employee_id ? String(userItem.employee_id) : '',
      password: '',
      status: userItem.status || 'active',
      must_change_password: !!userItem.must_change_password
    });
    setIsUserModalOpen(true);
  };

  // Handle Employee selection in Create User Modal
  const handleEmployeeSelect = (empId) => {
    setUserForm((prev) => {
      const next = { ...prev, employee_id: empId };
      if (empId) {
        const emp = employees.find((e) => String(e.id) === String(empId));
        if (emp) {
          // If username is empty or was previous CPR, auto fill with employee's CPR number
          if (!prev.username || employees.some((e) => e.cpr_no === prev.username)) {
            next.username = emp.cpr_no ? emp.cpr_no.trim() : emp.emp_code.toLowerCase();
          }
          if (!prev.email || employees.some((e) => e.email === prev.email)) {
            next.email = emp.email ? emp.email.trim() : `${next.username}@company.local`;
          }
        }
      }
      return next;
    });
  };

  // Submit User Form (Create / Edit)
  const handleSaveUser = async (e) => {
    if (e) e.preventDefault();

    if (!userForm.username.trim()) {
      showToast('Validation Error', 'Username is required.', 'warning');
      return;
    }
    if (!userForm.email.trim()) {
      showToast('Validation Error', 'Email address is required.', 'warning');
      return;
    }

    try {
      setIsSavingUser(true);
      const payload = {
        username: userForm.username.trim(),
        email: userForm.email.trim(),
        role: userForm.role,
        status: userForm.status,
        employee_id: userForm.employee_id ? parseInt(userForm.employee_id, 10) : null
      };

      if (!editingUser) {
        payload.password = userForm.password ? userForm.password.trim() : undefined;
        payload.must_change_password = userForm.must_change_password ? 1 : 0;
      }

      let res;
      if (editingUser) {
        res = await api.put(`/users/${editingUser.id}`, payload);
      } else {
        res = await api.post('/users', payload);
      }

      if (res.success) {
        showToast('Success', res.message || 'User account saved successfully!', 'success');
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
        setIsUserModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to save user account', 'error');
    } finally {
      setIsSavingUser(false);
    }
  };

  // Toggle Status (Active / Inactive)
  const handleToggleStatus = (u) => {
    if (currentAuthUser && currentAuthUser.id === u.id) {
      showToast('Action Blocked', 'You cannot deactivate your own active session account.', 'warning');
      return;
    }

    const actionText = u.status === 'active' ? 'deactivate' : 'activate';
    confirmAction({
      title: `${u.status === 'active' ? 'Deactivate' : 'Activate'} User Account?`,
      message: `Are you sure you want to ${actionText} the account for ${u.username} (${u.first_name ? `${u.first_name} ${u.last_name}` : u.role})?`,
      confirmText: u.status === 'active' ? 'Yes, Deactivate' : 'Yes, Activate',
      isDanger: u.status === 'active',
      onConfirm: async () => {
        try {
          const res = await api.put(`/users/${u.id}/status`);
          if (res.success) {
            showToast('Status Updated', res.message, 'success');
            fetchUsers();
          }
        } catch (err) {
          showToast('Error', err.message || 'Failed to update user status', 'error');
        }
      }
    });
  };

  // Delete User
  const handleDeleteUser = (u) => {
    if (currentAuthUser && currentAuthUser.id === u.id) {
      showToast('Action Blocked', 'You cannot delete your own active administrator account.', 'warning');
      return;
    }

    confirmAction({
      title: 'Delete User Account?',
      message: `Are you sure you want to permanently delete user account '${u.username}'? This cannot be undone.`,
      confirmText: 'Delete Account',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await api.delete(`/users/${u.id}`);
          if (res.success) {
            showToast('Deleted', res.message || 'User account deleted.', 'info');
            fetchUsers();
          }
        } catch (err) {
          showToast('Error', err.message || 'Failed to delete user account', 'error');
        }
      }
    });
  };

  // Open Reset Password Modal
  const handleOpenReset = (u) => {
    setTargetResetUser(u);
    setIsResetModalOpen(true);
  };

  // Statistics counters
  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === 'admin' || u.role === 'super_admin').length;
  const hrCount = users.filter((u) => u.role === 'hr').length;
  const empCount = users.filter((u) => u.role === 'employee').length;
  const pendingResetCount = users.filter((u) => u.must_change_password).length;

  return (
    <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {/* Top Banner & Action */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#db2777', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <ShieldCheck size={16} /> User &amp; Access Control Center
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
            Portal User Accounts &amp; Password Management
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', maxWidth: '750px' }}>
            Create and manage Super Admin, Administrator, HR, and Employee portal accounts. For employee accounts, CPR numbers serve as usernames with automated first-login password creation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fetchUsers}
            disabled={loading}
            title="Refresh user list"
            style={{ padding: '0.55rem 0.85rem' }}
          >
            <RefreshCw size={15} className={loading ? 'pulse-icon' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={handleOpenCreate}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, padding: '0.6rem 1.15rem' }}
          >
            <UserPlus size={16} />
            <span>Create New User</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Counters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Total User Accounts</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{totalCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, marginTop: '2px' }}>System Portal Logins</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Administrators</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ec4899', marginTop: '0.25rem' }}>{adminCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#ec4899', fontWeight: 600, marginTop: '2px' }}>System Administrators</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>HR Operations</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284c7', marginTop: '0.25rem' }}>{hrCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600, marginTop: '2px' }}>HR &amp; Payroll Management</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Employee Self-Service</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>{empCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, marginTop: '2px' }}>CPR-Based Logins</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Pending First Login</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: pendingResetCount > 0 ? '#f59e0b' : '#64748b', marginTop: '0.25rem' }}>{pendingResetCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600, marginTop: '2px' }}>Password Setup Required</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1rem',
          padding: '0.75rem 1rem',
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 280px', minWidth: '220px' }}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            className="form-control"
            placeholder="Search by username, employee name, CPR, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: '0.4rem 0' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Role:</span>
            <select
              className="form-control"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.825rem', width: 'auto' }}
            >
              <option value="all">All Roles</option>
              {currentAuthUser?.role === 'super_admin' && (
                <option value="super_admin">Super Admin (Vendor)</option>
              )}
              <option value="admin">Admin</option>
              <option value="hr">HR Operations</option>
              <option value="employee">Employee Self-Service</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Status:</span>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.825rem', width: 'auto' }}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '220px' }}>User / Login</th>
                <th>Employee / CPR</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Status</th>
                <th>Security</th>
                <th style={{ textAlign: 'right', minWidth: '160px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <div className="pulse-icon" style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                      <RefreshCw size={24} />
                    </div>
                    <div>Loading user accounts...</div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <Users size={36} color="#cbd5e1" style={{ margin: '0 auto 0.5rem auto' }} />
                    <div style={{ fontWeight: 700 }}>No user accounts found</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Try adjusting your search or role filter.</div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrentAuth = currentAuthUser && currentAuthUser.id === u.id;
                  const employeeName = u.first_name ? `${u.first_name} ${u.last_name}` : null;

                  return (
                    <tr key={u.id} style={{ background: isCurrentAuth ? 'rgba(236, 72, 153, 0.03)' : 'inherit' }}>
                      {/* User Info */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background:
                                u.role === 'super_admin'
                                  ? 'linear-gradient(135deg, #7c3aed, #db2777)'
                                  : u.role === 'admin'
                                  ? 'linear-gradient(135deg, #ec4899, #f59e0b)'
                                  : u.role === 'hr'
                                  ? 'linear-gradient(135deg, #0284c7, #38bdf8)'
                                  : 'linear-gradient(135deg, #10b981, #059669)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.85rem',
                              flexShrink: 0
                            }}
                          >
                            {(u.username[0] || 'U').toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span>{u.username}</span>
                              {isCurrentAuth && (
                                <span className="badge badge-pink" style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem' }}>
                                  YOU
                                </span>
                              )}
                            </div>
                            {u.emp_code && (
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                Code: <strong>{u.emp_code}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Employee Details / CPR */}
                      <td>
                        {employeeName ? (
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>{employeeName}</div>
                            {u.cpr_no && (
                              <div style={{ fontSize: '0.75rem', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '1px' }}>
                                CPR: <strong>{u.cpr_no}</strong>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>
                            Standalone Account
                          </span>
                        )}
                      </td>

                      {/* Email */}
                      <td>
                        <span style={{ fontSize: '0.825rem', color: '#334155' }}>{u.email}</span>
                      </td>

                      {/* Role */}
                      <td>
                        <span
                          className={`badge ${
                            u.role === 'super_admin'
                              ? 'badge-pink'
                              : u.role === 'admin'
                              ? 'badge-gold'
                              : u.role === 'hr'
                              ? 'badge-info'
                              : 'badge-primary'
                          }`}
                          style={{ fontSize: '0.675rem', padding: '0.2rem 0.55rem', fontWeight: 800 }}
                        >
                          {u.role === 'super_admin' ? 'SUPER ADMIN' : u.role === 'hr' ? 'HR ADMIN' : u.role?.toUpperCase()}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}`}
                          style={{
                            fontSize: '0.675rem',
                            padding: '0.15rem 0.5rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: u.status === 'active' ? '#10b981' : '#ef4444'
                            }}
                          />
                          {u.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Security Status */}
                      <td>
                        {u.must_change_password ? (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              padding: '0.2rem 0.5rem',
                              background: '#fffbeb',
                              color: '#b45309',
                              border: '1px solid #fde68a',
                              borderRadius: '9999px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <AlertTriangle size={11} /> First Login Pending
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              padding: '0.2rem 0.5rem',
                              background: '#f0fdf4',
                              color: '#15803d',
                              border: '1px solid #bbf7d0',
                              borderRadius: '9999px',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <CheckCircle2 size={11} /> Password Active
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {/* Reset Password Button */}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenReset(u)}
                            title="Reset password for this user"
                            style={{
                              padding: '0.35rem 0.6rem',
                              fontSize: '0.75rem',
                              background: '#eff6ff',
                              borderColor: '#bfdbfe',
                              color: '#1d4ed8'
                            }}
                          >
                            <KeyRound size={13} />
                            <span>Reset</span>
                          </button>

                          {/* Edit User Button */}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenEdit(u)}
                            title="Edit user details"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                          >
                            <Edit size={13} />
                          </button>

                          {/* Toggle Active/Inactive Status Button */}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleToggleStatus(u)}
                            disabled={isCurrentAuth}
                            title={u.status === 'active' ? 'Deactivate user' : 'Activate user'}
                            style={{
                              padding: '0.35rem 0.6rem',
                              fontSize: '0.75rem',
                              color: u.status === 'active' ? '#ef4444' : '#10b981',
                              borderColor: u.status === 'active' ? '#fecaca' : '#a7f3d0'
                            }}
                          >
                            <Power size={13} />
                          </button>

                          {/* Delete User Button */}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleDeleteUser(u)}
                            disabled={isCurrentAuth}
                            title="Delete user account"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', color: '#991b1b', borderColor: '#fecaca' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT USER MODAL */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={editingUser ? `Edit User: ${editingUser.username}` : 'Create New User Account'}
        icon={editingUser ? Edit : UserPlus}
        maxWidth="600px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsUserModalOpen(false)} disabled={isSavingUser}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSaveUser} disabled={isSavingUser}>
              <UserCheck size={16} />
              {isSavingUser ? 'Saving...' : editingUser ? 'Update User Account' : 'Create User Account'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveUser}>
          {/* Link to Employee */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Link to Employee (Optional)</label>
            <select
              className="form-control"
              value={userForm.employee_id}
              onChange={(e) => handleEmployeeSelect(e.target.value)}
            >
              <option value="">-- No Linked Employee (Standalone Account) --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} ({emp.emp_code} | CPR: {emp.cpr_no || 'None'})
                </option>
              ))}
            </select>
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
              Selecting an employee automatically populates username with their CPR number.
            </span>
          </div>

          <div className="form-row">
            {/* Username */}
            <div className="form-group">
              <label className="form-label required">Username / CPR Number</label>
              <input
                type="text"
                className="form-control"
                required
                value={userForm.username}
                onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                placeholder="e.g. 900305881 or jsmith"
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                For employees, Bahrain CPR number is used.
              </span>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label required">Email Address</label>
              <input
                type="email"
                className="form-control"
                required
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="user@company.bh"
              />
            </div>
          </div>

          <div className="form-row">
            {/* Role */}
            <div className="form-group">
              <label className="form-label required">Role &amp; Privilege Level</label>
              <select
                className="form-control"
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              >
                {currentAuthUser?.role === 'super_admin' && (
                  <option value="super_admin">Super Administrator (Software Vendor)</option>
                )}
                <option value="admin">Administrator (Settings &amp; Operations)</option>
                <option value="hr">HR Operations Admin</option>
                <option value="employee">Employee Self-Service</option>
              </select>
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label required">Account Status</label>
              <select
                className="form-control"
                value={userForm.status}
                onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
              >
                <option value="active">Active (Can log in)</option>
                <option value="inactive">Inactive (Access suspended)</option>
              </select>
            </div>
          </div>

          {/* Initial Password (only for new user) */}
          {!editingUser && (
            <div style={{ marginTop: '0.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Initial Password (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="Leave blank to use CPR or temporary password"
                  style={{ fontFamily: 'monospace' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                  If left blank for employees, CPR number will be their initial password.
                </span>
              </div>

              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                onClick={() => setUserForm({ ...userForm, must_change_password: !userForm.must_change_password })}
              >
                <input
                  type="checkbox"
                  id="modal_must_change"
                  checked={userForm.must_change_password}
                  onChange={(e) => setUserForm({ ...userForm, must_change_password: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }}
                />
                <label htmlFor="modal_must_change" style={{ fontSize: '0.825rem', fontWeight: 600, color: '#334155', cursor: 'pointer', margin: 0 }}>
                  Require user to create their own password upon first login
                </label>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* RESET PASSWORD MODAL */}
      <ResetPasswordModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        targetUser={targetResetUser}
        onSuccess={() => fetchUsers()}
      />
    </div>
  );
};

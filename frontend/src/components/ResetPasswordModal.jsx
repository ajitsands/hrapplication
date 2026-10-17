// frontend/src/components/ResetPasswordModal.jsx

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { KeyRound, ShieldAlert, Sparkles, RefreshCw, Eye, EyeOff, Check, Copy } from 'lucide-react';

export const ResetPasswordModal = ({ isOpen, onClose, targetUser, onSuccess }) => {
  const { showToast } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [requireChange, setRequireChange] = useState(true);
  const [resetMode, setResetMode] = useState('custom'); // 'custom', 'cpr', 'random'
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setShowPassword(false);
      setRequireChange(true);
      setCopied(false);
      setResetMode('custom');
    }
  }, [isOpen, targetUser]);

  if (!isOpen || !targetUser) return null;

  const employeeCpr = targetUser.cpr_no || '';

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let rand = 'Gulf@' + Math.floor(100 + Math.random() * 900) + '!';
    setPassword(rand);
    setShowPassword(true);
    setResetMode('random');
  };

  const handleUseCpr = () => {
    if (!employeeCpr) {
      showToast('No CPR', 'This user account is not linked to an employee with a CPR number.', 'warning');
      return;
    }
    setPassword(employeeCpr.trim());
    setShowPassword(true);
    setRequireChange(true);
    setResetMode('cpr');
  };

  const handleCopy = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      showToast('Copied', 'Password copied to clipboard', 'info');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!password || password.trim().length < 6) {
      showToast('Validation Error', 'Password must be at least 6 characters long.', 'warning');
      return;
    }

    try {
      setLoading(true);
      let res;
      if (targetUser.is_employee_direct && targetUser.employee_id) {
        // Direct employee reset
        res = await api.post(`/employees/${targetUser.employee_id}/reset-password`, {
          password: password.trim(),
          require_change: requireChange ? 1 : 0
        });
      } else {
        // User account reset
        res = await api.post(`/users/${targetUser.id}/reset-password`, {
          password: password.trim(),
          require_change: requireChange ? 1 : 0
        });
      }

      if (res.success) {
        showToast('Password Reset', res.message || `Password for ${targetUser.username} updated!`, 'success');
        if (onSuccess) onSuccess(password);
        onClose();
      }
    } catch (err) {
      showToast('Reset Failed', err.message || 'Failed to reset password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const displayName = targetUser.first_name && targetUser.last_name
    ? `${targetUser.first_name} ${targetUser.last_name}`
    : targetUser.username;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reset User Password"
      icon={KeyRound}
      maxWidth="540px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            <KeyRound size={16} />
            {loading ? 'Updating Password...' : 'Save & Update Password'}
          </button>
        </div>
      }
    >
      <div>
        {/* User Identity Banner */}
        <div
          style={{
            padding: '1rem',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Account Holder
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
              {displayName}
            </div>
            <div style={{ fontSize: '0.825rem', color: '#475569', marginTop: '2px' }}>
              Username: <strong style={{ color: '#2563eb' }}>{targetUser.username}</strong>
              {employeeCpr && <span> | CPR: <strong>{employeeCpr}</strong></span>}
            </div>
          </div>

          <span
            className={`badge ${
              targetUser.role === 'super_admin'
                ? 'badge-pink'
                : targetUser.role === 'admin'
                ? 'badge-gold'
                : targetUser.role === 'hr'
                ? 'badge-info'
                : 'badge-primary'
            }`}
            style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}
          >
            {targetUser.role === 'super_admin' ? 'SUPER ADMIN' : targetUser.role?.toUpperCase()}
          </span>
        </div>

        {/* Quick Helper Actions */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label" style={{ marginBottom: '0.5rem' }}>Quick Password Generators</label>
          <div style={{ display: 'grid', gridTemplateColumns: employeeCpr ? '1fr 1fr' : '1fr', gap: '0.5rem' }}>
            {employeeCpr && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleUseCpr}
                style={{
                  background: resetMode === 'cpr' ? '#eff6ff' : '#ffffff',
                  borderColor: resetMode === 'cpr' ? '#3b82f6' : '#cbd5e1',
                  color: resetMode === 'cpr' ? '#1d4ed8' : '#334155',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  padding: '0.55rem'
                }}
              >
                <KeyRound size={14} /> Reset to CPR Number
              </button>
            )}

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={generateRandomPassword}
              style={{
                background: resetMode === 'random' ? '#fdf2f8' : '#ffffff',
                borderColor: resetMode === 'random' ? '#ec4899' : '#cbd5e1',
                color: resetMode === 'random' ? '#be185d' : '#334155',
                fontWeight: 700,
                fontSize: '0.8rem',
                padding: '0.55rem'
              }}
            >
              <Sparkles size={14} /> Generate Random Password
            </button>
          </div>
        </div>

        {/* Password Input Field */}
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label required">New Password</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setResetMode('custom');
              }}
              placeholder="Enter minimum 6 characters..."
              style={{ paddingRight: '80px', fontFamily: showPassword ? 'inherit' : 'monospace', fontSize: '0.95rem' }}
              required
            />
            <div style={{ position: 'absolute', right: '8px', display: 'flex', gap: '4px' }}>
              {password && (
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy password"
                  style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#64748b' }}
                >
                  {copied ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#64748b' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
            Must be at least 6 characters long.
          </span>
        </div>

        {/* Require Password Change Option */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer'
          }}
          onClick={() => setRequireChange(!requireChange)}
        >
          <input
            type="checkbox"
            id="require_change_checkbox"
            checked={requireChange}
            onChange={(e) => setRequireChange(e.target.checked)}
            style={{ width: '17px', height: '17px', accentColor: '#2563eb', cursor: 'pointer' }}
          />
          <label htmlFor="require_change_checkbox" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', cursor: 'pointer', margin: 0 }}>
            Require user to create a new password on their next login
          </label>
        </div>

        {resetMode === 'cpr' && (
          <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.85rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', fontSize: '0.8rem', color: '#047857' }}>
            ✓ Employee will log in with CPR <strong>{employeeCpr}</strong> and will be prompted to create their personal password immediately.
          </div>
        )}
      </div>
    </Modal>
  );
};

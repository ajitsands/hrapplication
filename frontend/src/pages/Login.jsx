// frontend/src/pages/Login.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import {
  ShieldCheck,
  UserCheck,
  KeyRound,
  Globe2,
  Sparkles,
  Building2,
  Zap,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const Login = ({
  onOpenKeyScreen = null,
  onOpenHelpLine = null
}) => {
  const { login, firstLoginSetup, showToast, settings } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // First-time employee CPR login setup state
  const [isFirstTimeModalOpen, setIsFirstTimeModalOpen] = useState(false);
  const [firstTimeCpr, setFirstTimeCpr] = useState('');
  const [firstTimePassword, setFirstTimePassword] = useState('');
  const [firstTimeConfirm, setFirstTimeConfirm] = useState('');
  const [firstTimeLoading, setFirstTimeLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    await login(username, password);
    setLoading(false);
  };

  const handleDemoLogin = async (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setLoading(true);
    await login(user, pass);
    setLoading(false);
  };

  const handleFirstTimeSubmit = async (e) => {
    e.preventDefault();
    if (!firstTimeCpr.trim()) {
      showToast('Validation Error', 'Please enter your Bahrain CPR / National ID number.', 'warning');
      return;
    }
    if (!firstTimePassword || firstTimePassword.length < 6) {
      showToast('Validation Error', 'New password must be at least 6 characters long.', 'warning');
      return;
    }
    if (firstTimePassword !== firstTimeConfirm) {
      showToast('Password Mismatch', 'The new password and confirmation do not match.', 'warning');
      return;
    }

    try {
      setFirstTimeLoading(true);
      const ok = await firstLoginSetup(firstTimeCpr.trim(), firstTimePassword);
      if (ok) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        setIsFirstTimeModalOpen(false);
      }
    } finally {
      setFirstTimeLoading(false);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        minHeight: 'calc(100vh - 65px)',
        background: 'linear-gradient(135deg, #0b1528 0%, #1e3a8a 45%, #701a75 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative Glow Spheres */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '15%',
          width: '380px',
          height: '380px',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.35) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }}
      />

      <div
        style={{
          maxWidth: '470px',
          width: '100%',
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(16px)',
          borderRadius: 'var(--radius-xl, 20px)',
          padding: '2.5rem',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.45), 0 10px 25px -5px rgba(236, 72, 153, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '62px',
              height: '62px',
              borderRadius: 'var(--radius-lg, 12px)',
              background: 'linear-gradient(135deg, #ec4899, #f59e0b)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.85rem',
              fontWeight: 800,
              margin: '0 auto 1rem auto',
              boxShadow: '0 8px 20px rgba(236, 72, 153, 0.35)'
            }}
          >
            GH
          </div>

          <h2
            style={{
              fontSize: '1.55rem',
              color: '#0f172a',
              fontWeight: 800,
              marginBottom: '0.25rem',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #db2777 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {settings.company_name || 'Gulf Enterprise HRMS'}
          </h2>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#db2777',
              fontSize: '0.8125rem',
              fontWeight: 700,
              background: '#fdf2f8',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              border: '1px solid #fbcfe8'
            }}
          >
            <Globe2 size={14} /> Bahrain &amp; GCC Region Portal
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label required">Username, CPR, or Email</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. CPR Number, admin, or hr_admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label required">Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
            disabled={loading}
          >
            <KeyRound size={17} /> {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        {/* First Time Employee Setup Prompt */}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={() => setIsFirstTimeModalOpen(true)}
            style={{
              fontSize: '0.825rem',
              color: '#2563eb',
              fontWeight: 700,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px'
            }}
          >
            <Sparkles size={14} color="#db2777" /> First-time employee? Create password with CPR
          </button>
        </div>

        {/* Quick Demo Access Pills */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#64748b',
              marginBottom: '0.85rem',
              textAlign: 'center',
              letterSpacing: '0.05em'
            }}
          >
            Quick 1-Click Role Login
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {/* System Administrator */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'space-between', padding: '0.6rem 0.95rem', background: '#faf5ff', border: '1px solid #e9d5ff' }}
              onClick={() => handleDemoLogin('admin', 'password123')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, color: '#7c3aed' }}>
                <ShieldCheck size={16} /> System Administrator
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>admin</span>
            </button>

            {/* HR Operations Admin */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'space-between', padding: '0.6rem 0.95rem', background: '#fdf2f8', border: '1px solid #fbcfe8' }}
              onClick={() => handleDemoLogin('hr_admin', 'password123')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, color: '#db2777' }}>
                <Building2 size={16} /> HR Operations Admin
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>hr_admin</span>
            </button>

            {/* Employee Self-Service */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'space-between', padding: '0.6rem 0.95rem', background: '#f0fdf4', border: '1px solid #bbf7d0' }}
              onClick={() => handleDemoLogin('emp_rahul', 'password123')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, color: '#16a34a' }}>
                <UserCheck size={16} /> Employee Self-Service (Rahul)
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>CPR: 920822104</span>
            </button>
          </div>
        </div>

        {/* Utility links: Key Activation Screen */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>

          {onOpenKeyScreen && (
            <button
              type="button"
              onClick={onOpenKeyScreen}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontSize: '0.775rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.2rem 0.5rem'
              }}
            >
              <KeyRound size={13} color="#ec4899" />
              <span>Enter / Add Software License Key</span>
            </button>
          )}
        </div>
      </div>

      {/* FIRST TIME LOGIN PASSWORD CREATION MODAL */}
      <Modal
        isOpen={isFirstTimeModalOpen}
        onClose={() => setIsFirstTimeModalOpen(false)}
        title="Employee First-Time Account Setup"
        size="sm"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsFirstTimeModalOpen(false)} disabled={firstTimeLoading}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleFirstTimeSubmit} disabled={firstTimeLoading}>
              <CheckCircle2 size={16} />
              {firstTimeLoading ? 'Activating...' : 'Create Password & Sign In'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleFirstTimeSubmit}>
          <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '0.8rem', color: '#1e40af' }}>
            Welcome! Enter your registered Bahrain CPR / National ID number to create your permanent password.
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label required">Bahrain CPR / National ID Number</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. 900305881"
              value={firstTimeCpr}
              onChange={(e) => setFirstTimeCpr(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label required">Create New Password</label>
            <input
              type="password"
              className="form-control"
              required
              placeholder="Minimum 6 characters"
              value={firstTimePassword}
              onChange={(e) => setFirstTimePassword(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '0.5rem' }}>
            <label className="form-label required">Confirm New Password</label>
            <input
              type="password"
              className="form-control"
              required
              placeholder="Re-enter password"
              value={firstTimeConfirm}
              onChange={(e) => setFirstTimeConfirm(e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

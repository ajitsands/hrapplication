// frontend/src/pages/Login.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, KeyRound, Globe2, Sparkles, Building2, Zap } from 'lucide-react';

export const Login = () => {
  const { login, settings } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <div
      style={{
        minHeight: '100vh',
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
          borderRadius: 'var(--radius-xl)',
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
              borderRadius: 'var(--radius-lg)',
              background: 'var(--gradient-pill-active)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.85rem',
              fontWeight: 800,
              margin: '0 auto 1rem auto',
              boxShadow: 'var(--shadow-pink-glow)'
            }}
          >
            GH
          </div>

          <h2 style={{ fontSize: '1.55rem', color: '#0f172a', fontWeight: 800, marginBottom: '0.25rem', background: 'linear-gradient(135deg, #1e3a8a 0%, #db2777 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {settings.company_name || 'Gulf Enterprise HRMS'}
          </h2>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#db2777', fontSize: '0.8125rem', fontWeight: 700, background: '#fdf2f8', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', border: '1px solid #fbcfe8' }}>
            <Globe2 size={14} /> Bahrain &amp; GCC Region Portal
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label required">Username or Email</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. admin or EMP-002"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label required">Password</label>
            <input
              type="password"
              className="form-control"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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

        {/* Quick Demo Access Pills */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.85rem', textAlign: 'center', letterSpacing: '0.05em' }}>
            Quick 1-Click Role Login
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'space-between', padding: '0.6rem 0.95rem', background: '#fdf2f8', border: '1px solid #fbcfe8' }}
              onClick={() => handleDemoLogin('hr_admin', 'password123')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, color: '#db2777' }}>
                <Building2 size={16} /> HR Operations Admin
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>hr_admin</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'space-between', padding: '0.6rem 0.95rem', background: '#f0fdf4', border: '1px solid #bbf7d0' }}
              onClick={() => handleDemoLogin('emp_rahul', 'password123')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, color: '#16a34a' }}>
                <UserCheck size={16} /> Employee Self-Service
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>emp_rahul</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

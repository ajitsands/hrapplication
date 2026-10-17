// frontend/src/pages/VendorControl.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCw,
  Server,
  Database,
  Calendar,
  Building2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Cpu,
  Layers,
  Sparkles,
  Eye,
  EyeOff,
  Copy,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const VendorControl = () => {
  const { user, showToast, confirmAction } = useAuth();
  const [loading, setLoading] = useState(true);
  const [vendorData, setVendorData] = useState(null);

  // License Activation Form
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [domainInput, setDomainInput] = useState(window.location.hostname || 'localhost');
  const [ipInput, setIpInput] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  // Suspension Form
  const [suspensionReason, setSuspensionReason] = useState('');
  const [isSavingSuspension, setIsSavingSuspension] = useState(false);

  // Delete Transactional Data Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [superPassword, setSuperPassword] = useState('');
  const [showSuperPassword, setShowSuperPassword] = useState(false);
  const [isDeletingData, setIsDeletingData] = useState(false);

  // Change Super Admin Password
  const [newSuperPassword, setNewSuperPassword] = useState('');
  const [confirmNewSuperPassword, setConfirmNewSuperPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const isSuperAdmin = user && (user.role === 'super_admin' || user.role === 'superadmin');

  const fetchVendorInfo = async () => {
    if (!isSuperAdmin) return;
    try {
      setLoading(true);
      const res = await api.get('/vendor/license-info');
      if (res.success) {
        setVendorData(res.data);
        if (res.data.raw_key) {
          setLicenseKeyInput(res.data.raw_key);
        }
        if (res.data.domain) {
          setDomainInput(res.data.domain);
        }
        if (res.data.suspension_reason) {
          setSuspensionReason(res.data.suspension_reason);
        }
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to load vendor license data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchVendorInfo();
    } else {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  if (!isSuperAdmin) {
    return (
      <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3 style={{ color: '#0f172a', fontWeight: 800 }}>Vendor Control Restricted</h3>
        <p>Software Vendor &amp; Super Administrator privileges are required to view this area.</p>
      </div>
    );
  }

  // Handle License Activation
  const handleActivateLicense = async (e) => {
    e.preventDefault();
    if (!licenseKeyInput.trim()) {
      showToast('Validation Error', 'Please enter a valid Software License Key.', 'warning');
      return;
    }

    try {
      setIsActivating(true);
      const res = await api.post('/vendor/activate-license', {
        license_key: licenseKeyInput.trim(),
        domain_name: domainInput.trim() || undefined,
        ip_address: ipInput.trim() || undefined
      });

      if (res.success) {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        showToast('Activation Successful', res.message || 'Software key activated with SaNDS Lab server!', 'success');
        fetchVendorInfo();
      }
    } catch (err) {
      showToast('Activation Failed', err.message || 'Unable to activate key with SaNDS Lab server', 'error');
    } finally {
      setIsActivating(false);
    }
  };

  // Handle Software Suspension Toggle
  const handleToggleSuspension = async (newSuspendedState) => {
    try {
      setIsSavingSuspension(true);
      const res = await api.post('/vendor/toggle-suspension', {
        suspended: newSuspendedState,
        reason: suspensionReason.trim()
      });

      if (res.success) {
        showToast(
          newSuspendedState ? 'Software Suspended' : 'Software Restored',
          res.message || 'Suspension state updated successfully',
          newSuspendedState ? 'warning' : 'success'
        );
        fetchVendorInfo();
      }
    } catch (err) {
      showToast('Action Failed', err.message || 'Failed to update software suspension', 'error');
    } finally {
      setIsSavingSuspension(false);
    }
  };

  // Handle Wipe Transactional Data
  const handleDeleteTransactionalData = async (e) => {
    e.preventDefault();
    if (confirmPhrase !== 'DELETE ALL TRANSACTIONAL DATA') {
      showToast('Validation Error', 'You must type precisely: DELETE ALL TRANSACTIONAL DATA', 'warning');
      return;
    }
    if (!superPassword) {
      showToast('Validation Error', 'Super Admin password is required to authorize this action.', 'warning');
      return;
    }

    try {
      setIsDeletingData(true);
      const res = await api.post('/vendor/delete-transactional-data', {
        confirmation_phrase: confirmPhrase,
        password: superPassword
      });

      if (res.success) {
        confetti({ particleCount: 50, spread: 80, origin: { y: 0.6 } });
        showToast('Data Wiped Successfully', res.message, 'success');
        setIsDeleteModalOpen(false);
        setConfirmPhrase('');
        setSuperPassword('');
        fetchVendorInfo();
      }
    } catch (err) {
      showToast('Purge Failed', err.message || 'Failed to wipe transactional data', 'error');
    } finally {
      setIsDeletingData(false);
    }
  };

  // Handle Change Super Admin Password
  const handleChangeSuperPassword = async (e) => {
    e.preventDefault();
    if (!newSuperPassword || newSuperPassword.length < 6) {
      showToast('Validation Error', 'Password must be at least 6 characters long.', 'warning');
      return;
    }
    if (newSuperPassword !== confirmNewSuperPassword) {
      showToast('Validation Error', 'New password and confirmation do not match.', 'warning');
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await api.post('/vendor/change-password', {
        new_password: newSuperPassword
      });

      if (res.success) {
        showToast('Success', 'Super Admin password updated successfully!', 'success');
        setNewSuperPassword('');
        setConfirmNewSuperPassword('');
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to update password', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
    showToast('Copied', 'License key copied to clipboard', 'info');
  };

  const license = vendorData?.license || {};
  const isSuspended = !!vendorData?.software_suspended;
  const isLicenseActive = license.status === 'active' && !isSuspended;

  return (
    <div className="container-page" style={{ maxWidth: '1300px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Top Banner Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)',
          borderRadius: '16px',
          padding: '2rem',
          color: '#ffffff',
          marginBottom: '2rem',
          boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', padding: '0.35rem 0.85rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              <ShieldCheck size={14} color="#a5b4fc" /> SaNDS Lab Software Vendor Portal
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#ffffff', letterSpacing: '-0.02em' }}>
              Vendor License &amp; System Control Center
            </h1>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#c7d2fe', maxWidth: '780px', lineHeight: 1.5 }}>
              Dedicated vendor administration interface for <strong>superadmin@sandslab.com</strong>. Manage cryptographic software key activation from SaNDS Lab, toggle software suspension, verify offline RSA signatures, and maintain transactional database integrity.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={fetchVendorInfo}
              disabled={loading}
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)', padding: '0.6rem 1rem' }}
            >
              <RefreshCw size={15} className={loading ? 'pulse-icon' : ''} />
              <span>Refresh Status</span>
            </button>

            <a
              href="https://key.sandslab.com/public/docs"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)', padding: '0.6rem 1rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <ExternalLink size={15} />
              <span>API Docs</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(540px, 1fr))', gap: '1.75rem', alignItems: 'start' }}>
        
        {/* COLUMN 1: LICENSE STATUS & ACTIVATION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Card 1: License Overview & Cloud Status */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <KeyRound size={20} color="#4f46e5" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Software Validity &amp; License State
                </h3>
              </div>

              {/* Status Badge */}
              <div>
                {isSuspended ? (
                  <span className="badge badge-danger" style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem', fontWeight: 800 }}>
                    <ShieldAlert size={13} style={{ marginRight: '4px' }} /> SUSPENDED BY VENDOR
                  </span>
                ) : license.status === 'active' ? (
                  <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem', fontWeight: 800 }}>
                    <CheckCircle2 size={13} style={{ marginRight: '4px' }} /> ACTIVE &amp; LICENSED
                  </span>
                ) : license.status === 'expired' ? (
                  <span className="badge badge-danger" style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem', fontWeight: 800 }}>
                    <AlertTriangle size={13} style={{ marginRight: '4px' }} /> LICENSE EXPIRED
                  </span>
                ) : (
                  <span className="badge badge-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem', fontWeight: 800 }}>
                    UNLICENSED (ACTIVATION REQUIRED)
                  </span>
                )}
              </div>
            </div>

            {/* License Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Client / Customer</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                  {vendorData?.customer || 'Gulf Enterprise Organization'}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Licensed Domain</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                  {vendorData?.domain || 'localhost'}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Validity / Expiration</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                  {license?.expires_at ? new Date(license.expires_at).toLocaleDateString() : 'Perpetual / Not Set'}
                </div>
                {license?.days_remaining !== null && license?.days_remaining !== undefined && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: license.days_remaining > 30 ? '#10b981' : '#f59e0b' }}>
                    {license.days_remaining} days remaining
                  </span>
                )}
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Verification Engine</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#4f46e5', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={14} color="#10b981" /> RSA-256 Asymmetric Offline
                </div>
              </div>
            </div>

            {/* Current Masked Key Display */}
            {license?.license_key_masked && (
              <div style={{ background: '#f1f5f9', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block' }}>Installed Software Key</span>
                  <code style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', letterSpacing: '0.05em' }}>
                    {license.license_key_masked}
                  </code>
                </div>
                {vendorData?.raw_key && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => copyToClipboard(vendorData.raw_key)}
                    style={{ padding: '0.35rem 0.65rem' }}
                    title="Copy full key"
                  >
                    <Copy size={13} />
                  </button>
                )}
              </div>
            )}

            <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
              {license.message}
            </div>
          </div>

          {/* Card 2: Activate / Update Software Key */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <ExternalLink size={18} color="#4f46e5" />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Activate Software Key from SaNDS Lab Server
              </h3>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Connect to <code>https://key.sandslab.com/public/api/activate</code> to exchange your License Key for a cryptographically signed offline verification token.
            </p>

            <form onSubmit={handleActivateLicense}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label required">Software License Key</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="INV-XXXXXX-XXXXXX-XXXXXX-XXXXXX"
                  value={licenseKeyInput}
                  onChange={(e) => setLicenseKeyInput(e.target.value)}
                  style={{ fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.05em' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label required">Domain Name</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g. client-app.com or localhost"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Client IP Address (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 192.168.1.100"
                    value={ipInput}
                    onChange={(e) => setIpInput(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isActivating}
                style={{ width: '100%', padding: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
              >
                <KeyRound size={16} />
                <span>{isActivating ? 'Activating with SaNDS Lab...' : 'Activate / Update Software Key'}</span>
              </button>
            </form>
          </div>

          {/* Card 3: Super Admin Credentials */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <Lock size={18} color="#0284c7" />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Super Admin Account Password
              </h3>
            </div>
            
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              Logged in as: <strong>superadmin@sandslab.com</strong>. You can update your master vendor password at any time.
            </div>

            <form onSubmit={handleChangeSuperPassword}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label required">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="form-control"
                      required
                      placeholder="Min 6 characters"
                      value={newSuperPassword}
                      onChange={(e) => setNewSuperPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label required">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    placeholder="Re-enter password"
                    value={confirmNewSuperPassword}
                    onChange={(e) => setConfirmNewSuperPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-secondary btn-sm"
                disabled={isChangingPassword}
                style={{ fontWeight: 700 }}
              >
                {isChangingPassword ? 'Updating...' : 'Update Vendor Password'}
              </button>
            </form>
          </div>

        </div>

        {/* COLUMN 2: SUSPENSION & TRANSACTIONAL PURGE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Card 4: Software Suspension Control */}
          <div
            className="card"
            style={{
              padding: '1.5rem',
              borderRadius: '14px',
              border: isSuspended ? '2px solid #f43f5e' : '1px solid #e2e8f0',
              background: isSuspended ? '#fff1f2' : '#ffffff',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={20} color={isSuspended ? '#e11d48' : '#64748b'} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: isSuspended ? '#9f1239' : '#0f172a' }}>
                  Software Suspension Control
                </h3>
              </div>

              <span className={`badge ${isSuspended ? 'badge-danger' : 'badge-success'}`}>
                {isSuspended ? 'LOCKED & SUSPENDED' : 'OPERATIONAL'}
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', color: isSuspended ? '#be123c' : '#64748b', marginBottom: '1rem', lineHeight: 1.45 }}>
              When suspended, all normal Admins, HR managers, and employees are instantly barred from the system and will see the Vendor Suspension lockout screen. The Super Admin retains full control to unlock the application at any time.
            </p>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 700 }}>Suspension Notice / Reason Shown to Users</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="e.g. Software service temporarily suspended by SaNDS Lab. Please contact your account representative."
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {isSuspended ? (
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleToggleSuspension(false)}
                  disabled={isSavingSuspension}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, padding: '0.65rem 1.25rem' }}
                >
                  <Unlock size={16} />
                  <span>Restore Operational Access (Unsuspend)</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleToggleSuspension(true)}
                  disabled={isSavingSuspension}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, padding: '0.65rem 1.25rem', background: '#e11d48', borderColor: '#be123c' }}
                >
                  <Lock size={16} />
                  <span>Suspend Software Access Immediately</span>
                </button>
              )}
            </div>
          </div>

          {/* Card 5: Delete All Transactional Data */}
          <div
            className="card"
            style={{
              padding: '1.5rem',
              borderRadius: '14px',
              border: '1px solid #fecaca',
              background: '#fffafb',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #fee2e2', paddingBottom: '0.75rem' }}>
              <Trash2 size={20} color="#b91c1c" />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#991b1b' }}>
                Purge All Transactional Data
              </h3>
            </div>

            <div style={{ padding: '0.85rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#991b1b', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <AlertTriangle size={15} /> Destructive Factory Purge
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#7f1d1d', lineHeight: 1.4 }}>
                This operation permanently wipes all runtime operational transactions (attendance logs, generated payslips, payroll runs, leave applications, loan advances, and indemnity calculations).
              </p>
              <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.8rem', color: '#047857', fontWeight: 700 }}>
                ✓ Master profiles (Employees, Departments, Designations, Users, and Settings) are strictly PRESERVED.
              </p>
            </div>

            {/* Current Transactional Table Counters */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Current Transactional Row Counts ({vendorData?.total_transactional_rows || 0} Total Records)
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem' }}>
                {vendorData?.stats && Object.entries(vendorData.stats).map(([table, item]) => (
                  <div key={table} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '0.5rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.825rem' }}>
                    <span style={{ color: '#334155' }}>{item.label}</span>
                    <span style={{ fontWeight: 800, color: item.count > 0 ? '#b91c1c' : '#64748b' }}>
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setIsDeleteModalOpen(true)}
              style={{ width: '100%', padding: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#dc2626' }}
            >
              <Trash2 size={16} />
              <span>Purge All Transactional Data...</span>
            </button>
          </div>

          {/* Card 6: Host Server Diagnostics */}
          <div className="card" style={{ padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem', color: '#475569', fontWeight: 700, fontSize: '0.85rem' }}>
              <Server size={16} color="#64748b" /> Server Diagnostics &amp; System Health
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
              <div>PHP Engine: <strong style={{ color: '#0f172a' }}>{vendorData?.server_info?.php_version || '8.2+'}</strong></div>
              <div>Database: <strong style={{ color: '#0f172a' }}>{vendorData?.server_info?.database || 'MySQL'}</strong></div>
              <div>Host Domain: <strong style={{ color: '#0f172a' }}>{vendorData?.server_info?.host || 'localhost'}</strong></div>
              <div>Server IP: <strong style={{ color: '#0f172a' }}>{vendorData?.server_info?.server_ip || '127.0.0.1'}</strong></div>
            </div>
          </div>

        </div>
      </div>

      {/* CONFIRMATION MODAL FOR TRANSACTIONAL DATA WIPE */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Authorize Transactional Data Purge"
        size="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeletingData}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteTransactionalData}
              disabled={isDeletingData || confirmPhrase !== 'DELETE ALL TRANSACTIONAL DATA' || !superPassword}
              style={{ background: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <Trash2 size={16} />
              <span>{isDeletingData ? 'Purging Records...' : 'Confirm Permanent Purge'}</span>
            </button>
          </div>
        }
      >
        <form onSubmit={handleDeleteTransactionalData}>
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991b1b', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.35rem' }}>
              <AlertTriangle size={18} /> Are you absolutely certain?
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f1d1d', lineHeight: 1.45 }}>
              This action cannot be undone. All clock-in/out records, biometric punch files, payslips, payroll cycles, leave requests, and loans will be permanently deleted from the database.
            </p>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label required">
              Type <strong style={{ color: '#b91c1c' }}>DELETE ALL TRANSACTIONAL DATA</strong> to confirm:
            </label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="DELETE ALL TRANSACTIONAL DATA"
              value={confirmPhrase}
              onChange={(e) => setConfirmPhrase(e.target.value)}
              style={{ fontFamily: 'monospace', fontWeight: 700 }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '0.5rem' }}>
            <label className="form-label required">Super Admin Master Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showSuperPassword ? 'text' : 'password'}
                className="form-control"
                required
                placeholder="Enter password for superadmin@sandslab.com"
                value={superPassword}
                onChange={(e) => setSuperPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowSuperPassword(!showSuperPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                {showSuperPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

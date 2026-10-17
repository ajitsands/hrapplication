// frontend/src/components/SoftwareKeyScreen.jsx

import React, { useState } from 'react';
import { api } from '../services/api';
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Lock,
  PhoneCall,
  RefreshCw,
  Globe,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Server
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SoftwareKeyScreen = ({
  onActivated,
  onOpenHelpLine,
  onRefreshStatus,
  detectedStatus
}) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [domainName, setDomainName] = useState(
    typeof window !== 'undefined' ? window.location.hostname || 'localhost' : 'localhost'
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleActivate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanKey = licenseKey.trim();
    if (!cleanKey) {
      setErrorMsg('Please enter a valid Software License Key.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/system/activate-key', {
        license_key: cleanKey,
        domain_name: domainName.trim() || undefined
      });

      if (res.success) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        setSuccessMsg(
          res.message || 'Software key successfully authenticated with SaNDS Lab licensing server!'
        );
        setTimeout(() => {
          if (onActivated) {
            onActivated(res.data);
          }
        }, 1200);
      } else {
        setErrorMsg(res.message || 'Activation failed. Please verify your key.');
      }
    } catch (err) {
      setErrorMsg(
        err.message ||
          'Failed to authenticate key with SaNDS Lab server. Please check your internet connection or contact the Help Line.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        minHeight: 'calc(100vh - 65px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        background: 'linear-gradient(135deg, #09090b 0%, #172554 45%, #0f172a 100%)',
        position: 'relative',
        overflow: 'hidden',
        color: '#ffffff',
        fontFamily: "'Outfit', -apple-system, sans-serif"
      }}
    >
      {/* Background Decorative Lighting */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          width: '380px',
          height: '380px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '20%',
          width: '380px',
          height: '380px',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }}
      />

      <div
        style={{
          maxWidth: '540px',
          width: '100%',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '2.5rem',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(59, 130, 246, 0.15)',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* ICON & BADGE */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.25), rgba(236, 72, 153, 0.25))',
              border: '2px solid rgba(59, 130, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)'
            }}
          >
            <KeyRound size={36} color="#60a5fa" />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#93c5fd',
              padding: '0.3rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem'
            }}
          >
            <Sparkles size={13} color="#f472b6" /> SaNDS Lab Software Licensing Engine
          </div>

          <h1
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              margin: '0 0 0.5rem 0',
              color: '#ffffff',
              letterSpacing: '-0.02em'
            }}
          >
            Enter Software License Key
          </h1>

          <p
            style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              lineHeight: 1.5,
              margin: 0
            }}
          >
            Software Key is not added. Please input your official SaNDS Lab license key below. Once authenticated, users will be granted access to the application.
          </p>
        </div>

        {/* FEEDBACK MESSAGES */}
        {errorMsg && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              lineHeight: 1.4
            }}
          >
            <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              color: '#86efac',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}
          >
            <CheckCircle2 size={18} color="#22c55e" style={{ flexShrink: 0 }} />
            <div>{successMsg}</div>
          </div>
        )}

        {/* ACTIVATION FORM */}
        <form onSubmit={handleActivate}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.825rem',
                fontWeight: 700,
                color: '#e2e8f0',
                marginBottom: '0.5rem'
              }}
            >
              Software License Key <span style={{ color: '#ec4899' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                placeholder="e.g. SANDS-HRMS-XXXX-XXXX-XXXX"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  paddingLeft: '2.75rem',
                  background: 'rgba(2, 6, 23, 0.6)',
                  border: '1.5px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontFamily: 'monospace',
                  letterSpacing: '0.04em',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#38bdf8';
                  e.target.style.boxShadow = '0 0 15px rgba(56, 189, 248, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <KeyRound
                size={18}
                color="#38bdf8"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.825rem',
                fontWeight: 700,
                color: '#94a3b8',
                marginBottom: '0.4rem'
              }}
            >
              Licensed Domain / Host
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  paddingLeft: '2.5rem',
                  background: 'rgba(2, 6, 23, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#cbd5e1',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
              <Globe
                size={16}
                color="#64748b"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.9rem',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #2563eb 0%, #db2777 100%)',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              boxShadow: '0 8px 25px rgba(37, 99, 235, 0.4)',
              transition: 'all 0.2s',
              opacity: loading ? 0.75 : 1
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTopColor: '#ffffff',
                    borderRadius: '50%',
                    animation: 'spin 1s infinite linear'
                  }}
                />
                <span>Authenticating with SaNDS Lab Server...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Authenticate &amp; Activate Software Key</span>
              </>
            )}
          </button>
        </form>

        {/* VENDOR HELP LINE DIRECT CARD */}
        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
            Need a software license key or emergency renewal?
          </div>

          <button
            type="button"
            onClick={onOpenHelpLine}
            style={{
              width: '100%',
              padding: '0.65rem 1rem',
              borderRadius: '10px',
              background: 'rgba(37, 99, 235, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#93c5fd',
              fontSize: '0.825rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(37, 99, 235, 0.25)';
              e.currentTarget.style.borderColor = '#60a5fa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(37, 99, 235, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
            }}
          >
            <PhoneCall size={15} color="#ec4899" />
            <span>Contact Vendor SaNDS Lab Help Line (+973 35078079)</span>
          </button>
        </div>

        {/* BOTTOM UTILITY LINKS */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '1.25rem',
            fontSize: '0.75rem',
            color: '#64748b'
          }}
        >
          <button
            type="button"
            onClick={onRefreshStatus}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: 0,
              fontSize: '0.75rem'
            }}
          >
            <RefreshCw size={12} />
            <span>Refresh License Check</span>
          </button>
        </div>
      </div>
    </div>
  );
};

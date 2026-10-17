// frontend/src/components/LicenseSuspendedScreen.jsx

import React from 'react';
import {
  ShieldAlert,
  PhoneCall,
  KeyRound,
  Lock,
  RefreshCw,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

export const LicenseSuspendedScreen = ({
  statusData,
  onOpenHelpLine,
  onEnterKey,
  onRefreshStatus
}) => {
  const isSuperadminSuspended = !!statusData?.superadmin_suspended;
  const isExpired = statusData?.status === 'expired';

  let title = 'Software Access Suspended';
  if (isSuperadminSuspended) {
    title = 'Superadmin Suspended — Key Expired';
  } else if (isExpired) {
    title = 'Software License Key Expired';
  }

  const detailMessage =
    statusData?.suspension_reason ||
    statusData?.message ||
    'Software access has been suspended by the vendor (SaNDS Lab).';

  return (
    <div
      style={{
        flex: 1,
        minHeight: 'calc(100vh - 65px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        background: 'linear-gradient(135deg, #09090b 0%, #1f1212 50%, #18181b 100%)',
        position: 'relative',
        overflow: 'hidden',
        color: '#ffffff',
        fontFamily: "'Outfit', -apple-system, sans-serif"
      }}
    >
      {/* Decorative Red/Amber Glow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '25%',
          width: '380px',
          height: '380px',
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }}
      />

      <div
        style={{
          maxWidth: '560px',
          width: '100%',
          background: 'rgba(24, 24, 27, 0.92)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '2.5rem',
          border: '1.5px solid rgba(239, 68, 68, 0.35)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(239, 68, 68, 0.2)',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* SHIELD ICON */}
        <div
          style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '2px solid rgba(239, 68, 68, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
          }}
        >
          <ShieldAlert size={40} color="#ef4444" />
        </div>

        {/* TOP STATUS BADGE */}
        <div
          style={{
            display: 'inline-block',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '0.35rem 0.95rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.85rem'
          }}
        >
          Access Locked by Vendor
        </div>

        {/* HEADLINE */}
        <h1
          style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            margin: '0 0 0.75rem 0',
            color: '#ffffff',
            letterSpacing: '-0.02em'
          }}
        >
          {title}
        </h1>

        {/* PROMINENT CONTACT VENDOR CALLOUT BANNER */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.25) 0%, rgba(185, 28, 28, 0.35) 100%)',
            border: '1.5px solid rgba(248, 113, 113, 0.5)',
            borderRadius: '14px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: '#fecaca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '0.35rem'
            }}
          >
            <AlertTriangle size={18} color="#f87171" />
            <span>Key expired — Contact your Vendor SaNDS Lab Help Line</span>
          </div>
          <div style={{ fontSize: '0.825rem', color: '#fed7d7', lineHeight: 1.4 }}>
            {detailMessage}
          </div>
        </div>

        <p
          style={{
            fontSize: '0.85rem',
            color: '#a1a1aa',
            lineHeight: 1.6,
            marginBottom: '2rem'
          }}
        >
          Standard users and administrators are locked out. To renew your license, restore access, or receive a new activation key, please contact the official SaNDS Lab Technical Help Line.
        </p>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Button 1: Contact SaNDS Lab Help Line */}
          <button
            type="button"
            onClick={onOpenHelpLine}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            <PhoneCall size={18} />
            <span>Contact SaNDS Lab Help Line (+973 35078079)</span>
          </button>

          {/* Button 2: Enter Renewed Software Key */}
          <button
            type="button"
            onClick={onEnterKey}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '12px',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              background: 'rgba(37, 99, 235, 0.2)',
              color: '#93c5fd',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <KeyRound size={16} />
            <span>Enter Renewed Software License Key</span>
          </button>

          {/* Button 3: Check Status Again */}
          <div style={{ marginTop: '0.25rem' }}>
            <button
              type="button"
              onClick={onRefreshStatus}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#d4d4d8',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <RefreshCw size={14} />
              <span>Check Status Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

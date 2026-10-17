// frontend/src/components/Footer.jsx

import React, { useState } from 'react';
import { SaNDSLabModal } from './SaNDSLabModal';
import { UserManualModal } from './UserManualModal';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Sparkles,
  ShieldCheck,
  PhoneCall,
  Headphones,
  HelpCircle
} from 'lucide-react';

export const Footer = ({ onOpenHelpLine }) => {
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleHelpLineClick = () => {
    if (onOpenHelpLine) {
      onOpenHelpLine();
    } else {
      setInternalModalOpen(true);
    }
  };

  return (
    <>
      <footer
        style={{
          marginTop: 'auto',
          background: 'linear-gradient(135deg, #0b1528 0%, #172554 60%, #1e1b4b 100%)',
          borderTop: '2px solid transparent',
          borderImage: 'linear-gradient(90deg, #2563eb, #ec4899, #8b5cf6) 1',
          color: '#ffffff',
          padding: '0.9rem 1.5rem',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.25)',
          zIndex: 40,
          position: 'relative'
        }}
      >
        <div
          style={{
            maxWidth: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.85rem'
          }}
        >
          {/* LEFT: COPYRIGHT & COMPLIANCE BADGE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ color: '#94a3b8', fontWeight: 500 }}>
              &copy; {currentYear} <strong>Gulf HR Enterprise System</strong>. All Rights Reserved.
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                background: 'rgba(37, 99, 235, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                color: '#93c5fd',
                fontSize: '0.72rem',
                fontWeight: 700
              }}
            >
              <ShieldCheck size={12} color="#38bdf8" /> Bahrain &amp; GCC Compliant
            </span>
          </div>

          {/* CENTER: SaNDS Lab Help Line (CLICKABLE POPUP TRIGGER) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleHelpLineClick}
              style={{
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.35), rgba(236, 72, 153, 0.35))',
                border: '1.5px solid #ec4899',
                color: '#ffffff',
                padding: '0.4rem 1rem',
                borderRadius: '9999px',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.825rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 14px rgba(236, 72, 153, 0.35)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(236, 72, 153, 0.55)';
                e.currentTarget.style.borderColor = '#f472b6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 14px rgba(236, 72, 153, 0.35)';
                e.currentTarget.style.borderColor = '#ec4899';
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 8px #22c55e',
                  display: 'inline-block'
                }}
              />
              <PhoneCall size={14} color="#f472b6" />
              <span>SaNDS Lab Help Line:</span>
              <strong style={{ background: 'linear-gradient(135deg, #93c5fd, #fbcfe8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                +973 35078079
              </strong>
            </button>
          </div>

          {/* RIGHT: USER MANUAL BUTTON */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #db2777 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.825rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(219, 39, 119, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
              }}
            >
              <BookOpen size={15} color="#ffffff" />
              <span>User Manual</span>
            </button>
          </div>
        </div>
      </footer>

      {/* POPUP MODALS */}
      <SaNDSLabModal isOpen={internalModalOpen} onClose={() => setInternalModalOpen(false)} />
      <UserManualModal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} />
    </>
  );
};

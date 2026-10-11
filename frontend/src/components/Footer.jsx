// frontend/src/components/Footer.jsx

import React, { useState } from 'react';
import { SaNDSLabModal } from './SaNDSLabModal';
import { UserManualModal } from './UserManualModal';
import {
  BookOpen,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  HelpCircle
} from 'lucide-react';

export const Footer = () => {
  const [isSandsModalOpen, setIsSandsModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const currentYear = new Date().getFullYear();

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
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
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

          {/* CENTER: ENGINEERED BY SANDS LAB (CLICKABLE POPUP) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ color: '#94a3b8', fontWeight: 500 }}>Engineered by</span>
            <button
              type="button"
              onClick={() => setIsSandsModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.25), rgba(236, 72, 153, 0.25))',
                border: '1px solid rgba(236, 72, 153, 0.5)',
                color: '#ffffff',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full, 9999px)',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.825rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 10px rgba(236, 72, 153, 0.25)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(236, 72, 153, 0.45)';
                e.currentTarget.style.borderColor = '#ec4899';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(236, 72, 153, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.5)';
              }}
            >
              <Sparkles size={14} color="#f472b6" />
              <span style={{ background: 'linear-gradient(135deg, #93c5fd, #fbcfe8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                SaNDS Lab
              </span>
            </button>
          </div>

          {/* RIGHT CORNER: USER MANUAL BUTTON */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #db2777 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-md, 8px)',
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
      <SaNDSLabModal isOpen={isSandsModalOpen} onClose={() => setIsSandsModalOpen(false)} />
      <UserManualModal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} />
    </>
  );
};

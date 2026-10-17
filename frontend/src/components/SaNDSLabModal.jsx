// frontend/src/components/SaNDSLabModal.jsx

import React, { useState } from 'react';
import { Modal } from './Modal';
import {
  Building2,
  MapPin,
  MessageCircle,
  ExternalLink,
  Globe,
  Sparkles,
  Phone,
  PhoneCall,
  Mail,
  ShieldCheck,
  CheckCircle,
  Headphones,
  KeyRound
} from 'lucide-react';

export const SaNDSLabModal = ({ isOpen, onClose }) => {
  const [imgError, setImgError] = useState(false);
  const logoUrl = 'https://qrgenerator.sandslab.com/assets/SaNDSLab-LogoForWhite-C43CoLgA.png';

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SaNDS Lab Help Line & Vendor Support"
      size="md"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      }
    >
      <div style={{ textAlign: 'center', padding: '0.25rem 0.5rem 1rem' }}>
        {/* LOGO CONTAINER */}
        <div
          style={{
            background: '#ffffff',
            padding: '1.25rem 1.5rem',
            borderRadius: 'var(--radius-lg, 16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            border: '1.5px solid var(--border-subtle, #e2e8f0)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            minHeight: '85px'
          }}
        >
          {!imgError ? (
            <img
              src={logoUrl}
              alt="SaNDS Lab Middle East W.L.L."
              style={{
                maxHeight: '65px',
                maxWidth: '280px',
                objectFit: 'contain'
              }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0f172a' }}>
              <Sparkles size={28} color="#ec4899" />
              <div style={{ textAlign: 'left' }}>
                <span
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    background: 'linear-gradient(135deg, #2563eb, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  SaNDS Lab
                </span>
                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Middle East W.L.L.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* COMPANY NAME & OFFICIAL DETAILS */}
        <h3
          style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            color: 'var(--text-primary, #0f172a)',
            marginBottom: '0.35rem',
            letterSpacing: '-0.02em'
          }}
        >
          SaNDS Lab Middle East W.L.L.
        </h3>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.3rem 0.85rem',
            borderRadius: '9999px',
            background: 'rgba(37, 99, 235, 0.08)',
            color: 'var(--primary, #2563eb)',
            fontSize: '0.825rem',
            fontWeight: 700,
            marginBottom: '0.85rem',
            border: '1px solid rgba(37, 99, 235, 0.2)'
          }}
        >
          <MapPin size={14} color="#ec4899" />
          <span>Salmabad, Kingdom of Bahrain</span>
        </div>

        {/* 24/7 HELPLINE NOTICE CARD */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
            border: '1.5px solid #86efac',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.35)'
            }}
          >
            <Headphones size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#14532d', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} />
              Direct Vendor Help Line Available
            </div>
            <div style={{ fontSize: '0.775rem', color: '#166534', marginTop: '0.15rem' }}>
              For Software Key Activation, License Renewal, or Technical Assistance:
            </div>
          </div>
        </div>

        {/* CONTACT BUTTONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {/* Button 1: Direct Telephone Call */}
          <a
            href="tel:+97335078079"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md, 10px)',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.925rem',
              boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <PhoneCall size={18} color="#ffffff" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.2 }}>Call Help Line Hotline</div>
                <div style={{ fontSize: '0.775rem', opacity: 0.9, fontWeight: 500 }}>+973 35078079 • Voice Call Support</div>
              </div>
            </div>
            <ExternalLink size={16} />
          </a>

          {/* Button 2: WhatsApp Support */}
          <a
            href="https://wa.me/97335078079?text=Hello%20SaNDS%20Lab%20Help%20Line%2C%20I%20am%20reaching%20out%20regarding%20the%20Gulf%20HR%20Software%20License%20Key."
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md, 10px)',
              background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.925rem',
              boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <MessageCircle size={18} color="#ffffff" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.2 }}>Instant WhatsApp Chat</div>
                <div style={{ fontSize: '0.775rem', opacity: 0.9, fontWeight: 500 }}>+973 35078079 • Live Instant Assistance</div>
              </div>
            </div>
            <ExternalLink size={16} />
          </a>

          {/* Button 3: Email Support */}
          <a
            href="mailto:support@sandslab.com?subject=Gulf%20HR%20Software%20License%20Help%20Line"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-md, 10px)',
              background: '#ffffff',
              color: 'var(--text-primary, #0f172a)',
              border: '1.5px solid var(--border-subtle, #e2e8f0)',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: '#fdf2f8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Mail size={18} color="#db2777" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.875rem', lineHeight: 1.2 }}>Email Vendor Support</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>support@sandslab.com</div>
              </div>
            </div>
            <ExternalLink size={16} color="#64748b" />
          </a>

          {/* Button 4: Website & Products */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <a
              href="https://www.sandslab.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#334155',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.8rem'
              }}
            >
              <Globe size={15} color="#2563eb" />
              <span>www.sandslab.com</span>
            </a>

            <a
              href="https://sandslab.com/products/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#334155',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.8rem'
              }}
            >
              <Sparkles size={15} color="#ec4899" />
              <span>Explore Products</span>
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
};

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
  CheckCircle,
  ShieldCheck,
  X
} from 'lucide-react';

export const SaNDSLabModal = ({ isOpen, onClose }) => {
  const [imgError, setImgError] = useState(false);
  const logoUrl = 'https://qrgenerator.sandslab.com/assets/SaNDSLab-LogoForWhite-C43CoLgA.png';

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="About the Solution Engineer"
      size="md"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      }
    >
      <div style={{ textAlign: 'center', padding: '0.5rem 0.5rem 1rem' }}>
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
            minHeight: '90px'
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ffffff' }}>
              <Sparkles size={28} color="#ec4899" />
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #60a5fa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  SaNDS Lab
                </span>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Middle East W.L.L.</div>
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
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            background: 'rgba(37, 99, 235, 0.08)',
            color: 'var(--primary, #2563eb)',
            fontSize: '0.825rem',
            fontWeight: 700,
            marginBottom: '1rem',
            border: '1px solid rgba(37, 99, 235, 0.2)'
          }}
        >
          <MapPin size={14} color="#ec4899" />
          <span>Salmabad, Kingdom of Bahrain</span>
        </div>

        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary, #475569)',
            lineHeight: 1.6,
            maxWidth: '480px',
            margin: '0 auto 1.5rem',
            textAlign: 'center'
          }}
        >
          Enterprise Software Architecture, Gulf Labor Law Compliance Systems, Digital Biometrics, Cloud Infrastructure &amp; Automation Engineering.
        </p>

        {/* THREE REQUIRED BUTTONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
          {/* Button 1: WhatsApp Support */}
          <a
            href="https://wa.me/97335078079?text=Hello%20SaNDS%20Lab%20Support%2C%20I%20am%20reaching%20out%20regarding%20the%20Gulf%20HR%20%26%20Payroll%20System."
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
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageCircle size={18} color="#ffffff" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.2 }}>Support on WhatsApp</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 500 }}>+97335078079 • Live Instant Assistance</div>
              </div>
            </div>
            <ExternalLink size={16} />
          </a>

          {/* Button 2: Our Latest Products */}
          <a
            href="https://sandslab.com/products/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md, 10px)',
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #ec4899 100%)',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.925rem',
              boxShadow: '0 4px 15px rgba(37, 99, 235, 0.25)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={18} color="#ffffff" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.2 }}>Our Latest Products</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 500 }}>Explore SaNDS Lab Enterprise Solutions</div>
              </div>
            </div>
            <ExternalLink size={16} />
          </a>

          {/* Button 3: Our Website */}
          <a
            href="https://www.sandslab.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md, 10px)',
              background: '#ffffff',
              color: 'var(--text-primary, #0f172a)',
              border: '1.5px solid var(--border-subtle, #e2e8f0)',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.925rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Globe size={18} color="var(--primary, #2563eb)" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.2 }}>Our Official Website</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 500 }}>www.sandslab.com</div>
              </div>
            </div>
            <ExternalLink size={16} color="var(--text-secondary, #475569)" />
          </a>
        </div>
      </div>
    </Modal>
  );
};

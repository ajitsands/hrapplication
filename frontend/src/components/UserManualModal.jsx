// frontend/src/components/UserManualModal.jsx

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen,
  Search,
  Printer,
  ChevronRight,
  ChevronLeft,
  Users,
  Clock,
  DollarSign,
  FileText,
  Calendar,
  CreditCard,
  Settings,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Layers,
  Sparkles,
  Download,
  X
} from 'lucide-react';
import { getDownloadBridgeUrl, getSetupGuideUrl } from '../services/api';

export const UserManualModal = ({ isOpen, onClose }) => {
  const [activeTopicId, setActiveTopicId] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [printTarget, setPrintTarget] = useState('current');

  const topics = [
    {
      id: 'overview',
      title: '1. System Overview & Architecture',
      category: 'Foundation',
      icon: Layers,
      summary: 'Executive dashboard, GCC multi-country rules, and Bahrain Labor Law foundation.'
    },
    {
      id: 'employees',
      title: '2. Employee Vault & Digital Dossiers',
      category: 'HR Management',
      icon: Users,
      summary: 'Onboarding, CPR/Passport tracking, smart document vault, and 60-day expiry notifications.'
    },
    {
      id: 'shifts',
      title: '3. Shift Master & Rotational Rostering',
      category: 'Operations',
      icon: Clock,
      summary: 'Configuring shift types, 1–31 monthly matrix scheduling, night flags, and bulk assignments.'
    },
    {
      id: 'attendance',
      title: '4. Biometric Attendance & Overtime Engine',
      category: 'Operations',
      icon: Calendar,
      summary: 'Biometric imports, 1.25x / 1.50x / 2.00x legal OT multipliers, and Landscape Time-Cards.'
    },
    {
      id: 'payroll',
      title: '5. Payroll Processing & A5 Payslips',
      category: 'Compensation',
      icon: DollarSign,
      summary: 'Gross-to-net engine, GOSI citizen/expat calculations, LMRA levies, and dual A5 vouchers.'
    },
    {
      id: 'indemnity',
      title: '6. Indemnity & End-of-Service (EOSB)',
      category: 'Compliance',
      icon: FileText,
      summary: 'Article 116 tiered gratuity formulas, resignation ratios, and settlement certificates.'
    },
    {
      id: 'leaves',
      title: '7. Leaves & Statutory Sick Pay Policy',
      category: 'HR Management',
      icon: Calendar,
      summary: '30-day annual leaves, Bahrain 3-tier sick pay (100% / 50% / Unpaid), and leave balances.'
    },
    {
      id: 'loans',
      title: '8. Loans & Salary Advances Ledger',
      category: 'Finance',
      icon: CreditCard,
      summary: 'Disbursements, repayment schedules, and automated monthly payroll deductions.'
    },
    {
      id: 'settings',
      title: '9. Settings, Weekly Off & Country Rules',
      category: 'Administration',
      icon: Settings,
      summary: 'Tabbed configuration, Weekly Holidays (Fri/Sat, Fri only, Sat/Sun), and Country presets.'
    },
    {
      id: 'faq',
      title: '10. FAQ & Troubleshooting Guide',
      category: 'Support',
      icon: HelpCircle,
      summary: 'Common operational inquiries, CSV punch import formats, and system recovery.'
    }
  ];

  const filteredTopics = topics.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentTopicIndex = topics.findIndex((t) => t.id === activeTopicId);
  const prevTopic = currentTopicIndex > 0 ? topics[currentTopicIndex - 1] : null;
  const nextTopic = currentTopicIndex < topics.length - 1 ? topics[currentTopicIndex + 1] : null;

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.classList.remove('printing-manual');
      setPrintTarget('current');
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const handlePrint = (mode = 'current') => {
    setPrintTarget(mode);
    document.body.classList.add('printing-manual');
    setTimeout(() => {
      window.print();
    }, 60);
  };

  const renderTopicContent = (topicId) => {
    return (
      <div className="manual-topic-content-body">
        {topicId === 'overview' && (
          <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Chapter 1 • Foundation</span>
                <h2 style={{ fontSize: '1.65rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  System Overview &amp; Gulf Labor Law Architecture
                </h2>
                <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  The <strong>Gulf HR Enterprise System</strong> is designed specifically for organizations operating in the Kingdom of Bahrain and Gulf Cooperation Council (GCC) countries. It enforces strict compliance with statutory regulations including <strong>Bahrain Labor Law No. 36 of 2012</strong>, the <strong>General Organisation for Social Insurance (GOSI)</strong>, and the <strong>Labour Market Regulatory Authority (LMRA)</strong>.
                </p>

                {/* ARCHITECTURE CARD */}
                <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={18} color="var(--primary)" /> Key System Pillars
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <div style={{ padding: '0.85rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <strong style={{ color: 'var(--primary)', display: 'block', fontSize: '0.875rem' }}>1. GCC Statutory Multi-Currency</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Native support for 3-decimal currencies (BHD, KWD, OMR: 0.000) and 2-decimal currencies (SAR, AED, QAR: 0.00).</span>
                    </div>
                    <div style={{ padding: '0.85rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <strong style={{ color: 'var(--primary)', display: 'block', fontSize: '0.875rem' }}>2. Expatriate vs National Segmentation</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Automated GOSI rates: Bahraini citizen deduction 7% / company 12% vs Expat deduction 1% / company 3% + 10 BD LMRA levy.</span>
                    </div>
                    <div style={{ padding: '0.85rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <strong style={{ color: 'var(--primary)', display: 'block', fontSize: '0.875rem' }}>3. Rotational Shifts &amp; Biometrics</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Multi-shift matrix with overnight shifts, flexible grace periods, biometric punch correlation, and rest-day OT multipliers.</span>
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.2rem', margin: '1.5rem 0 0.75rem', color: '#0f172a' }}>Standard Workflow &amp; Navigation</h3>
                <ol style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: '#334155', lineHeight: 1.8 }}>
                  <li><strong>Dashboard</strong>: Displays real-time executive KPIs, gross payroll forecasts, expiring CPR/Passport alerts, and active employee counts.</li>
                  <li><strong>Employees &amp; Vault</strong>: Employee onboarding, contract attachments, salary breakdowns, and document expiration monitoring.</li>
                  <li><strong>Shifts &amp; Rostering</strong>: Creation of morning, evening, night, and rotational shifts with monthly 1–31 grid scheduling.</li>
                  <li><strong>Attendance &amp; Biometrics</strong>: Biometric logs import, manual punches, shift-based overtime engine, and printable Landscape monthly sheets.</li>
                  <li><strong>Payroll &amp; A5 Payslips</strong>: One-click payroll generation, gross-to-net breakdown, GOSI/LMRA deduction, and A5 printable dual-receipt vouchers.</li>
                  <li><strong>Indemnity &amp; EOSB</strong>: Article 116 End-of-Service gratuity calculations and formal settlement certification.</li>
                  <li><strong>Leaves &amp; Vacations</strong>: 30-day annual leave entitlement and Bahrain statutory 3-stage sick pay tracking.</li>
                  <li><strong>Settings &amp; Rules</strong>: Compact tabbed management of company profile, weekly holidays, overtime multipliers, and public holidays.</li>
                </ol>
              </div>
            )
        }

        {topicId === 'employees' && (
          <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Chapter 2 • HR Management</span>
                <h2 style={{ fontSize: '1.65rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Employee Vault, Digital Dossiers &amp; Smart Expiry Alerts
                </h2>
                <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  The Employee Vault is the central digital archive for all workforce records. It tracks statutory identifiers, compensation details, and automatically sounds alerts 60 and 30 days before CPR cards, Passports, or Residence Permits expire.
                </p>

                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.75rem' }}>Procedure: Adding a New Employee</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                    <strong>Step 1: Open Employee Registration Modal</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#475569' }}>
                      Navigate to <strong>Employees &amp; Vault</strong> from the top navigation bar. Click the <strong>"+ Register New Employee"</strong> button on the top right.
                    </p>
                  </div>
                  <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                    <strong>Step 2: Enter Identity &amp; Statutory Categorization</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#475569' }}>
                      Enter Employee Code, Full Legal Name, Nationality, CPR / National ID number, Passport Number, and their Expiry Dates. Set Nationality status (Bahraini National vs Expat).
                    </p>
                  </div>
                  <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                    <strong>Step 3: Define Compensation &amp; Allowances</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#475569' }}>
                      Specify Monthly Basic Salary, Housing Allowance, Transport Allowance, and Other Allowances. The system automatically computes Gross Monthly Wage.
                    </p>
                  </div>
                  <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                    <strong>Step 4: Upload Digital Dossier Documents</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#475569' }}>
                      Attach signed Employment Contracts, CPR Copies, and Passport Scans directly in the Employee Document Vault tab.
                    </p>
                  </div>
                </div>

                <div style={{ padding: '1rem', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a', display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: '0.85rem', color: '#92400e' }}>
                    <strong>Legal Compliance Note on CPR &amp; Visa Expiries:</strong>
                    Under LMRA regulations, failing to renew employee visas or CPR cards before expiry incurs administrative fines. Always check the top navigation bar badge for active expiry alerts.
                  </div>
                </div>

                {/* CPR SMART CARD HARDWARE INTEGRATION */}
                <div style={{ padding: '1.25rem', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CreditCard size={18} color="#059669" /> Bahrain CPR &amp; GCC Smart Card Reader Integration (Port 5050)
                  </h4>
                  <p style={{ margin: '0 0 0.85rem', fontSize: '0.875rem', color: '#15803d', lineHeight: 1.5 }}>
                    Gulf HR Solution features hardware connectivity for USB Smart Card Readers (ACR38/ACR39, Rocketek, Identiv). It instantly auto-populates Bahraini &amp; GCC employee demographics, national ID numbers, expiry dates, home addresses, and <strong>biometric portrait photographs</strong> directly into the onboarding form.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ padding: '0.75rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #86efac' }}>
                      <strong style={{ display: 'block', fontSize: '0.8rem', color: '#166534' }}>1. Driver &amp; DLL Folder Structure</strong>
                      <span style={{ fontSize: '0.75rem', color: '#4b5563' }}>Place all card reader DLLs in the designated folder: <code>SaNDSLabCardBridge</code> inside your HR Solution folder.</span>
                    </div>
                    <div style={{ padding: '0.75rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #86efac' }}>
                      <strong style={{ display: 'block', fontSize: '0.8rem', color: '#166534' }}>2. 1-Click Launch Script</strong>
                      <span style={{ fontSize: '0.75rem', color: '#4b5563' }}>Right-click <code>Start_Bahrain_Card_Bridge.bat</code> &rarr; <em>Run as Administrator</em> to start the local service on Port 5050.</span>
                    </div>
                    <div style={{ padding: '0.75rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #86efac' }}>
                      <strong style={{ display: 'block', fontSize: '0.8rem', color: '#166534' }}>3. 2025/2026 Chip Orientation</strong>
                      <span style={{ fontSize: '0.75rem', color: '#4b5563' }}>Old CPR cards (front chip = face UP). New 2025/2026 cards (back chip = face DOWN towards reader contacts).</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <a
                      href={getSetupGuideUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <BookOpen size={14} /> Open Full Card Setup &amp; Installation Guide ↗
                    </a>
                    <a
                      href={getDownloadBridgeUrl()}
                      download="SaNDSLabCardBridge.zip"
                      className="btn btn-secondary btn-sm"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Download size={14} /> Download SaNDSLabCardBridge Drivers (.ZIP)
                    </a>
                  </div>
                </div>
              </div>
            )
        }

        {topicId === 'shifts' && (
          <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Chapter 3 • Operations</span>
                <h2 style={{ fontSize: '1.65rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Shift Master &amp; Monthly Rotational Rostering (1–31 Grid)
                </h2>
                <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  The shift module empowers managers to define rotational work patterns (e.g. Standard Morning 08:00–17:00, Evening 16:00–00:00, Night 00:00–08:00, or 24/7 Rotational shifts) and allocate them across employee matrices for any calendar month.
                </p>

                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.75rem' }}>Procedure: Defining &amp; Rostering Shifts</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                    <strong>Step 1: Open Shift Master</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#475569' }}>
                      Click on <strong>Shifts &amp; Rostering</strong> in the top navigation bar, and select the <strong>"Shift Master Templates"</strong> subtab.
                    </p>
                  </div>
                  <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                    <strong>Step 2: Create Shift Definition</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#475569' }}>
                      Click <strong>"+ Create New Shift"</strong>. Enter Shift Code (e.g., MORN, NGT, ROT1), Shift Name, Start Time, End Time, Grace Period (Minutes), Break Duration (Minutes), and toggle the <strong>Night Shift (Overnight)</strong> checkbox if the shift crosses midnight.
                    </p>
                  </div>
                  <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                    <strong>Step 3: Assign Shifts on the Monthly Roster Calendar</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#475569' }}>
                      Switch to the <strong>"Monthly Roster Calendar"</strong> subtab. Choose the Month and Year. You will see a complete 1–31 matrix with all active employees and days of the month.
                    </p>
                  </div>
                  <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                    <strong>Step 4: Use Bulk Schedule Assistant</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#475569' }}>
                      Click <strong>"⚡ Bulk Schedule Assistant"</strong> to assign an entire department or employee to a shift pattern for the whole month in 1 click, automatically respecting configured weekly rest days (e.g. Friday/Saturday).
                    </p>
                  </div>
                </div>
              </div>
            )
        }

        {topicId === 'attendance' && (
          <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Chapter 4 • Operations</span>
                <h2 style={{ fontSize: '1.65rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Biometric Attendance &amp; Shift-Based Overtime Engine
                </h2>
                <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  The attendance engine integrates biometric terminal punch data with assigned shifts to calculate accurate working hours, tardiness, early departures, and Bahrain statutory overtime rates.
                </p>

                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.75rem' }}>Overtime Multipliers Under Bahrain Labor Law:</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '0.85rem', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <strong style={{ color: '#1d4ed8' }}>☀️ Day Overtime: 1.25×</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#475569' }}>
                      Work performed beyond normal shift hours during daytime (07:00 – 19:00).
                    </p>
                  </div>
                  <div style={{ padding: '0.85rem', background: '#faf5ff', borderRadius: '8px', border: '1px solid #e9d5ff' }}>
                    <strong style={{ color: '#7e22ce' }}>🌙 Night Overtime: 1.50×</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#475569' }}>
                      Work performed between 19:00 and 07:00 as prescribed by Article 54.
                    </p>
                  </div>
                  <div style={{ padding: '0.85rem', background: '#fff1f2', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                    <strong style={{ color: '#be123c' }}>🏖️ Rest-Day / Holiday OT: 1.50× – 2.00×</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#475569' }}>
                      Work performed on official Weekly Rest Days or declared Public Holidays.
                    </p>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.75rem' }}>📋 Biometric CSV &amp; Excel Import Format Guidelines</h3>
                <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.75rem' }}>
                  When preparing biometric export logs from physical punch clocks (ZKTeco, Suprema, Anviz, Hikvision, Facial Terminals), structure the data in the following 6-column CSV or Excel format:
                </p>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <tr>
                        <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#1e293b' }}>Column Name</th>
                        <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#1e293b' }}>Format &amp; Rules</th>
                        <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#1e293b' }}>Example</th>
                        <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#1e293b' }}>Notes &amp; Validation</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#2563eb' }}>Employee Code</td>
                        <td style={{ padding: '0.6rem 0.75rem' }}>Employee code (or CPR / employee ID number)</td>
                        <td style={{ padding: '0.6rem 0.75rem' }}><code>EMP-001</code> / <code>951110482</code></td>
                        <td style={{ padding: '0.6rem 0.75rem', color: '#64748b' }}>Matches against company employees registry</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fcfdfe' }}>
                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#2563eb' }}>Date</td>
                        <td style={{ padding: '0.6rem 0.75rem' }}>Punch date (<code>YYYY-MM-DD</code>)</td>
                        <td style={{ padding: '0.6rem 0.75rem' }}><code>2026-10-11</code></td>
                        <td style={{ padding: '0.6rem 0.75rem', color: '#64748b' }}>Standard ISO date format</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#2563eb' }}>Check In</td>
                        <td style={{ padding: '0.6rem 0.75rem' }}>In-time (<code>HH:MM</code> or <code>HH:MM:SS</code>)</td>
                        <td style={{ padding: '0.6rem 0.75rem' }}><code>08:00</code></td>
                        <td style={{ padding: '0.6rem 0.75rem', color: '#64748b' }}>24-hour time notation</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fcfdfe' }}>
                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#2563eb' }}>Check Out</td>
                        <td style={{ padding: '0.6rem 0.75rem' }}>Out-time (<code>HH:MM</code> or <code>HH:MM:SS</code>)</td>
                        <td style={{ padding: '0.6rem 0.75rem' }}><code>16:30</code></td>
                        <td style={{ padding: '0.6rem 0.75rem', color: '#64748b' }}>Matched with assigned shift schedule</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#2563eb' }}>Status</td>
                        <td style={{ padding: '0.6rem 0.75rem' }}><code>Present</code>, <code>Absent</code>, <code>Half Day</code>, or <code>Leave</code></td>
                        <td style={{ padding: '0.6rem 0.75rem' }}><code>Present</code></td>
                        <td style={{ padding: '0.6rem 0.75rem', color: '#64748b' }}>Defaults to Present if In/Out times are provided</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#2563eb' }}>Manual OT Hours</td>
                        <td style={{ padding: '0.6rem 0.75rem' }}>Optional overtime override in hours (e.g. <code>1.5</code> or <code>0</code>)</td>
                        <td style={{ padding: '0.6rem 0.75rem' }}><code>1.5</code></td>
                        <td style={{ padding: '0.6rem 0.75rem', color: '#64748b' }}>If left 0 or blank, Bahrain statutory overtime is calculated automatically against the assigned shift schedule.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.75rem' }}>🔄 Biometric Batch Tracking &amp; Clean Rollback Mechanism</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #6366f1' }}>
                    <strong>1. Timestamped Import Batches</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#475569' }}>
                      Every biometric sync assigns a unique Batch Name and exact Date &amp; Time stamp (e.g. <code>BATCH-20261011-194132-214</code>).
                    </p>
                  </div>
                  <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                    <strong>2. Zero-Residual Batch Rollback &amp; Recalculation</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#475569' }}>
                      If an imported CSV had wrong timings or incorrect staff codes, open <strong>"Batch History &amp; Rollback"</strong> and click <strong>"Delete Batch"</strong>. The in-app confirmation popup allows you to completely remove all associated punches without leaving orphan records, so you can upload a corrected CSV file cleanly and recalculate attendance.
                    </p>
                  </div>
                  <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                    <strong>3. 1-Click CSV Template Download</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#475569' }}>
                      Click <strong>"Download CSV Template"</strong> in the Attendance page header or beside <strong>Bulk Shift Scheduler</strong> in the monthly roster to get a pre-populated CSV template containing all current company employee codes ready for data entry.
                    </p>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.75rem' }}>📊 Monthly Attendance Report (1–31 Matrix &amp; 30-Day Work Hours)</h3>
                <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Located directly after Monthly Shift Rostering, the <strong>Monthly Attendance Report</strong> presents a full 31-day visual attendance grid showing daily In-Time, Out-Time, Overtime tags, and sticky right-hand summary columns: <strong>Present Days</strong>, <strong>Total Overtime Hours</strong>, and <strong>Total Hours Worked (30 Days)</strong>.
                </p>

                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.75rem' }}>Procedure: Printing Landscape Monthly Time-Card Sheet</h3>
                <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem' }}>
                  Click <strong>"Landscape Monthly Sheet Print"</strong> in the Attendance page header. The system renders a 1–31 horizontal attendance and overtime summary sheet with Present (P), Absent (A), Weekend (W), Holiday (H), and Overtime breakdown. Click <strong>"Print Matrix"</strong> for formal paper auditing.
                </p>
              </div>
            )
        }

        {topicId === 'payroll' && (
          <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Chapter 5 • Compensation</span>
                <h2 style={{ fontSize: '1.65rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Payroll Processing &amp; A5 Dual-Voucher Payslips
                </h2>
                <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  The payroll calculation engine automatically aggregates basic salary, housing, transport, other allowances, overtime wages, and subtracts GOSI social security and loan advance installments.
                </p>

                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.75rem' }}>Procedure: Executing Monthly Payroll Run</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                    <strong>Step 1: Select Period &amp; Verify Attendance</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#475569' }}>
                      Navigate to <strong>Payroll &amp; A5 Payslips</strong>. Ensure attendance logs and approved leaves for the target month have been reviewed.
                    </p>
                  </div>
                  <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                    <strong>Step 2: Generate Monthly Payroll Run</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#475569' }}>
                      Click <strong>"Generate Payroll Run"</strong>. The engine calculates net pay for every employee using their registered basic wage, allowances, overtime hours, and deduction rules.
                    </p>
                  </div>
                  <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                    <strong>Step 3: Print A5 Dual Printable Payslips</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#475569' }}>
                      Click the <strong>Print Payslip</strong> action next to any employee. The system opens a specialized <strong>A5 Landscape Dual-Voucher</strong> with an Employee Copy and an Office Copy with signature fields for labor inspection compliance.
                    </p>
                  </div>
                </div>
              </div>
            )
        }

        {topicId === 'indemnity' && (
          <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Chapter 6 • Compliance</span>
                <h2 style={{ fontSize: '1.65rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Indemnity &amp; End-of-Service (EOSB) Gratuity Calculation
                </h2>
                <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  Under <strong>Bahrain Labor Law No. 36 of 2012 (Article 116)</strong>, expatriate employees are entitled to end-of-service gratuity upon departure from the company based on length of service and final basic wage.
                </p>

                <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem', color: '#166534', fontSize: '0.95rem' }}>Article 116 Gratuity Rate Scale:</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#15803d', lineHeight: 1.6 }}>
                    <li><strong>First 3 Years:</strong> Half month's basic wage (15 days basic wage) for each year of service.</li>
                    <li><strong>4th Year and Beyond:</strong> One full month's basic wage (30 days basic wage) for each subsequent year of service.</li>
                    <li><strong>Fractions of a Year:</strong> Calculated proportionally on a pro-rata calendar basis.</li>
                  </ul>
                </div>

                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.75rem' }}>Procedure: Issuing Final Settlement Certificate</h3>
                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                  Navigate to <strong>Indemnity &amp; EOSB</strong>. Select the terminating employee, select Termination Type (Company Termination, Resignation, or Retirement), enter the last working date, and click <strong>"Calculate Settlement"</strong>. Print the formal Settlement Certificate with sign-off acknowledgment.
                </p>
              </div>
            )
        }

        {topicId === 'leaves' && (
          <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Chapter 7 • HR Management</span>
                <h2 style={{ fontSize: '1.65rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Leaves, Vacations &amp; Bahrain Statutory Sick Pay Policy
                </h2>
                <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  The Leave Management module tracks annual vacation allowances, maternity leave, bereavement, and enforces the statutory 3-stage sick pay progression required under Bahrain Labor Law Article 65.
                </p>

                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.75rem' }}>Bahrain Sick Leave Statutory Scale (Per Year of Service):</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '0.85rem', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                    <strong style={{ color: '#047857' }}>Stage 1: 15 Days</strong>
                    <div style={{ fontSize: '0.8rem', color: '#065f46', marginTop: '0.2rem' }}>100% Full Basic &amp; Allowances Pay</div>
                  </div>
                  <div style={{ padding: '0.85rem', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                    <strong style={{ color: '#b45309' }}>Stage 2: 20 Days</strong>
                    <div style={{ fontSize: '0.8rem', color: '#92400e', marginTop: '0.2rem' }}>50% Half Pay</div>
                  </div>
                  <div style={{ padding: '0.85rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                    <strong style={{ color: '#b91c1c' }}>Stage 3: 20 Days</strong>
                    <div style={{ fontSize: '0.8rem', color: '#991b1b', marginTop: '0.2rem' }}>Unpaid Leave</div>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.75rem' }}>Procedure: Requesting &amp; Approving Leave</h3>
                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                  Click <strong>"Apply for Leave"</strong> in the Leaves tab. Select employee, leave category (Annual, Sick, Casual, Maternity, Hajj), start date, and end date. Once approved by HR, dates are automatically marked on the Monthly Roster and Attendance sheets.
                </p>
              </div>
            )
        }

        {topicId === 'loans' && (
          <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Chapter 8 • Finance</span>
                <h2 style={{ fontSize: '1.65rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Employee Loans &amp; Salary Advances Ledger
                </h2>
                <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  Manage company loans, emergency salary advances, and installment deduction schedules. Under Article 24 of Bahrain Labor Law, deductions from monthly wages for debt repayments must not exceed the statutory limit (typically 10% to 25% of monthly wage).
                </p>

                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.75rem' }}>Procedure: Granting an Employee Loan</h3>
                <ol style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#334155', lineHeight: 1.8 }}>
                  <li>Go to <strong>Loans &amp; Advances</strong>. Click <strong>"+ Create Loan"</strong>.</li>
                  <li>Select the employee, enter Loan Amount, Monthly Installment, and Repayment Start Month.</li>
                  <li>When monthly payroll is run, the installment is automatically deducted and deducted balance is updated in real time until fully repaid.</li>
                </ol>
              </div>
            )
        }

        {topicId === 'settings' && (
          <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Chapter 9 • Administration</span>
                <h2 style={{ fontSize: '1.65rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  System Settings, Weekly Holidays &amp; Country Rules
                </h2>
                <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  The redesigned compact tabbed Settings page allows administrators to configure regional parameters with one click.
                </p>

                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.75rem' }}>How to Change Weekly Holidays:</h3>
                <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe', marginBottom: '1.5rem' }}>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#1e3a8a', fontWeight: 700 }}>
                    Steps to switch from Friday &amp; Saturday to Friday Only, Saturday &amp; Sunday, or custom days:
                  </p>
                  <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#1e40af', lineHeight: 1.6 }}>
                    <li>Click on <strong>Settings &amp; Rules</strong> in the top navigation bar.</li>
                    <li>Click on the <strong>"Weekly Rest Days"</strong> tab.</li>
                    <li>Choose a quick preset: <strong>"Friday &amp; Saturday"</strong>, <strong>"Saturday &amp; Sunday"</strong>, or <strong>"Friday Only"</strong>, OR toggle any day of the week manually.</li>
                    <li>Click <strong>"Save All Settings"</strong> at the top right or bottom toolbar.</li>
                  </ol>
                </div>
              </div>
            )
        }

        {topicId === 'faq' && (
          <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Chapter 10 • Support</span>
                <h2 style={{ fontSize: '1.65rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Frequently Asked Questions &amp; Troubleshooting
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.95rem', color: '#0f172a' }}>
                      Q1: Can I change currency from BHD (3 decimals) to SAR or AED (2 decimals)?
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                      Yes. Go to Settings &gt; Regional &amp; Currency tab and click the country preset button (e.g., 🇸🇦 Saudi Arabia or 🇦🇪 UAE). Then click "Save All Settings".
                    </p>
                  </div>

                  <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.95rem', color: '#0f172a' }}>
                      Q2: How does the system handle punches on public holidays?
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                      Any attendance punch on a date registered under Settings &gt; Holiday Calendar automatically qualifies for the statutory <strong>Holiday Overtime Multiplier (2.00×)</strong>.
                    </p>
                  </div>

                  <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.95rem', color: '#0f172a' }}>
                      Q3: How do I contact official technical support?
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                      Click on the <strong>SaNDS Lab</strong> link in the footer to open the support popup, or message WhatsApp directly at <strong>+97335078079</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )
        }
      </div>
    );
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="manual-modal-overlay" onClick={onClose}>
      <div className="manual-modal-window" onClick={(e) => e.stopPropagation()}>
        {/* HEADER BAR */}
        <div className="manual-modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb, #ec4899)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.35)'
              }}
            >
              <BookOpen size={20} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                Gulf HR Enterprise — Official User Manual &amp; Standard Operating Procedures
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                Complete step-by-step procedures, screenshot guides, and statutory Gulf Labor Law references
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handlePrint('current')}
              title="Print active chapter on 1 single page"
            >
              <Printer size={14} /> Print This Topic (1 Page)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handlePrint('all')}
              style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)' }}
              title="Print all chapters (each on a single page)"
            >
              <Printer size={14} /> Print All (1 Page Each)
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#ffffff',
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* BODY WORKSPACE */}
        <div className="manual-body-workspace" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* LEFT SIDEBAR: TOPICS NAV */}
          <div
            className="manual-sidebar no-print"
            style={{
              width: '320px',
              borderRight: '1px solid var(--border-subtle, #e2e8f0)',
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0
            }}
          >
            {/* Search Input */}
            <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-subtle, #e2e8f0)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search topics or procedures..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.75rem 0.45rem 2rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.825rem',
                    background: '#ffffff',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Topics List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
              {filteredTopics.map((topic) => {
                const Icon = topic.icon;
                const isActive = activeTopicId === topic.id;
                return (
                  <div
                    key={topic.id}
                    onClick={() => setActiveTopicId(topic.id)}
                    style={{
                      padding: '0.75rem 0.85rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      marginBottom: '0.35rem',
                      background: isActive ? '#ffffff' : 'transparent',
                      border: isActive ? '1px solid var(--primary-border, #bfdbfe)' : '1px solid transparent',
                      boxShadow: isActive ? '0 2px 8px rgba(37, 99, 235, 0.12)' : 'none',
                      transition: 'all 0.15s ease',
                      borderLeft: isActive ? '4px solid var(--primary, #2563eb)' : '4px solid transparent'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <Icon size={16} color={isActive ? 'var(--primary, #2563eb)' : '#64748b'} />
                      <span style={{ fontSize: '0.85rem', fontWeight: isActive ? 700 : 600, color: isActive ? 'var(--primary, #2563eb)' : '#1e293b' }}>
                        {topic.title}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: 1.3, paddingLeft: '1.5rem' }}>
                      {topic.summary}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Quick Contact Footer in Sidebar */}
            <div style={{ padding: '0.85rem', borderTop: '1px solid #e2e8f0', background: '#f1f5f9', fontSize: '0.75rem', color: '#64748b' }}>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>Engineered by SaNDS Lab</div>
              <div>WhatsApp Support: <strong>+97335078079</strong></div>
            </div>
          </div>

          {/* RIGHT VIEWPORT: TOPIC CONTENT */}
          <div
            className="manual-content-viewport"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '2rem',
              background: '#ffffff',
              color: '#1e293b'
            }}
          >
            {printTarget === 'all' ? (
              <div className="manual-all-print-container">
                {topics.map((t) => (
                  <div key={t.id} className="manual-chapter-sheet">
                    <div className="manual-print-doc-header">
                      <div className="manual-doc-header-inner">
                        <div>
                          <strong className="manual-doc-title">GULF HR ENTERPRISE SOLUTION</strong>
                          <div className="manual-doc-sub">Standard Operating Procedure (SOP) • System Manual</div>
                        </div>
                        <div className="manual-doc-meta">
                          <div>Bahrain Labor Law No. 36 of 2012</div>
                          <div>Chapter SOP-{t.id.toUpperCase()}</div>
                        </div>
                      </div>
                    </div>
                    {renderTopicContent(t.id)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="manual-single-sheet">
                <div className="manual-print-doc-header">
                  <div className="manual-doc-header-inner">
                    <div>
                      <strong className="manual-doc-title">GULF HR ENTERPRISE SOLUTION</strong>
                      <div className="manual-doc-sub">Standard Operating Procedure (SOP) • System Manual</div>
                    </div>
                    <div className="manual-doc-meta">
                      <div>Bahrain Labor Law No. 36 of 2012</div>
                      <div>Chapter SOP-{activeTopicId.toUpperCase()}</div>
                    </div>
                  </div>
                </div>
                {renderTopicContent(activeTopicId)}
              </div>
            )}

            {/* PREVIOUS / NEXT TOPIC FOOTER */}
            <div
              className="manual-footer-nav no-print"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                marginTop: '2.5rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid #e2e8f0',
                width: '100%'
              }}
            >
              {prevTopic ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveTopicId(prevTopic.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <ChevronLeft size={15} /> Previous: {prevTopic.title}
                </button>
              ) : <div />}

              {nextTopic && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setActiveTopicId(nextTopic.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: 'auto' }}
                >
                  Next: {nextTopic.title} <ChevronRight size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  ,
    document.body
  );
};
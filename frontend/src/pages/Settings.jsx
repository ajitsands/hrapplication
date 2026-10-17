// frontend/src/pages/Settings.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { UserManagement } from '../components/UserManagement';
import {
  Building,
  Globe2,
  ShieldAlert,
  ShieldCheck,
  CalendarDays,
  Clock,
  Calendar,
  CheckCircle2,
  Save,
  Plus,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const Settings = () => {
  const { settings, refreshSettings, showToast, formatDate } = useAuth();
  const [formData, setFormData] = useState({ ...settings });
  const [holidays, setHolidays] = useState([]);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('company');
  const [isSaving, setIsSaving] = useState(false);
  const [holidayForm, setHolidayForm] = useState({
    name: '',
    holiday_date: new Date().toISOString().slice(0, 10),
    is_recurring: 1,
    description: 'National Public Holiday'
  });

  const allDaysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const currentWeeklyDays = formData.weekly_off_days || 'Friday,Saturday';
  const selectedDaysList = currentWeeklyDays.split(',').map((s) => s.trim()).filter(Boolean);

  const toggleDay = (day) => {
    let nextList;
    if (selectedDaysList.includes(day)) {
      nextList = selectedDaysList.filter((d) => d !== day);
    } else {
      nextList = [...selectedDaysList, day];
    }
    if (nextList.length === 0) {
      showToast('Validation', 'At least one weekly rest day should be specified', 'warning');
      return;
    }
    setFormData((prev) => ({ ...prev, weekly_off_days: nextList.join(',') }));
  };

  useEffect(() => {
    setFormData({ ...settings });
    fetchHolidays();
  }, [settings]);

  const fetchHolidays = async () => {
    try {
      const res = await api.get('/settings/holidays');
      if (res.success) setHolidays(res.data);
    } catch {
      // ignore
    }
  };

  const handleCountryPreset = (countryCode) => {
    const presets = {
      BH: { country: 'Bahrain', country_code: 'BH', timezone: 'Asia/Bahrain', currency: 'BHD', currency_symbol: 'BD', currency_decimals: 3, gosi_citizen_emp_rate: 7, gosi_citizen_comp_rate: 12, gosi_expat_emp_rate: 1, gosi_expat_comp_rate: 3, lmra_monthly_fee: 10, ot_normal_multiplier: 1.25, ot_night_multiplier: 1.50, ot_holiday_multiplier: 2.00, indemnity_tier1_max_years: 3, indemnity_tier1_days_per_year: 15, indemnity_tier2_days_per_year: 30 },
      SA: { country: 'Saudi Arabia', country_code: 'SA', timezone: 'Asia/Riyadh', currency: 'SAR', currency_symbol: 'SR', currency_decimals: 2, gosi_citizen_emp_rate: 9.75, gosi_citizen_comp_rate: 11.75, gosi_expat_emp_rate: 0, gosi_expat_comp_rate: 2, lmra_monthly_fee: 0, ot_normal_multiplier: 1.50, ot_night_multiplier: 1.50, ot_holiday_multiplier: 2.00, indemnity_tier1_max_years: 5, indemnity_tier1_days_per_year: 15, indemnity_tier2_days_per_year: 30 },
      AE: { country: 'United Arab Emirates', country_code: 'AE', timezone: 'Asia/Dubai', currency: 'AED', currency_symbol: 'AED', currency_decimals: 2, gosi_citizen_emp_rate: 5, gosi_citizen_comp_rate: 12.5, gosi_expat_emp_rate: 0, gosi_expat_comp_rate: 0, lmra_monthly_fee: 0, ot_normal_multiplier: 1.25, ot_night_multiplier: 1.50, ot_holiday_multiplier: 2.00, indemnity_tier1_max_years: 5, indemnity_tier1_days_per_year: 21, indemnity_tier2_days_per_year: 30 },
      KW: { country: 'Kuwait', country_code: 'KW', timezone: 'Asia/Kuwait', currency: 'KWD', currency_symbol: 'KD', currency_decimals: 3, gosi_citizen_emp_rate: 10.5, gosi_citizen_comp_rate: 11.5, gosi_expat_emp_rate: 0, gosi_expat_comp_rate: 0, lmra_monthly_fee: 0, ot_normal_multiplier: 1.25, ot_night_multiplier: 1.50, ot_holiday_multiplier: 2.00, indemnity_tier1_max_years: 5, indemnity_tier1_days_per_year: 15, indemnity_tier2_days_per_year: 30 },
      QA: { country: 'Qatar', country_code: 'QA', timezone: 'Asia/Qatar', currency: 'QAR', currency_symbol: 'QR', currency_decimals: 2, gosi_citizen_emp_rate: 6, gosi_citizen_comp_rate: 14, gosi_expat_emp_rate: 0, gosi_expat_comp_rate: 0, lmra_monthly_fee: 0, ot_normal_multiplier: 1.25, ot_night_multiplier: 1.50, ot_holiday_multiplier: 2.00, indemnity_tier1_max_years: 5, indemnity_tier1_days_per_year: 21, indemnity_tier2_days_per_year: 30 },
      OM: { country: 'Oman', country_code: 'OM', timezone: 'Asia/Muscat', currency: 'OMR', currency_symbol: 'RO', currency_decimals: 3, gosi_citizen_emp_rate: 7, gosi_citizen_comp_rate: 10.5, gosi_expat_emp_rate: 0, gosi_expat_comp_rate: 1, lmra_monthly_fee: 0, ot_normal_multiplier: 1.25, ot_night_multiplier: 1.50, ot_holiday_multiplier: 2.00, indemnity_tier1_max_years: 3, indemnity_tier1_days_per_year: 15, indemnity_tier2_days_per_year: 30 }
    };

    if (presets[countryCode]) {
      setFormData((prev) => ({ ...prev, ...presets[countryCode] }));
      showToast('Preset Loaded', `Switched regional defaults to ${presets[countryCode].country}`, 'info');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitSettings = async (e) => {
    if (e) e.preventDefault();
    if (!formData.company_name?.trim()) {
      showToast('Validation Error', 'Company legal name is required', 'warning');
      setActiveTab('company');
      return;
    }
    try {
      setIsSaving(true);
      const res = await api.put('/settings', formData);
      if (res.success) {
        showToast('Settings Saved', 'System rules and Gulf regional configurations updated!', 'success');
        confetti({ particleCount: 70, spread: 60 });
        refreshSettings();
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to update settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/settings/holidays', holidayForm);
      if (res.success) {
        showToast('Holiday Added', 'Official holiday registered!', 'success');
        setIsHolidayModalOpen(false);
        fetchHolidays();
        setHolidayForm({
          name: '',
          holiday_date: new Date().toISOString().slice(0, 10),
          is_recurring: 1,
          description: 'National Public Holiday'
        });
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to add holiday', 'error');
    }
  };

  const tabs = [
    { id: 'company', label: 'Company Info', icon: Building, badge: null },
    { id: 'users', label: 'User & Access Control', icon: ShieldCheck, badge: null },
    { id: 'regional', label: 'Regional & Currency', icon: Globe2, badge: formData.country_code || 'BH' },
    { id: 'gosi', label: 'GOSI & LMRA Rules', icon: ShieldAlert, badge: null },
    { id: 'weekly_off', label: 'Weekly Rest Days', icon: CalendarDays, badge: `${selectedDaysList.length} Off` },
    { id: 'overtime', label: 'Overtime & Indemnity', icon: Clock, badge: null },
    { id: 'holidays', label: 'Holiday Calendar', icon: Calendar, badge: `${holidays.length}` }
  ];

  const currentTabIndex = tabs.findIndex((t) => t.id === activeTab);
  const prevTab = currentTabIndex > 0 ? tabs[currentTabIndex - 1] : null;
  const nextTab = currentTabIndex < tabs.length - 1 ? tabs[currentTabIndex + 1] : null;

  return (
    <div>
      {/* Page Header with Persistent Save Button */}
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div className="page-title-group">
          <h2>Gulf System Settings &amp; Access Rules</h2>
          <p>Configurable Bahrain &amp; GCC regional rules, portal user accounts, social security (GOSI), LMRA fees, and overtime formulas</p>
        </div>

        <div className="header-action-group">
          {activeTab !== 'users' && (
            <button
              type="button"
              className="btn btn-gold btn-md"
              onClick={handleSubmitSettings}
              disabled={isSaving}
              style={{ minWidth: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 700 }}
            >
              <Save size={16} />
              {isSaving ? 'Saving Changes...' : 'Save All Settings'}
            </button>
          )}
        </div>
      </div>

      {/* COMPACT HORIZONTAL NAVIGATION TABS BAR */}
      <div
        style={{
          display: 'flex',
          gap: '0.4rem',
          padding: '0.4rem',
          background: 'var(--surface-card, #ffffff)',
          borderRadius: 'var(--radius-lg, 12px)',
          border: '1px solid var(--border-subtle, #e2e8f0)',
          boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
          marginBottom: '1.25rem',
          overflowX: 'auto',
          alignItems: 'center'
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md, 8px)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 600,
                color: isActive ? '#ffffff' : 'var(--text-secondary, #475569)',
                background: isActive ? 'var(--gradient-button, linear-gradient(135deg, #2563eb, #db2777))' : 'transparent',
                boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <Icon size={16} style={{ color: isActive ? '#ffffff' : 'var(--primary, #2563eb)' }} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    background: isActive ? 'rgba(255, 255, 255, 0.25)' : '#f1f5f9',
                    color: isActive ? '#ffffff' : 'var(--text-primary, #0f172a)'
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* USER MANAGEMENT TAB */}
      {activeTab === 'users' && <UserManagement />}

      {/* MAIN SETTINGS FORM CONTAINER */}
      {activeTab !== 'users' && (
        <form onSubmit={handleSubmitSettings}>
          {/* ========================================================= */}
          {/* TAB 1: COMPANY PROFILE */}
          {/* ========================================================= */}
          {activeTab === 'company' && (
          <div className="card" style={{ marginTop: 0 }}>
            <div className="card-header">
              <div className="card-title">
                <Building size={18} color="var(--primary)" />
                <span>Company Information &amp; Official Identification</span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label required">Company Legal Name</label>
                <input
                  type="text"
                  name="company_name"
                  className="form-control"
                  required
                  value={formData.company_name || ''}
                  onChange={handleChange}
                  placeholder="e.g. SaNDS Lab Middle East W.L.L."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Commercial Registration (CR No)</label>
                <input
                  type="text"
                  name="cr_no"
                  className="form-control"
                  placeholder="CR-984210-BH"
                  value={formData.cr_no || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">VAT / Tax Identification No</label>
                <input
                  type="text"
                  name="tax_number"
                  className="form-control"
                  placeholder="30098421000003"
                  value={formData.tax_number || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Official Phone</label>
                <input
                  type="text"
                  name="company_phone"
                  className="form-control"
                  placeholder="+973 1700 0000"
                  value={formData.company_phone || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">HR Official Email</label>
                <input
                  type="email"
                  name="company_email"
                  className="form-control"
                  placeholder="hr@company.com"
                  value={formData.company_email || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Company Registered Address</label>
              <input
                type="text"
                name="company_address"
                className="form-control"
                placeholder="Building 450, Road 2810, Block 428, Seef District, Manama, Kingdom of Bahrain"
                value={formData.company_address || ''}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: REGIONAL, TIMEZONE & CURRENCY */}
        {/* ========================================================= */}
        {activeTab === 'regional' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Country Quick Presets */}
            <div className="card" style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', margin: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                    <Globe2 size={17} color="var(--primary)" /> Gulf Country Quick Preset Switcher
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
                    Click a country to instantly load its statutory GOSI rates, currency decimals, and labor law defaults:
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {[
                    { code: 'BH', name: '🇧🇭 Bahrain (Default)' },
                    { code: 'SA', name: '🇸🇦 Saudi Arabia' },
                    { code: 'AE', name: '🇦🇪 UAE' },
                    { code: 'KW', name: '🇰🇼 Kuwait' },
                    { code: 'QA', name: '🇶🇦 Qatar' },
                    { code: 'OM', name: '🇴🇲 Oman' }
                  ].map((c) => (
                    <button
                      type="button"
                      key={c.code}
                      className={`btn btn-sm ${formData.country_code === c.code ? 'btn-gold' : 'btn-secondary'}`}
                      onClick={() => handleCountryPreset(c.code)}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="card" style={{ margin: 0 }}>
              <div className="card-header">
                <div className="card-title">
                  <Globe2 size={18} color="var(--accent-gold)" />
                  <span>Regional Timezone, Currency &amp; Date Format</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input type="text" name="country" className="form-control" value={formData.country || ''} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Country Code</label>
                  <input type="text" name="country_code" className="form-control" value={formData.country_code || ''} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Time Zone</label>
                  <select name="timezone" className="form-control" value={formData.timezone || 'Asia/Bahrain'} onChange={handleChange}>
                    <option value="Asia/Bahrain">Asia/Bahrain (GMT+3)</option>
                    <option value="Asia/Riyadh">Asia/Riyadh (GMT+3)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                    <option value="Asia/Kuwait">Asia/Kuwait (GMT+3)</option>
                    <option value="Asia/Qatar">Asia/Qatar (GMT+3)</option>
                    <option value="Asia/Muscat">Asia/Muscat (GMT+4)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Currency Code</label>
                  <input type="text" name="currency" className="form-control" value={formData.currency || ''} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Currency Symbol</label>
                  <input type="text" name="currency_symbol" className="form-control" value={formData.currency_symbol || ''} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Currency Decimal Precision</label>
                  <select name="currency_decimals" className="form-control" value={formData.currency_decimals || 3} onChange={handleChange}>
                    <option value={3}>3 Decimals (Standard for BHD, KWD, OMR: 0.000)</option>
                    <option value={2}>2 Decimals (Standard for SAR, AED, QAR: 0.00)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: GOSI & LMRA RULES */}
        {/* ========================================================= */}
        {activeTab === 'gosi' && (
          <div className="card" style={{ marginTop: 0 }}>
            <div className="card-header">
              <div className="card-title">
                <ShieldAlert size={18} color="var(--success)" />
                <span>GOSI Social Insurance &amp; LMRA Labor Market Rules</span>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              These percentages govern automated deductions in the monthly payroll engine for both Bahraini/GCC Nationals and Expatriate workforces.
            </p>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">GOSI Citizen Employee Deduction (%)</label>
                <input
                  type="number"
                  step="0.01"
                  name="gosi_citizen_emp_rate"
                  className="form-control"
                  value={formData.gosi_citizen_emp_rate ?? ''}
                  onChange={handleChange}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Deducted from national employee basic + allowances</span>
              </div>
              <div className="form-group">
                <label className="form-label">GOSI Citizen Employer Share (%)</label>
                <input
                  type="number"
                  step="0.01"
                  name="gosi_citizen_comp_rate"
                  className="form-control"
                  value={formData.gosi_citizen_comp_rate ?? ''}
                  onChange={handleChange}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Company contribution for national citizens</span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">GOSI Expat Employee Deduction (%)</label>
                <input
                  type="number"
                  step="0.01"
                  name="gosi_expat_emp_rate"
                  className="form-control"
                  value={formData.gosi_expat_emp_rate ?? ''}
                  onChange={handleChange}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Work injury insurance (typically 1% in Bahrain)</span>
              </div>
              <div className="form-group">
                <label className="form-label">GOSI Expat Employer Share (%)</label>
                <input
                  type="number"
                  step="0.01"
                  name="gosi_expat_comp_rate"
                  className="form-control"
                  value={formData.gosi_expat_comp_rate ?? ''}
                  onChange={handleChange}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Company contribution for expat employees (typically 3%)</span>
              </div>
              <div className="form-group">
                <label className="form-label">LMRA Monthly Levy ({formData.currency || 'BHD'})</label>
                <input
                  type="number"
                  step="0.001"
                  name="lmra_monthly_fee"
                  className="form-control"
                  value={formData.lmra_monthly_fee ?? ''}
                  onChange={handleChange}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Standard 10 BD / month per foreign work permit</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: WEEKLY REST DAYS & WEEKEND POLICY */}
        {/* ========================================================= */}
        {activeTab === 'weekly_off' && (
          <div className="card" style={{ marginTop: 0 }}>
            <div className="card-header">
              <div className="card-title">
                <CalendarDays size={18} color="var(--primary)" />
                <span>Weekly Rest Days &amp; Weekend Policy (Labor Law Off-Days)</span>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Specify the company's official weekly non-working days. Punches on these days automatically calculate under <strong>Holiday / Rest-Day Overtime (1.50x – 2.00x)</strong> and are designated as <code>OFF / Weekend</code> across the Monthly Shift Roster and 1–31 Landscape Matrix.
            </p>

            {/* Quick Weekend Presets */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Quick Weekend Presets:</label>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${currentWeeklyDays === 'Friday,Saturday' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFormData({ ...formData, weekly_off_days: 'Friday,Saturday' })}
                >
                  🇧🇭 Friday &amp; Saturday (Standard GCC)
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${currentWeeklyDays === 'Saturday,Sunday' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFormData({ ...formData, weekly_off_days: 'Saturday,Sunday' })}
                >
                  🇦🇪 Saturday &amp; Sunday (UAE &amp; Global)
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${currentWeeklyDays === 'Friday' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFormData({ ...formData, weekly_off_days: 'Friday' })}
                >
                  🏗️ Friday Only (6-Day Work Week)
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${currentWeeklyDays === 'Sunday' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFormData({ ...formData, weekly_off_days: 'Sunday' })}
                >
                  📅 Sunday Only (6-Day Work Week)
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${currentWeeklyDays === 'Thursday,Friday' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFormData({ ...formData, weekly_off_days: 'Thursday,Friday' })}
                >
                  🕌 Thursday &amp; Friday (Traditional)
                </button>
              </div>
            </div>

            {/* Custom Day-by-Day Toggle Badges */}
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Custom Day-by-Day Selection:
              </label>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {allDaysOfWeek.map((day) => {
                  const isSelected = selectedDaysList.includes(day);
                  return (
                    <div
                      key={day}
                      onClick={() => toggleDay(day)}
                      style={{
                        padding: '0.55rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        userSelect: 'none',
                        transition: 'all 0.2s ease',
                        background: isSelected ? 'var(--gradient-button)' : '#f8fafc',
                        color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                        border: isSelected ? '1px solid transparent' : '1px solid var(--border-subtle)',
                        boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none'
                      }}
                    >
                      <CheckCircle2 size={15} style={{ opacity: isSelected ? 1 : 0.35 }} />
                      {day}
                      {isSelected && <span style={{ fontSize: '0.72rem', opacity: 0.9 }}> (Rest Day)</span>}
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                Currently Configured Rest Days: <strong style={{ color: 'var(--primary)' }}>{formData.weekly_off_days || 'Friday,Saturday'}</strong>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: OVERTIME & INDEMNITY */}
        {/* ========================================================= */}
        {activeTab === 'overtime' && (
          <div className="card" style={{ marginTop: 0 }}>
            <div className="card-header">
              <div className="card-title">
                <Clock size={18} color="var(--primary)" />
                <span>Bahrain Labor Law Overtime &amp; Indemnity (EOSB) Gratuity Formula</span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Normal Day OT Multiplier</label>
                <input
                  type="number"
                  step="0.05"
                  name="ot_normal_multiplier"
                  className="form-control"
                  value={formData.ot_normal_multiplier ?? ''}
                  onChange={handleChange}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Statutory standard: 1.25x</span>
              </div>
              <div className="form-group">
                <label className="form-label">Night / Weekend OT Multiplier</label>
                <input
                  type="number"
                  step="0.05"
                  name="ot_night_multiplier"
                  className="form-control"
                  value={formData.ot_night_multiplier ?? ''}
                  onChange={handleChange}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Statutory standard: 1.50x</span>
              </div>
              <div className="form-group">
                <label className="form-label">Official Holiday OT Multiplier</label>
                <input
                  type="number"
                  step="0.05"
                  name="ot_holiday_multiplier"
                  className="form-control"
                  value={formData.ot_holiday_multiplier ?? ''}
                  onChange={handleChange}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Statutory standard: 2.00x</span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Indemnity Tier 1 Max Service (Years)</label>
                <input
                  type="number"
                  name="indemnity_tier1_max_years"
                  className="form-control"
                  value={formData.indemnity_tier1_max_years ?? ''}
                  onChange={handleChange}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>First 3 years of continuous service</span>
              </div>
              <div className="form-group">
                <label className="form-label">Tier 1 Rate (Days Basic Wage / Year)</label>
                <input
                  type="number"
                  step="0.5"
                  name="indemnity_tier1_days_per_year"
                  className="form-control"
                  value={formData.indemnity_tier1_days_per_year ?? ''}
                  onChange={handleChange}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>15 days basic wage / year</span>
              </div>
              <div className="form-group">
                <label className="form-label">Tier 2 Rate (Days Basic Wage / Year)</label>
                <input
                  type="number"
                  step="0.5"
                  name="indemnity_tier2_days_per_year"
                  className="form-control"
                  value={formData.indemnity_tier2_days_per_year ?? ''}
                  onChange={handleChange}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>30 days basic wage / year for 4th year onwards</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: OFFICIAL HOLIDAYS */}
        {/* ========================================================= */}
        {activeTab === 'holidays' && (
          <div className="card" style={{ marginTop: 0 }}>
            <div className="card-header">
              <div className="card-title">
                <Calendar size={18} color="var(--primary)" />
                <span>Official Holiday Calendar ({holidays.length} Registered Public Holidays)</span>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsHolidayModalOpen(true)}
              >
                <Plus size={14} /> Add Holiday
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
              {holidays.map((h) => (
                <div
                  key={h.id}
                  style={{
                    padding: '0.75rem 1rem',
                    background: '#f8fafc',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{h.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{h.description || 'Public Holiday'}</div>
                  </div>
                  <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                    {formatDate(h.holiday_date)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PERSISTENT ACTION FOOTER TOOLBAR (OUTSIDE ALL TABS) */}
        {/* ========================================================= */}
        <div
          style={{
            marginTop: '1.25rem',
            padding: '1rem 1.25rem',
            background: 'var(--surface-card, #ffffff)',
            borderRadius: 'var(--radius-lg, 12px)',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.05))'
          }}
        >
          {/* Left Navigation Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {prevTab && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab(prevTab.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <ArrowLeft size={14} /> Previous: {prevTab.label}
              </button>
            )}
            {nextTab && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab(nextTab.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                Next: {nextTab.label} <ArrowRight size={14} />
              </button>
            )}
          </div>

          {/* Right: Primary Save Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Sparkles size={14} color="var(--accent-gold)" /> Saves all tabs simultaneously
            </span>
            <button
              type="submit"
              className="btn btn-gold btn-md"
              disabled={isSaving}
              style={{ minWidth: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 700 }}
            >
              <Save size={16} />
              {isSaving ? 'Saving Changes...' : 'Save All Settings'}
            </button>
          </div>
        </div>
      </form>
      )}

      {/* ADD HOLIDAY MODAL */}
      <Modal
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        title="Add Official Holiday"
        size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsHolidayModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddHoliday}>Add Holiday</button>
          </>
        }
      >
        <form onSubmit={handleAddHoliday}>
          <div className="form-group">
            <label className="form-label required">Holiday Title</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Eid Al-Fitr Day 1"
              value={holidayForm.name}
              onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label required">Holiday Date</label>
            <input
              type="date"
              className="form-control"
              required
              value={holidayForm.holiday_date}
              onChange={(e) => setHolidayForm({ ...holidayForm, holiday_date: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-control"
              value={holidayForm.description}
              onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

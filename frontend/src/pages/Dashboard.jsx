// frontend/src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Users,
  Clock,
  Calculator,
  AlertTriangle,
  FileText,
  Coins,
  TrendingUp,
  Building2,
  CalendarCheck2,
  CheckCircle,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export const Dashboard = ({ setActiveTab }) => {
  const { user, formatCurrency, formatDate, showToast } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      showToast('Error', 'Failed to load dashboard statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #cbd5e1', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s infinite linear' }} />
        <p style={{ marginTop: '1rem', fontWeight: 600 }}>Loading Gulf HR Analytics...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Employee ESS (Self-Service) Dashboard
  if (user?.role === 'employee' || stats?.is_employee) {
    const emp = stats.employee || {};
    const totalSalary = parseFloat(emp.basic_salary || 0) +
      parseFloat(emp.housing_allowance || 0) +
      parseFloat(emp.transport_allowance || 0) +
      parseFloat(emp.car_allowance || 0) +
      parseFloat(emp.mobile_allowance || 0) +
      parseFloat(emp.food_allowance || 0) +
      parseFloat(emp.other_allowance || 0);

    return (
      <div>
        {/* Page Header */}
        <div className="page-header">
          <div className="page-title-group">
            <h2>Welcome back, {emp.first_name || user?.username}!</h2>
            <p>
              {emp.emp_code ? `Employee ID: ${emp.emp_code} • ` : ''}
              {emp.designation_name || 'Staff'} • {emp.department_name || 'General'}
            </p>
          </div>

          <div className="header-action-group">
            <button className="btn btn-primary" onClick={() => setActiveTab('attendance')}>
              <Clock size={16} /> My Attendance
            </button>
            <button className="btn btn-gold" onClick={() => setActiveTab('payroll')}>
              <Calculator size={16} /> My Payslips
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('leaves')}>
              <CalendarCheck2 size={16} /> Apply Leave
            </button>
          </div>
        </div>

        {/* Employee KPI Stats Cards */}
        <div className="grid-stats">
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">Monthly Gross Package</div>
              <div className="stat-value">{formatCurrency(totalSalary)}</div>
              <div className="stat-sub">
                <span>Basic: {formatCurrency(emp.basic_salary || 0)} + Allowances</span>
              </div>
            </div>
            <div className="stat-icon-wrapper">
              <Coins size={24} />
            </div>
          </div>

          <div className="stat-card gold">
            <div className="stat-info">
              <div className="stat-label">This Month Attendance</div>
              <div className="stat-value">{stats.month_present_days || 0} Days</div>
              <div className="stat-sub">
                <span>Present in current month</span>
              </div>
            </div>
            <div className="stat-icon-wrapper gold">
              <Clock size={24} />
            </div>
          </div>

          <div className="stat-card pink">
            <div className="stat-info">
              <div className="stat-label">Overtime Logged</div>
              <div className="stat-value" style={{ color: 'var(--accent-pink)' }}>
                {(stats.month_ot_hours || 0).toFixed(1)} hrs
              </div>
              <div className="stat-sub">
                <span>Bahrain Law Multiplier Applied</span>
              </div>
            </div>
            <div className="stat-icon-wrapper pink">
              <Sparkles size={24} />
            </div>
          </div>

          <div className="stat-card info">
            <div className="stat-info">
              <div className="stat-label">Pending Leave Requests</div>
              <div className="stat-value">{stats.pending_leaves_count || 0}</div>
              <div className="stat-sub">
                <span>Active applications</span>
              </div>
            </div>
            <div className="stat-icon-wrapper info">
              <CalendarCheck2 size={24} />
            </div>
          </div>
        </div>

        {/* Document Expiries Card for this Employee */}
        <div style={{ marginTop: '1.5rem' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <FileText size={18} color="var(--primary)" />
                <span>My Official Documents &amp; Smart Card Expiries</span>
              </div>
            </div>

            {stats.personal_expiries && stats.personal_expiries.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stats.personal_expiries.map((doc, idx) => {
                  const isUrgent = doc.days_left <= 30;
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        background: isUrgent ? '#fef2f2' : '#fffbeb',
                        border: `1px solid ${isUrgent ? '#fecaca' : '#fef3c7'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                          {doc.doc_name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Valid until {formatDate(doc.expiry_date)}
                        </div>
                      </div>

                      <span className={`badge ${isUrgent ? 'badge-expiry-urgent' : 'badge-expiry-warning'}`}>
                        {doc.days_left < 0 ? `Expired ${Math.abs(doc.days_left)}d ago` : `${doc.days_left} Days Left`}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--success)' }}>
                <CheckCircle size={36} style={{ margin: '0 auto 0.5rem auto' }} />
                <p style={{ fontWeight: 700 }}>Your CPR Smart Card, Passport, and Visa documents are fully up to date!</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No renewals required within the next 60 days.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h2>Executive HR & Payroll Dashboard</h2>
          <p>Real-time Bahrain & GCC workforce insights, document expiries, and payroll metrics</p>
        </div>

        <div className="header-action-group">
          <button className="btn btn-gold" onClick={() => setActiveTab('payroll')}>
            <Calculator size={16} /> Process Monthly Payroll
          </button>
          <button className="btn btn-primary" onClick={() => setActiveTab('employees')}>
            <Users size={16} /> Onboard New Employee
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Active Headcount</div>
            <div className="stat-value">{stats.total_employees}</div>
            <div className="stat-sub">
              <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>{stats.gcc_citizens} GCC Citizens</span>
              <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{stats.expats} Expats</span>
            </div>
          </div>
          <div className="stat-icon-wrapper">
            <Users size={24} />
          </div>
        </div>

        <div className="stat-card gold">
          <div className="stat-info">
            <div className="stat-label">Monthly Payroll Est.</div>
            <div className="stat-value">{formatCurrency(stats.monthly_salary_estimate)}</div>
            <div className="stat-sub">
              <span>Basic + Gulf Allowances</span>
            </div>
          </div>
          <div className="stat-icon-wrapper gold">
            <Calculator size={24} />
          </div>
        </div>

        <div className={`stat-card ${stats.expiring_alerts_count > 0 ? 'danger' : 'success'}`}>
          <div className="stat-info">
            <div className="stat-label">Upcoming Document Expiries</div>
            <div className="stat-value" style={{ color: stats.expiring_alerts_count > 0 ? 'var(--danger)' : 'var(--success)' }}>
              {stats.expiring_alerts_count}
            </div>
            <div className="stat-sub">
              <span>CPR, Visa, Passports (Next 60 days)</span>
            </div>
          </div>
          <div className={`stat-icon-wrapper ${stats.expiring_alerts_count > 0 ? 'danger' : 'success'}`}>
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-info">
            <div className="stat-label">Pending Leave Requests</div>
            <div className="stat-value">{stats.pending_leaves_count}</div>
            <div className="stat-sub">
              <span>Awaiting HR / Admin approval</span>
            </div>
          </div>
          <div className="stat-icon-wrapper info">
            <CalendarCheck2 size={24} />
          </div>
        </div>
      </div>

      {/* Main Grid: Expiry Radar + Department Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Document Expiry Radar Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <AlertTriangle size={18} color="var(--danger)" />
              <span>Document Expiry Alert Center (CPR / Visa / Passport)</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('employees')}>
              View All Vault <ArrowUpRight size={14} />
            </button>
          </div>

          {stats.expiring_items && stats.expiring_items.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.expiring_items.map((item, idx) => {
                // Determine which doc is expiring soonest
                let alertDoc = 'Document';
                let daysLeft = 999;
                let expDate = '';

                if (item.cpr_days_left !== null && item.cpr_days_left <= 60 && item.cpr_days_left < daysLeft) {
                  alertDoc = 'CPR / National ID';
                  daysLeft = item.cpr_days_left;
                  expDate = item.cpr_expiry;
                }
                if (item.visa_days_left !== null && item.visa_days_left <= 60 && item.visa_days_left < daysLeft) {
                  alertDoc = 'LMRA Residence Visa';
                  daysLeft = item.visa_days_left;
                  expDate = item.visa_expiry;
                }
                if (item.passport_days_left !== null && item.passport_days_left <= 60 && item.passport_days_left < daysLeft) {
                  alertDoc = 'Passport';
                  daysLeft = item.passport_days_left;
                  expDate = item.passport_expiry;
                }

                const isUrgent = daysLeft <= 30;

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: isUrgent ? '#fef2f2' : '#fffbeb',
                      border: `1px solid ${isUrgent ? '#fecaca' : '#fef3c7'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                        {item.first_name} {item.last_name} ({item.emp_code})
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <strong>{alertDoc}</strong> expires on {formatDate(expDate)} ({item.nationality})
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${isUrgent ? 'badge-expiry-urgent' : 'badge-expiry-warning'}`}>
                        {daysLeft < 0 ? `Expired ${Math.abs(daysLeft)}d ago` : `${daysLeft} Days Left`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--success)' }}>
              <CheckCircle size={36} style={{ margin: '0 auto 0.5rem auto' }} />
              <p style={{ fontWeight: 700 }}>All employee CPRs, Passports, and Visas are fully up to date!</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No document renewals required within the next 60 days.</p>
            </div>
          )}
        </div>

        {/* Department Headcount Breakdown */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Building2 size={18} color="var(--primary)" />
              <span>Department Distribution</span>
            </div>
            <span className="badge badge-primary">{stats.department_distribution?.length || 0} Departments</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {stats.department_distribution?.map((dept, idx) => {
              const percentage = stats.total_employees > 0 ? Math.round((dept.count / stats.total_employees) * 100) : 0;
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    <span>{dept.name}</span>
                    <span>{dept.count} Employees ({percentage}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: idx === 0 ? 'var(--primary)' : idx === 1 ? 'var(--accent-gold)' : idx === 2 ? 'var(--success)' : '#6366f1',
                        borderRadius: '4px',
                        transition: 'width 0.5s ease-out'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Launchpad Action Cards */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 40%, #db2777 100%)', color: '#fff', border: 'none', boxShadow: '0 15px 30px -5px rgba(37, 99, 235, 0.25), 0 8px 16px -4px rgba(236, 72, 153, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbcfe8', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Sparkles size={16} /> Gulf Labor Law Workflow Engine
            </div>
            <h3 style={{ color: '#ffffff', fontSize: '1.5rem', marginTop: '0.25rem', marginBottom: '0.35rem', fontWeight: 800 }}>
              Compliant Bahrain GOSI, LMRA &amp; End of Service Calculations
            </h3>
            <p style={{ color: '#e0e7ff', fontSize: '0.9rem', maxWidth: '650px' }}>
              Easily import biometric attendance CSV files, auto-calculate standard &amp; holiday overtime, and issue official A5 laser payslips with automatic social insurance deductions.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-pink" onClick={() => setActiveTab('attendance')}>
              <Clock size={16} /> Import Biometric CSV
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('indemnity')} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
              Calculate EOSB Gratuity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

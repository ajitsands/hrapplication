// frontend/src/components/Navbar.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  Calculator,
  Award,
  CalendarDays,
  CalendarClock,
  Coins,
  Settings,
  LogOut,
  Bell,
  Globe2,
  Sparkles
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, expiryAlertCount = 0 }) => {
  const { user, logout, settings } = useAuth();
  const isAdminOrHr = user && (user.role === 'admin' || user.role === 'hr');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, role: 'all' },
    { id: 'employees', label: 'Employees & Vault', icon: Users, role: 'admin_hr', badge: expiryAlertCount > 0 ? expiryAlertCount : null },
    { id: 'attendance', label: 'Attendance & Biometrics', icon: Clock, role: 'all' },
    { id: 'shifts', label: 'Shifts & Rostering', icon: CalendarClock, role: 'all' },
    { id: 'payroll', label: 'Payroll & A5 Payslips', icon: Calculator, role: 'all' },
    { id: 'indemnity', label: 'Indemnity & EOSB', icon: Award, role: 'admin_hr' },
    { id: 'leaves', label: 'Leaves & Vacations', icon: CalendarDays, role: 'all' },
    { id: 'loans', label: 'Loans & Advances', icon: Coins, role: 'all' },
    { id: 'settings', label: 'Settings & Rules', icon: Settings, role: 'admin' },
  ];

  const visibleMenuItems = menuItems.filter((item) => {
    if (item.role === 'all') return true;
    if (item.role === 'admin_hr') return isAdminOrHr;
    if (item.role === 'admin') return user && user.role === 'admin';
    return false;
  });

  return (
    <header className="navbar-top">
      {/* Top Header Row */}
      <div className="nav-header-row">
        <div className="brand-section">
          <div className="brand-badge-logo">
            <span>GH</span>
          </div>
          <div className="brand-titles">
            <h1>{settings.company_name || 'Gulf Enterprise HR & Payroll'}</h1>
            <div className="brand-tagline">
              Bahrain &amp; Gulf Labor Law Compliant System
            </div>
          </div>
        </div>

        <div className="nav-user-actions">
          {/* Country & Currency Pill */}
          <div className="country-pill" title={`Timezone: ${settings.timezone} | Currency: ${settings.currency}`}>
            <Globe2 size={15} />
            <span>{settings.country || 'Bahrain'} ({settings.currency || 'BHD'})</span>
          </div>

          {/* Expiry Alert Quick Indicator */}
          {isAdminOrHr && expiryAlertCount > 0 && (
            <button
              className="btn btn-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.25) 0%, rgba(236, 72, 153, 0.25) 100%)',
                color: '#fda4af',
                border: '1px solid rgba(244, 63, 94, 0.45)',
                padding: '0.4rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                borderRadius: 'var(--radius-full)',
                backdropFilter: 'blur(8px)'
              }}
              onClick={() => setActiveTab('employees')}
              title="Upcoming document expiries (CPR, Visa, Passport)"
            >
              <Bell size={14} className="pulse-icon" />
              <span>{expiryAlertCount} Expiry Alerts</span>
            </button>
          )}

          {/* User Profile Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255, 255, 255, 0.06)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--gradient-pill-active)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.85rem',
                boxShadow: '0 2px 8px rgba(236, 72, 153, 0.4)'
              }}
            >
              {user ? (user.username[0] || 'U').toUpperCase() : 'U'}
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#ffffff' }}>
                {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span className={`badge ${user?.role === 'admin' ? 'badge-pink' : user?.role === 'hr' ? 'badge-info' : 'badge-primary'}`} style={{ fontSize: '0.625rem', padding: '0.1rem 0.45rem' }}>
                  {user?.role?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={logout}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 'var(--radius-full)'
            }}
            title="Sign out of system"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Redesigned Horizontal Navigation Menu Bar */}
      <nav className="horizontal-menu-bar" aria-label="Main Navigation">
        <ul className="nav-menu-list">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`nav-menu-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  {item.badge && <span className="badge-count">{item.badge}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
};

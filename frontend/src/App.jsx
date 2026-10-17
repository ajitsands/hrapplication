// frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { Attendance } from './pages/Attendance';
import { Payroll } from './pages/Payroll';
import { Indemnity } from './pages/Indemnity';
import { Leaves } from './pages/Leaves';
import { Loans } from './pages/Loans';
import { Settings } from './pages/Settings';
import { VendorControl } from './pages/VendorControl';
import { Footer } from './components/Footer';
import { SoftwareKeyScreen } from './components/SoftwareKeyScreen';
import { LicenseSuspendedScreen } from './components/LicenseSuspendedScreen';
import { SaNDSLabModal } from './components/SaNDSLabModal';
import { Modal } from './components/Modal';
import { api } from './services/api';
import { KeyRound, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const AppContent = () => {
  const { user, loading, showToast, changePassword, logout } = useAuth();
  const isSuperAdmin = user && (user.role === 'super_admin' || user.role === 'superadmin');
  const [activeTab, setActiveTab] = useState(isSuperAdmin ? 'vendor_license' : 'dashboard');
  const [expiryAlertCount, setExpiryAlertCount] = useState(0);

  // Automatically ensure activeTab is valid for the current logged-in role
  useEffect(() => {
    if (user) {
      if (isSuperAdmin) {
        if (!activeTab || activeTab === 'dashboard') {
          setActiveTab('vendor_license');
        }
      } else {
        // Normal admin or employee must never be on vendor_license
        if (activeTab === 'vendor_license') {
          setActiveTab('dashboard');
        }
        // Employee role must never be on admin-only tabs
        if (user.role === 'employee' && ['shifts', 'employees', 'indemnity', 'settings'].includes(activeTab)) {
          setActiveTab('dashboard');
        }
      }
    } else {
      setActiveTab('dashboard');
    }
  }, [user?.id, isSuperAdmin]);

  // License & System Status
  const [licenseStatus, setLicenseStatus] = useState(null);
  const [isCheckingLicense, setIsCheckingLicense] = useState(true);
  const [manualKeyScreenRequested, setManualKeyScreenRequested] = useState(false);
  const [isHelpLineModalOpen, setIsHelpLineModalOpen] = useState(false);

  // Mandatory first login password change state
  const [forceNewPass, setForceNewPass] = useState('');
  const [forceConfirmPass, setForceConfirmPass] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  const handleForcePasswordChange = async () => {
    if (!forceNewPass || forceNewPass.length < 6) {
      showToast('Validation Error', 'Password must be at least 6 characters long.', 'warning');
      return;
    }
    if (forceNewPass !== forceConfirmPass) {
      showToast('Mismatch', 'Passwords do not match. Please re-enter.', 'warning');
      return;
    }

    try {
      setIsChangingPass(true);
      const ok = await changePassword(forceNewPass);
      if (ok) {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        setForceNewPass('');
        setForceConfirmPass('');
      }
    } finally {
      setIsChangingPass(false);
    }
  };

  const checkSystemStatus = async () => {
    try {
      setIsCheckingLicense(true);
      const res = await api.get('/system/license-status');
      if (res.success && res.data) {
        setLicenseStatus(res.data);
      }
    } catch (err) {
      if (err.data) {
        setLicenseStatus(err.data);
      } else {
        setLicenseStatus({
          software_suspended: !!err.software_suspended,
          superadmin_suspended: false,
          status: err.software_suspended ? 'suspended' : 'unlicensed',
          valid: false,
          message: err.message || 'System status check failed'
        });
      }
    } finally {
      setIsCheckingLicense(false);
    }
  };

  const checkExpiries = async () => {
    if (!user || user.role === 'employee' || user.role === 'super_admin' || user.role === 'superadmin') return;
    try {
      const res = await api.get('/employees/expiries', { days: 60 });
      if (res.success) {
        const count = (res.data.employee_expiries?.length || 0) + (res.data.document_expiries?.length || 0);
        setExpiryAlertCount(count);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    checkSystemStatus();
    if (user) {
      checkExpiries();
    }
  }, [user, activeTab]);

  // Loading Screen
  if (loading || isCheckingLicense) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#ffffff',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255, 255, 255, 0.2)',
            borderTopColor: '#f59e0b',
            borderRadius: '50%',
            animation: 'spin 1s infinite linear'
          }}
        />
        <div style={{ fontWeight: 700, letterSpacing: '0.05em' }}>Loading Gulf HR Enterprise...</div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Determine license states
  const isSuspended =
    licenseStatus?.software_suspended ||
    licenseStatus?.superadmin_suspended ||
    licenseStatus?.status === 'suspended' ||
    licenseStatus?.status === 'expired';

  const isUnlicensed = !licenseStatus?.valid && !isSuspended;

  // 1. NON-AUTHENTICATED (OR LOGGED-IN NON-SUPERADMIN BLOCKED) FLOWS
  // Super Admin can always access the application / vendor control
  const shouldBlockStandardAccess = !isSuperAdmin;

  // Render view router helper
  const renderPublicView = () => {
    // If Software / Superadmin Suspended or Key Expired
    if (isSuspended && shouldBlockStandardAccess) {
      if (manualKeyScreenRequested) {
        return (
          <SoftwareKeyScreen
            onActivated={(data) => {
              setManualKeyScreenRequested(false);
              showToast('Key Activated', 'License authenticated successfully with SaNDS Lab server!', 'success');
              checkSystemStatus();
            }}
            onOpenHelpLine={() => setIsHelpLineModalOpen(true)}
            onRefreshStatus={checkSystemStatus}
            detectedStatus={licenseStatus}
          />
        );
      }

      return (
        <LicenseSuspendedScreen
          statusData={licenseStatus}
          onOpenHelpLine={() => setIsHelpLineModalOpen(true)}
          onEnterKey={() => setManualKeyScreenRequested(true)}
          onRefreshStatus={checkSystemStatus}
        />
      );
    }

    // If Key Not Added / Unlicensed
    if (isUnlicensed && shouldBlockStandardAccess) {
      return (
        <SoftwareKeyScreen
          onActivated={(data) => {
            setManualKeyScreenRequested(false);
            showToast('Key Activated', 'License authenticated successfully! You may now sign in.', 'success');
            checkSystemStatus();
          }}
          onOpenHelpLine={() => setIsHelpLineModalOpen(true)}
          onRefreshStatus={checkSystemStatus}
          detectedStatus={licenseStatus}
        />
      );
    }

    // If manual key screen explicitly requested while valid
    if (manualKeyScreenRequested) {
      return (
        <SoftwareKeyScreen
          onActivated={(data) => {
            setManualKeyScreenRequested(false);
            showToast('Key Updated', 'License key updated successfully!', 'success');
            checkSystemStatus();
          }}
          onOpenHelpLine={() => setIsHelpLineModalOpen(true)}
          onRefreshStatus={checkSystemStatus}
          detectedStatus={licenseStatus}
        />
      );
    }

    // Default when not logged in and license is valid: Standard Login Screen
    return (
      <Login
        onOpenKeyScreen={() => setManualKeyScreenRequested(true)}
        onOpenHelpLine={() => setIsHelpLineModalOpen(true)}
      />
    );
  };

  // If user is not logged in OR standard user is blocked by license
  if (!user || (shouldBlockStandardAccess && (isSuspended || isUnlicensed))) {
    return (
      <div
        className="app-container"
        style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        {renderPublicView()}

        {/* Global Executive Footer with SaNDS Lab Help Line Popup Trigger */}
        <Footer onOpenHelpLine={() => setIsHelpLineModalOpen(true)} />

        {/* SaNDS Lab Help Line Popup Modal */}
        <SaNDSLabModal
          isOpen={isHelpLineModalOpen}
          onClose={() => setIsHelpLineModalOpen(false)}
        />

        <ToastContainer />
      </div>
    );
  }

  // 2. AUTHENTICATED USER FLOW (Inside Application)
  return (
    <div
      className="app-container"
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* Horizontal Executive Topbar & Menu */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        expiryAlertCount={expiryAlertCount}
      />

      {/* Main Content Area */}
      <main className="main-content" style={{ flex: 1 }}>
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'employees' && <Employees />}
        {activeTab === 'attendance' && <Attendance initialSubTab="daily" />}
        {activeTab === 'shifts' && <Attendance initialSubTab="shifts" />}
        {activeTab === 'payroll' && <Payroll />}
        {activeTab === 'indemnity' && <Indemnity />}
        {activeTab === 'leaves' && <Leaves />}
        {activeTab === 'loans' && <Loans />}
        {activeTab === 'settings' && <Settings />}
        {activeTab === 'vendor_license' && (
          isSuperAdmin ? <VendorControl /> : <Dashboard setActiveTab={setActiveTab} />
        )}
      </main>

      {/* Global Executive Footer with SaNDS Lab Help Line Popup Trigger */}
      <Footer onOpenHelpLine={() => setIsHelpLineModalOpen(true)} />

      {/* SaNDS Lab Help Line Popup Modal */}
      <SaNDSLabModal
        isOpen={isHelpLineModalOpen}
        onClose={() => setIsHelpLineModalOpen(false)}
      />

      {/* MANDATORY FIRST-TIME PASSWORD SETUP MODAL */}
      {user?.must_change_password && (
        <Modal
          isOpen={true}
          onClose={() => {}}
          title="First-Time Account Activation: Set Your Password"
          size="sm"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={logout}>
                Sign Out
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleForcePasswordChange}
                disabled={isChangingPass}
              >
                <KeyRound size={16} />
                {isChangingPass ? 'Saving Password...' : 'Save Password & Enter'}
              </button>
            </div>
          }
        >
          <div>
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.85rem',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                fontSize: '0.825rem',
                color: '#1e40af',
                lineHeight: 1.4
              }}
            >
              <strong>Welcome, {user.first_name || user.username}!</strong>
              <div style={{ marginTop: '0.25rem' }}>
                As an employee accessing the portal for the first time, please create your personal password to secure your account.
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label required">Create New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="At least 6 characters..."
                value={forceNewPass}
                onChange={(e) => setForceNewPass(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label className="form-label required">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Re-enter new password..."
                value={forceConfirmPass}
                onChange={(e) => setForceConfirmPass(e.target.value)}
                required
              />
            </div>
          </div>
        </Modal>
      )}

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

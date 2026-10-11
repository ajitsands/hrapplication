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
import { Footer } from './components/Footer';
import { api } from './services/api';

const AppContent = () => {
  const { user, loading, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expiryAlertCount, setExpiryAlertCount] = useState(0);

  const checkExpiries = async () => {
    if (!user || user.role === 'employee') return;
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
    if (user) {
      checkExpiries();
    }
  }, [user, activeTab]);

  if (loading) {
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

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app-container">
      {/* Horizontal Executive Topbar & Menu */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        expiryAlertCount={expiryAlertCount}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'employees' && <Employees />}
        {activeTab === 'attendance' && <Attendance initialSubTab="daily" />}
        {activeTab === 'shifts' && <Attendance initialSubTab="shifts" />}
        {activeTab === 'payroll' && <Payroll />}
        {activeTab === 'indemnity' && <Indemnity />}
        {activeTab === 'leaves' && <Leaves />}
        {activeTab === 'loans' && <Loans />}
        {activeTab === 'settings' && <Settings />}
      </main>

      {/* Global Executive Footer */}
      <Footer />

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

// frontend/src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    company_name: 'Al-Khaleej Technologies W.L.L.',
    country: 'Bahrain',
    country_code: 'BH',
    timezone: 'Asia/Bahrain',
    currency: 'BHD',
    currency_symbol: 'BD',
    currency_decimals: 3,
    gosi_citizen_emp_rate: 7,
    gosi_citizen_comp_rate: 12,
    gosi_expat_emp_rate: 1,
    gosi_expat_comp_rate: 3,
    lmra_monthly_fee: 10,
    work_hours_per_day: 8,
    work_days_per_month: 30,
    ot_normal_multiplier: 1.25,
    ot_night_multiplier: 1.50,
    ot_holiday_multiplier: 2.00
  });

  const [toasts, setToasts] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null);

  // Initialize auth
  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          if (res.success) {
            setUser(res.data);
          }
        } catch {
          api.setToken(null);
          setUser(null);
        }
      }
      // Load public settings
      try {
        const setRes = await api.get('/settings/public');
        if (setRes.success && setRes.data) {
          setSettings(setRes.data);
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login', { username, password });
      if (res.success) {
        api.setToken(res.data.token);
        setUser(res.data.user);
        showToast('Login Successful', `Welcome back, ${res.data.user.username}!`, 'success');
        return true;
      }
    } catch (err) {
      showToast('Login Failed', err.message || 'Invalid credentials', 'error');
      return false;
    }
  };

  const firstLoginSetup = async (cpr_no, new_password) => {
    try {
      const res = await api.post('/auth/first-login-setup', { cpr_no, new_password });
      if (res.success) {
        api.setToken(res.data.token);
        setUser(res.data.user);
        showToast('Password Created', `Welcome to the portal, ${res.data.user.first_name || res.data.user.username}!`, 'success');
        return true;
      }
    } catch (err) {
      showToast('Setup Failed', err.message || 'Unable to setup password', 'error');
      return false;
    }
  };

  const changePassword = async (new_password, current_password = '') => {
    try {
      const res = await api.post('/auth/change-password', { new_password, current_password });
      if (res.success) {
        setUser((prev) => (prev ? { ...prev, must_change_password: false } : null));
        showToast('Password Updated', 'Your new password has been set successfully!', 'success');
        return true;
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to update password', 'error');
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    api.setToken(null);
    setUser(null);
    showToast('Logged Out', 'You have been safely signed out.', 'info');
  };

  const refreshSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error('Failed to refresh settings', err);
    }
  };

  const showToast = (title, message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, title, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const confirmAction = ({ title, message, onConfirm, confirmText = 'Confirm', isDanger = false }) => {
    setConfirmModal({
      title,
      message,
      onConfirm: async () => {
        setConfirmModal(null);
        if (onConfirm) await onConfirm();
      },
      confirmText,
      isDanger
    });
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    const decimals = parseInt(settings.currency_decimals ?? 3, 10);
    const symbol = settings.currency_symbol || 'BD';
    return `${num.toFixed(decimals)} ${symbol}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        settings,
        login,
        logout,
        refreshSettings,
        toasts,
        showToast,
        removeToast,
        confirmAction,
        formatCurrency,
        formatDate,
        firstLoginSetup,
        changePassword
      }}
    >
      {children}

      {/* Confirmation Modal Window (Never use browser alert/confirm) */}
      {confirmModal && (
        <div className="modal-overlay">
          <div className="modal-window sm">
            <div className="modal-header">
              <h3>{confirmModal.title || 'Confirm Action'}</h3>
              <button className="modal-close-btn" onClick={() => setConfirmModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{confirmModal.message}</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmModal(null)}>Cancel</button>
              <button 
                className={`btn ${confirmModal.isDanger ? 'btn-danger' : 'btn-primary'}`} 
                onClick={confirmModal.onConfirm}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

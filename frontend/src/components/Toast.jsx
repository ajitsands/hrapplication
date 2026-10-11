// frontend/src/components/Toast.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useAuth();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let iconColor = 'var(--success)';
        if (toast.type === 'error') {
          Icon = AlertCircle;
          iconColor = 'var(--danger)';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          iconColor = 'var(--warning)';
        } else if (toast.type === 'info') {
          Icon = Info;
          iconColor = 'var(--info)';
        }

        return (
          <div key={toast.id} className={`toast-item ${toast.type}`}>
            <div className="toast-icon">
              <Icon size={20} color={iconColor} />
            </div>
            <div className="toast-content">
              <h4>{toast.title}</h4>
              <p>{toast.message}</p>
            </div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

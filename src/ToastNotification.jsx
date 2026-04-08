{/* Enes Doğanay | 8 Nisan 2026: Anlık bildirim toast bileşeni — yukarıdan kayarak gelir, otomatik kaybolur */}
import React, { useEffect } from 'react';
import './ToastNotification.css';

const typeConfig = {
  quote_received: { icon: 'request_quote', label: 'Teklif Talebi', color: '#137fec' },
  quote_reply: { icon: 'reply', label: 'Teklif Yanıtı', color: '#059669' },
  quote_message: { icon: 'chat', label: 'Yeni Mesaj', color: '#7c3aed' },
  reminder: { icon: 'alarm', label: 'Hatırlatma', color: '#d97706' },
  default: { icon: 'notifications', label: 'Bildirim', color: '#137fec' }
};

const ToastItem = ({ toast, onDismiss }) => {
  const config = typeConfig[toast.type] || typeConfig.default;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div className={`toast-item ${toast.exiting ? 'toast-exit' : 'toast-enter'}`}>
      <div className="toast-accent" style={{ background: config.color }} />
      <div className="toast-icon" style={{ color: config.color }}>
        <span className="material-symbols-outlined">{config.icon}</span>
      </div>
      <div className="toast-body">
        <span className="toast-label" style={{ color: config.color }}>{config.label}</span>
        <strong className="toast-title">{toast.title}</strong>
        {toast.message && <p className="toast-message">{toast.message}</p>}
      </div>
      <button className="toast-close" onClick={() => onDismiss(toast.id)} type="button">
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
};

const ToastNotification = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export default ToastNotification;

{/* Enes Doğanay | 8 Nisan 2026: AuthContext'ten toast verilerini alıp ToastNotification bileşenini render eden wrapper */}
import React from 'react';
import { useAuth } from './AuthContext';
import ToastNotification from './ToastNotification';

const ToastWrapper = () => {
  const { toasts, dismissToast } = useAuth();
  return <ToastNotification toasts={toasts} onDismiss={dismissToast} />;
};

export default ToastWrapper;

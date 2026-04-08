import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import Router from './Router';
// Enes Doğanay | 8 Nisan 2026: AuthProvider ile auth state uygulama genelinde tek seferlik yüklenir
import { AuthProvider } from './AuthContext';
// Enes Doğanay | 8 Nisan 2026: Anlık toast bildirimleri — AuthProvider içinden alınıp render edilir
import ToastWrapper from './ToastWrapper';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Router />
        <ToastWrapper />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);




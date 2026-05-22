// Enes Doğanay | 6 Mayıs 2026: Şifre sıfırlama sayfası — useResetPassword hook ile ayrıştırıldı
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import SharedHeader from '../../components/SharedHeader';
import '../../components/SharedHeader.css';
import './Login.css';
import './Login.dark.css';
import { useResetPassword } from './hooks/useResetPassword';

const NAV = [
  { label: 'Anasayfa', href: '/' },
  { label: 'Firmalar', href: '/firmalar' },
  { label: 'İhaleler', href: '/ihaleler' },
  { label: 'Hakkımızda', href: '/hakkimizda' },
  { label: 'İletişim', href: '/iletisim' },
];

export default function ResetPasswordPage() {
  const router = useRouter();
  const {
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPassword, setShowPassword,
    showConfirm, setShowConfirm,
    loading, checking, hasSession, feedback,
    handleReset,
  } = useResetPassword();

  return (
    <div className="app-container">
      <SharedHeader navItems={NAV} />

      <main className="main-content">
        <div className="login-card">
          <div className="card-body">
            <div className="card-header-text">
              <h1>Yeni Şifre Belirle</h1>
              <p>Hesabınız için yeni şifrenizi güvenli şekilde oluşturun.</p>
            </div>

            {checking ? (
              <p className="login-info">Bağlantı doğrulanıyor...</p>
            ) : !hasSession ? (
              <div className="reset-password-state">
                <p className="login-error">Bu şifre yenileme bağlantısı geçersiz veya süresi dolmuş olabilir.</p>
                <button type="button" className="login-btn login-btn-full login-btn-primary mt-4" onClick={() => router.push('/login')}>
                  Girişe Dön
                </button>
              </div>
            ) : (
              <form className="login-form" onSubmit={handleReset}>
                <div className="form-group">
                  <label>Yeni Şifre</label>
                  <div className="input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Yeni şifrenizi girin"
                      className="form-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button type="button" className="toggle-password" onClick={() => setShowPassword((p) => !p)} aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}>
                      <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Yeni Şifre Tekrar</label>
                  <div className="input-wrapper">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Yeni şifrenizi tekrar girin"
                      className="form-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button type="button" className="toggle-password" onClick={() => setShowConfirm((p) => !p)} aria-label={showConfirm ? 'Şifreyi gizle' : 'Şifreyi göster'}>
                      <span className="material-symbols-outlined">{showConfirm ? 'visibility' : 'visibility_off'}</span>
                    </button>
                  </div>
                </div>

                {feedback.type === 'error' && <p className="login-error">{feedback.text}</p>}
                {feedback.type === 'success' && <p className="login-success">{feedback.text}</p>}

                <button type="submit" className="login-btn login-btn-full login-btn-primary mt-4" disabled={loading}>
                  {loading ? 'Güncelleniyor...' : 'Şifremi Güncelle'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

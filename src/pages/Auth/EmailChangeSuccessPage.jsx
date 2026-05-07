{/* Enes Doğanay | 6 Mayıs 2026: E-posta değişikliği onay başarı sayfası — taşındı, UI değişikliği yok */}
import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import '../../components/SharedHeader.css';
import './EmailConfirmation.css';

export default function EmailChangeSuccessPage() {
  const params = new URLSearchParams(window.location.search);
  const newEmail = params.get('email');
  const { theme } = useTheme();

  return (
    <div className="ec-wrapper">
      <header className="shared-header">
        <div className="shared-header-inner">
          <a href="/" className="shared-logo-area" aria-label="Tedport ana sayfa">
            <img
              className="shared-logo-image"
              src={theme === 'dark' ? '/tedport-logo_no-background-dark.png' : '/tedport-logo_no-background.png'}
              alt="Tedport Logo"
              loading="lazy"
            />
          </a>
          <div className="shared-nav">
            <div className="shared-nav-links">
              <a href="/">Anasayfa</a>
              <a href="/firmalar">Firmalar</a>
              <a href="/ihaleler">İhaleler</a>
              <a href="/hakkimizda">Hakkımızda</a>
              <a href="/iletisim">İletişim</a>
              <a href="/login">Giriş Yap</a>
            </div>
            <div className="shared-user-actions">
              <a href="/register" className="shared-register-btn">Kayıt Ol</a>
            </div>
          </div>
        </div>
      </header>

      <main className="ec-main">
        <div className="ec-card">
          <div className="ec-illustration">
            <div className="ec-glow" style={{ backgroundColor: 'rgba(34, 197, 94, 0.12)' }}></div>
            <div className="ec-circle" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}>
              <span className="material-symbols-outlined">check_circle</span>
            </div>
          </div>

          <h1 className="ec-title">E-posta Adresiniz Güncellendi!</h1>
          <p className="ec-description">
            E-posta değişiklik işleminiz başarıyla tamamlandı.
            {newEmail && (<><br />Yeni e-posta adresiniz: <b>{newEmail}</b></>)}
            <br />Artık yeni e-posta adresinizle giriş yapabilirsiniz.
          </p>

          <a href="/login" className="ec-btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', lineHeight: '48px', height: '48px', padding: '0 24px' }}>
            Giriş Yap
          </a>

          <div className="ec-secondary-section">
            <a href="/" className="ec-btn-text" style={{ textDecoration: 'none' }}>
              Anasayfaya Dön
            </a>
          </div>
        </div>
      </main>

      <div className="ec-background-blobs">
        <div className="ec-blob-1"></div>
        <div className="ec-blob-2"></div>
      </div>
    </div>
  );
}

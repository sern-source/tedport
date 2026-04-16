{/* Enes Doğanay | 10 Nisan 2026: E-posta değişikliği onay başarı sayfası — SPA state'ten bağımsız */}
import React from 'react';
import './SharedHeader.css';
import './EmailConfirmation.css';

const EmailChangeSuccess = () => {
  // Enes Doğanay | 10 Nisan 2026: URL query'den yeni e-postayı al (main.jsx tarafından ekleniyor)
  const params = new URLSearchParams(window.location.search);
  const newEmail = params.get('email');

  return (
    <div className="ec-wrapper">
      {/* Enes Doğanay | 10 Nisan 2026: Sabit minimal header — tüm linkler <a> ile tam sayfa yenileme */}
      <header className="shared-header">
        <div className="shared-header-inner">
          <a href="/" className="shared-logo-area" aria-label="Tedport ana sayfa">
            <img className="shared-logo-image" src="/tedport-logo.jpg" alt="Tedport Logo" loading="lazy" />
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
            {newEmail && (
              <>
                <br />Yeni e-posta adresiniz: <b>{newEmail}</b>
              </>
            )}
            <br />Artık yeni e-posta adresinizle giriş yapabilirsiniz.
          </p>

          {/* Enes Doğanay | 10 Nisan 2026: <a> tag ile tam sayfa yenileme — hiçbir SPA state'i taşınmaz */}
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

      <footer className="ec-footer">
        <p>© 2026 Tedport. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
};

export default EmailChangeSuccess;

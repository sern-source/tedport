import React, { useState } from 'react';
import './Register.css'; // Stil dosyasını içe aktarıyoruz

const RegistrationPage = () => {
  const [registrationType, setRegistrationType] = useState('individual');

  return (
    <div className="page-container">
      {/* Header */}
      <header className="header">
        <div className="logo-section">
          <div className="logo-icon">
            <span className="material-symbols-outlined" style={{ fontSize: '30px' }}>
              handshake
            </span>
          </div>
          <h2 className="logo-text">Tedport</h2>
        </div>
        <div className="header-right">
          <nav className="nav-links">
            <a href="/">Anasayfa</a>
            <a href="/firmalar">Firmalar</a>
            <a href="#">İletişim</a>
          </nav>
          <button className="btn-primary">Giriş Yap</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="registration-card">
          <div className="card-header">
            
          </div>

          <div className="tabs-container">
            <div className="tabs">
              <button 
                className={`tab-btn ${registrationType === 'individual' ? 'active' : ''}`}
                onClick={() => setRegistrationType('individual')}
                type="button"
              >
                Bireysel Kayıt
              </button>
              <button 
                className={`tab-btn ${registrationType === 'corporate' ? 'active' : ''}`}
                onClick={() => setRegistrationType('corporate')}
                type="button"
              >
                Kurumsal Kayıt
              </button>
            </div>
          </div>

          <form className="form-body" onSubmit={(e) => e.preventDefault()}>
            <div className="photo-upload-container">
              <label className="photo-upload-box">
                <span className="material-symbols-outlined" style={{ fontSize: '30px' }}>
                  add_a_photo
                </span>
                <input type="file" accept="image/*" style={{ display: 'none' }} />
              </label>
              <span className="photo-label">Profil Fotoğrafı</span>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Ad</label>
                <input className="form-input" type="text" placeholder="Adınızı girin" />
              </div>
              <div className="input-group">
                <label>Soyad</label>
                <input className="form-input" type="text" placeholder="Soyadınızı girin" />
              </div>
            </div>

            <div className="input-group">
              <label>Şirket Adı</label>
              <div className="input-wrapper">
                <input className="form-input" type="text" placeholder="Şirket ismini girin" />
                <span className="material-symbols-outlined input-icon">business</span>
              </div>
            </div>

            <div className="input-group">
              <label>Telefon Numarası</label>
              <div className="input-wrapper">
                <input className="form-input" type="tel" placeholder="0 (5XX) XXX XX XX" />
                <span className="material-symbols-outlined input-icon">phone</span>
              </div>
            </div>

            <div className="input-group">
              <label>E-posta Adresi</label>
              <div className="input-wrapper">
                <input className="form-input" type="email" placeholder="ornek@email.com" />
                <span className="material-symbols-outlined input-icon">mail</span>
              </div>
            </div>

            <div className="input-group">
              <label>Şifre</label>
              <div className="input-wrapper">
                <input className="form-input" type="password" placeholder="••••••••" />
                <span className="material-symbols-outlined input-icon clickable">visibility</span>
              </div>
            </div>

            <div className="checkbox-group">
              <input type="checkbox" id="terms" />
              <label htmlFor="terms" className="checkbox-label">
                <a href="#hizmet" className="text-link">Hizmet Şartları</a>'nı ve{' '}
                <a href="#gizlilik" className="text-link">Gizlilik Politikası</a>'nı okudum ve kabul ediyorum.
              </label>
            </div>

            <button type="submit" className="btn-primary btn-submit">
              Hesap Oluştur
            </button>
          </form>

          <div className="card-footer">
            <div className='footerText'>
                Zaten bir hesabınız var mı? <a href="/login" className="text-link" style={{ fontWeight: 500 }}>Giriş Yap</a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="page-footer">
        <p>© 2024 B2B Directory. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default RegistrationPage;
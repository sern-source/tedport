// Enes Doğanay | 6 Mayıs 2026: Login sayfası — useLogin hook ile tüm mantık ayrıştırıldı
import React from 'react';
import { Link } from 'react-router-dom';
import SharedHeader from '../../components/SharedHeader';
import '../../components/SharedHeader.css';
import SEO from '../../components/SEO';
import './Login.css';
import './Login.dark.css';
import { useLogin } from './hooks/useLogin';

const GOOGLE_SVG = <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>;
const LINKEDIN_SVG = <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>;

const NAV = [
  { label: 'Anasayfa', href: '/' },
  { label: 'Firmalar', href: '/firmalar' },
  { label: 'İhaleler', href: '/ihaleler' },
  { label: 'Hakkımızda', href: '/hakkimizda' },
  { label: 'İletişim', href: '/iletisim' },
];

export default function LoginPage() {
  const {
    email, setEmail, password, setPassword,
    rememberMe, setRememberMe, showPassword, setShowPassword,
    activeTab, loading, forgotLoading, feedback,
    handleLogin, handleForgotPassword, handleTabChange,
    handleGoogleLogin, handleLinkedInLogin,
  } = useLogin();

  const isError = feedback.type === 'error';
  const isSuccess = feedback.type === 'success';

  return (
    <div className="app-container">
      <SEO title="Giriş Yap" description="Tedport hesabınıza giriş yapın." path="/login" noIndex />
      <SharedHeader navItems={NAV} />

      <main className="main-content">
        <div className="login-card">

          {/* Sekmeler */}
          {/* Enes Doğanay | 8 Mayıs 2026: role=tablist + role=tab + aria-selected — sekme erişilebilirlik */}
          <div className="login-tabs" role="tablist">
            <button className={`tab-item ${activeTab === 'individual' ? 'active' : ''}`} onClick={() => handleTabChange('individual')} role="tab" aria-selected={activeTab === 'individual'} type="button">
              <span className="material-symbols-outlined">person</span>
              <span>Bireysel Giriş</span>
            </button>
            <button className={`tab-item ${activeTab === 'corporate' ? 'active' : ''}`} onClick={() => handleTabChange('corporate')} role="tab" aria-selected={activeTab === 'corporate'} type="button">
              <span className="material-symbols-outlined">business</span>
              <span>Kurumsal Giriş</span>
            </button>
          </div>

          <div className="card-body">
            <div className="card-header-text">
              <h1>{activeTab === 'corporate' ? 'Kurumsal Giriş' : 'Hoş Geldiniz'}</h1>
              <p>{activeTab === 'corporate' ? 'Onaylanan kurumsal hesabınıza şirket e-postanızla giriş yapın.' : 'Hesabınıza erişmek için bilgilerinizi girin.'}</p>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label>E-posta Adresi</label>
                <div className="input-wrapper">
                  <input type="email" placeholder="ornek@tedport.com" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <span className="material-symbols-outlined input-icon">mail</span>
                </div>
              </div>

              <div className="form-group">
                <label>Şifre</label>
                <div className="input-wrapper">
                  <input type={showPassword ? 'text' : 'password'} placeholder="******" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" className="toggle-password" onClick={() => setShowPassword((p) => !p)} aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}>
                    <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <label className="remember-me">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  <span>Beni Hatırla</span>
                </label>
                <button type="button" className="forgot-password" onClick={handleForgotPassword} disabled={forgotLoading}>
                  Şifremi Unuttum
                </button>
              </div>

              {isError && (
                <div className="login-error">
                  <span>{feedback.text}</span>
                  {feedback.text.includes('Kurumsal Giriş') && (
                    <button type="button" className="login-error-switch" onClick={() => handleTabChange('corporate')}>
                      <span className="material-symbols-outlined">arrow_forward</span>
                      Kurumsal Girişe Geç
                    </button>
                  )}
                  {feedback.text.includes('Bireysel Giriş') && (
                    <button type="button" className="login-error-switch" onClick={() => handleTabChange('individual')}>
                      <span className="material-symbols-outlined">arrow_forward</span>
                      Bireysel Girişe Geç
                    </button>
                  )}
                </div>
              )}
              {isSuccess && <p className="login-success">{feedback.text}</p>}

              <button type="submit" className="login-btn login-btn-full login-btn-primary mt-4" disabled={loading}>
                {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>

            <div className="login-divider"><span>veya</span></div>

            {/* Enes Doğanay | 6 Mayıs 2026: OAuth butonları — mantık hook'a taşındı */}
            <button type="button" className="login-google-btn" onClick={handleGoogleLogin}>
              {GOOGLE_SVG} Google ile Giriş Yap
            </button>
            <button type="button" className="login-linkedin-btn" onClick={handleLinkedInLogin}>
              {LINKEDIN_SVG} LinkedIn ile Giriş Yap
            </button>

            {activeTab === 'corporate' && (
              <div className="corporate-login-callout">
                <strong>Kurumsal hesabın henüz yok mu?</strong>
                <p>Önce başvuru formunu doldurun. Firma doğrulaması tamamlanınca size şifre belirleme bağlantısı gönderilir.</p>
                <Link to="/register?type=corporate" className="corporate-login-link">Kurumsal Başvuru Formuna Git</Link>
              </div>
            )}

            <div className="signup-prompt">
              <p>Henüz hesabın yok mu? <Link to={activeTab === 'corporate' ? '/register?type=corporate' : '/register'}>Kayıt Ol</Link></p>
            </div>
          </div>

          <div className="secure-badge">
            <span className="material-symbols-outlined">lock</span>
            <span>Güvenli SSL Bağlantısı</span>
          </div>

        </div>
      </main>
    </div>
  );
}

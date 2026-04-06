import React, { useState, useEffect } from 'react';
import './Login.css';
import SharedHeader from './SharedHeader';
import './SharedHeader.css';
import { supabase, setAuthPersistenceMode } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('individual');
  // Enes Doğanay | 6 Nisan 2026: Beni Hatırla checkbox state'e bağlandı
  const [rememberMe, setRememberMe] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sayfa yüklendiğinde oturum kontrolü yap
  useEffect(() => {
    const checkSession = async () => {
      // Mevcut oturumu al
      const { data: { session } } = await supabase.auth.getSession();

      // Eğer kullanıcı zaten giriş yapmışsa, beklemeden profile yönlendir
      if (session) {
        navigate('/profile');
      }
    };

    checkSession();

    // Opsiyonel: Anlık oturum değişikliklerini dinle (Aynı tarayıcıda sekme arası vs.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate('/profile');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    // Enes Doğanay | 6 Nisan 2026: Beni Hatirla secimine gore auth storage login oncesi belirlenir
    setAuthPersistenceMode(rememberMe);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      // Supabase'in kendi dönen İngilizce hatalarını da baz alarak uyarıları kişiselleştirebiliriz
      if (error.message.includes("Email not confirmed")) {
        setError("Lütfen önce e-posta adresinizi onaylayın.");
      } else {
        setError("E-posta veya şifre hatalı!");
      }
    } else {
      console.log("Giriş başarılı:", data.user);
      navigate('/');
    }
  };

  // Enes Doğanay | 6 Nisan 2026: Sifre sifirlama maili gonderme akisi eklendi
  const handleForgotPassword = async () => {
    setError('');
    setSuccessMessage('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Şifre sıfırlama bağlantısı göndermek için önce e-posta adresinizi girin.');
      return;
    }

    setForgotPasswordLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    setForgotPasswordLoading(false);

    if (resetError) {
      setError('Şifre sıfırlama bağlantısı gönderilemedi. Lütfen tekrar deneyin.');
      return;
    }

    setSuccessMessage('Şifre yenileme bağlantısı e-posta adresinize gönderildi. Gelen kutunuzu kontrol edin.');
  };

  return (
    <div className="app-container">

      {/* HEADER */}
      <SharedHeader
        navItems={[
          { label: 'Anasayfa', href: '/' },
          { label: 'Firmalar', href: '/firmalar' },
          { label: 'Hakkımızda', href: '/hakkimizda' },
          { label: 'İletişim', href: '/iletisim' }
        ]}
      />

      {/* MAIN */}
      <main className="main-content">
        <div className="login-card">

          {/* TABS */}
          <div className="login-tabs">
            <button
              className={`tab-item ${activeTab === 'individual' ? 'active' : ''}`}
              onClick={() => setActiveTab('individual')}
            >
              <span className="material-symbols-outlined">person</span>
              <span>Bireysel Giriş</span>
            </button>

            <button
              className={`tab-item ${activeTab === 'corporate' ? 'active' : ''}`}
              onClick={() => setActiveTab('corporate')}
            >
              <span className="material-symbols-outlined">business</span>
              <span>Kurumsal Giriş</span>
            </button>
          </div>

          <div className="card-body">
            <div className="card-header-text">
              <h1>Hoş Geldiniz</h1>
              <p>Hesabınıza erişmek için bilgilerinizi girin.</p>
            </div>

            {/* FORM */}
            <form className="login-form" onSubmit={handleLogin}>

              <div className="form-group">
                <label>E-posta Adresi</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    placeholder="ornek@tedport.com"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <span className="material-symbols-outlined input-icon">
                    mail
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Şifre</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="******"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={togglePassword}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <label className="remember-me">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  <span>Beni Hatırla</span>
                </label>
                {/* Enes Doğanay | 6 Nisan 2026: Şifre yenileme linki e-posta adresine gönderilir */}
                <button type="button" className="forgot-password" onClick={handleForgotPassword} disabled={forgotPasswordLoading}>
                  Şifremi Unuttum
                </button>
              </div>

              {error && (
                <p className="login-error">
                  {error}
                </p>
              )}

              {successMessage && (
                <p className="login-success">
                  {successMessage}
                </p>
              )}

              <button
                type="submit"
                className="login-btn login-btn-full login-btn-primary mt-4"
                disabled={loading}
              >
                {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
              </button>

            </form>

            <div className="signup-prompt">
              <p>
                Henüz hesabın yok mu? <a href="/register">Kayıt Ol</a>
              </p>
            </div>
          </div>

          <div className="secure-badge">
            <span className="material-symbols-outlined">lock</span>
            <span>Güvenli SSL Bağlantısı</span>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="main-footer">
        <p>© 2026 Tedport. Tüm hakları saklıdır.</p>
      </footer>

    </div>
  );
};

export default LoginPage;
import React, { useState, useEffect } from 'react';
import './Login.css';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('individual');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    setLoading(true);

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
      navigate('/profile');
    }
  };

  return (
    <div className="app-container">

      {/* HEADER */}
      <header className="main-header">
        <div className="header-content">
          <div className="logo-section" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
            <h2 className="logo-text">Tedport</h2>
          </div>
        </div>
      </header>

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
                  <input type="checkbox" />
                  <span>Beni Hatırla</span>
                </label>
                <a href="#" className="forgot-password">
                  Şifremi Unuttum
                </a>
              </div>

              {error && (
                <p style={{ color: "red", marginTop: "10px" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="btn btn-full btn-primary mt-4"
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
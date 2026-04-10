import React, { useState, useEffect } from 'react';
import './Login.css';
import SharedHeader from './SharedHeader';
import './SharedHeader.css';
import { supabase, setAuthPersistenceMode } from './supabaseClient';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('type') === 'corporate' ? 'corporate' : 'individual');
  // Enes Doğanay | 6 Nisan 2026: Beni Hatırla checkbox state'e bağlandı
  const [rememberMe, setRememberMe] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setActiveTab(searchParams.get('type') === 'corporate' ? 'corporate' : 'individual');
  }, [searchParams]);

  // Enes Doğanay | 10 Nisan 2026: Sayfa yüklendiğinde oturum kontrolü — sadece tek seferlik, onAuthStateChange loop'u kaldırıldı
  useEffect(() => {
    let cancelled = false;
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && !cancelled) {
        // Enes Doğanay | 10 Nisan 2026: getManagedCompanyId() yerine direkt sorgu — fazladan getUser() AbortError yaratıyordu
        const { data: companyData } = await supabase
          .from('kurumsal_firma_yoneticileri')
          .select('firma_id')
          .eq('user_id', session.user.id)
          .maybeSingle();
        if (cancelled) return;
        const managedCompanyId = companyData?.firma_id || null;
        if (managedCompanyId) {
          const visitedKey = `tedport_firma_visited_${managedCompanyId}`;
          if (!localStorage.getItem(visitedKey)) {
            localStorage.setItem(visitedKey, '1');
            navigate('/firma-profil?tab=panel');
          } else {
            navigate('/');
          }
        } else {
          navigate('/');
        }
      }
    };
    checkSession();
    return () => { cancelled = true; };
  }, [navigate]);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Enes Doğanay | 6 Nisan 2026: Login sekmesi URL ile senkron kalir, kurumsal yonlendirmeler korunur
  const handleTabChange = (nextTab) => {
    setActiveTab(nextTab);
    setSearchParams(nextTab === 'corporate' ? { type: 'corporate' } : {});
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
      // Enes Doğanay | 10 Nisan 2026: getManagedCompanyId() yerine direkt sorgu — AbortError önleme
      const { data: companyData } = await supabase
        .from('kurumsal_firma_yoneticileri')
        .select('firma_id')
        .eq('user_id', data.user.id)
        .maybeSingle();
      const managedCompanyId = companyData?.firma_id || null;
      // Enes Doğanay | 7 Nisan 2026: İlk girişte firma profil paneline, sonraki girişlerde ana sayfaya yönlendir
      if (managedCompanyId) {
        const visitedKey = `tedport_firma_visited_${managedCompanyId}`;
        if (!localStorage.getItem(visitedKey)) {
          localStorage.setItem(visitedKey, '1');
          navigate('/firma-profil?tab=panel');
        } else {
          navigate('/');
        }
      } else {
        navigate('/');
      }
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
          { label: 'İhaleler', href: '/ihaleler' },
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
              onClick={() => handleTabChange('individual')}
            >
              <span className="material-symbols-outlined">person</span>
              <span>Bireysel Giriş</span>
            </button>

            <button
              className={`tab-item ${activeTab === 'corporate' ? 'active' : ''}`}
              onClick={() => handleTabChange('corporate')}
            >
              <span className="material-symbols-outlined">business</span>
              <span>Kurumsal Giriş</span>
            </button>
          </div>

          <div className="card-body">
            <div className="card-header-text">
              <h1>{activeTab === 'corporate' ? 'Kurumsal Giriş' : 'Hoş Geldiniz'}</h1>
              <p>{activeTab === 'corporate' ? 'Onaylanan kurumsal hesabınıza şirket e-postanızla giriş yapın.' : 'Hesabınıza erişmek için bilgilerinizi girin.'}</p>
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

            {activeTab === 'corporate' && (
              <div className="corporate-login-callout">
                {/* Enes Doğanay | 6 Nisan 2026: Kurumsal hesaplar onay sonrasi acildigi icin basvuru yonlendirmesi eklendi */}
                <strong>Kurumsal hesabın henüz yok mu?</strong>
                <p>Önce başvuru formunu doldurun. Firma doğrulaması tamamlanınca size şifre belirleme bağlantısı gönderilir.</p>
                <Link to="/register?type=corporate" className="corporate-login-link">Kurumsal Başvuru Formuna Git</Link>
              </div>
            )}

            <div className="signup-prompt">
              <p>
                Henüz hesabın yok mu? <Link to={activeTab === 'corporate' ? '/register?type=corporate' : '/register'}>Kayıt Ol</Link>
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
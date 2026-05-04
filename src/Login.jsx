import React, { useState, useEffect } from 'react';
import './Login.css';
import SharedHeader from './SharedHeader';
import './SharedHeader.css';
import SEO from './SEO'; // Enes Doğanay | 16 Nisan 2026: SEO meta tag desteği
import { supabase, setAuthPersistenceMode } from './supabaseClient';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // Enes Doğanay | 2 Mayıs 2026: Sekme doğrulaması için AuthContext flag'leri
  const { setValidatingLogin, reloadUserData } = useAuth();

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

  // Enes Doğanay | 13 Nisan 2026: Ortak yönlendirme mantığı — login ve session kontrolü için tek fonksiyon
  const redirectAfterAuth = async (userId) => {
    const redirectTo = searchParams.get('redirect');
    // Enes Doğanay | 4 Mayıs 2026: Sadece owner /firma-profil'e yönlenir; admin/member kendi profiliyle kalır
    const { data: companyData } = await supabase
      .from('kurumsal_firma_yoneticileri')
      .select('firma_id')
      .eq('user_id', userId)
      .eq('role', 'owner')
      .maybeSingle();
    const managedCompanyId = companyData?.firma_id || null;
    if (managedCompanyId) {
      const visitedKey = `tedport_firma_visited_${managedCompanyId}`;
      if (!localStorage.getItem(visitedKey)) {
        localStorage.setItem(visitedKey, '1');
        navigate('/firma-profil?tab=panel');
        return;
      }
    }
    navigate(redirectTo || '/');
  };

  useEffect(() => {
    setActiveTab(searchParams.get('type') === 'corporate' ? 'corporate' : 'individual');
  }, [searchParams]);

  // Enes Doğanay | 10 Nisan 2026: Sayfa yüklendiğinde oturum kontrolü — sadece tek seferlik, onAuthStateChange loop'u kaldırıldı
  useEffect(() => {
    let cancelled = false;
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && !cancelled) {
        await redirectAfterAuth(session.user.id);
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

    // Enes Doğanay | 2 Mayıs 2026: Sekme doğrulaması bitene kadar SIGNED_IN → loadUserData engellenir
    setValidatingLogin(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setValidatingLogin(false);
      setLoading(false);
      // Supabase'in kendi dönen İngilizce hatalarını da baz alarak uyarıları kişiselleştirebiliriz
      if (error.message.includes("Email not confirmed")) {
        setError("Lütfen önce e-posta adresinizi onaylayın.");
      } else {
        setError("E-posta veya şifre hatalı!");
      }
      return;
    }

    // Enes Doğanay | 15 Nisan 2026: Bireysel/Kurumsal sekme kontrolü — yanlış sekmeden giriş engellenir
    // Enes Doğanay | 4 Mayıs 2026: Sadece owner kurumsal hesap sayılır; admin/member bireysel hesaptır
    const { data: companyCheck } = await supabase
      .from('kurumsal_firma_yoneticileri')
      .select('firma_id, role')
      .eq('user_id', data.user.id)
      .eq('role', 'owner')
      .maybeSingle();

    const isCorporateUser = !!companyCheck?.firma_id;

    if (activeTab === 'individual' && isCorporateUser) {
      // Kurumsal hesap bireysel sekmeden giriş yapmaya çalışıyor
      setValidatingLogin(false);
      await supabase.auth.signOut();
      setLoading(false);
      setError('Bu hesap bir kurumsal hesaptır. Lütfen "Kurumsal Giriş" sekmesinden giriş yapın.');
      return;
    }

    if (activeTab === 'corporate' && !isCorporateUser) {
      // Bireysel hesap kurumsal sekmeden giriş yapmaya çalışıyor
      setValidatingLogin(false);
      await supabase.auth.signOut();
      setLoading(false);
      setError('Bu hesap bir bireysel hesaptır. Lütfen "Bireysel Giriş" sekmesinden giriş yapın.');
      return;
    }

    // Enes Doğanay | 2 Mayıs 2026: Doğrulama geçti — flag kaldır ve kullanıcı verilerini yükle
    setValidatingLogin(false);
    await reloadUserData();

    setLoading(false);
    // Enes Doğanay | 13 Nisan 2026: console.log kaldırıldı, ortak yönlendirme fonksiyonu kullanılıyor
    await redirectAfterAuth(data.user.id);
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
      <SEO title="Giriş Yap" description="Tedport hesabınıza giriş yapın." path="/login" noIndex />

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
                <div className="login-error">
                  <span>{error}</span>
                  {/* Enes Doğanay | 15 Nisan 2026: Yanlış sekme hatasında doğru sekmeye yönlendirme butonu */}
                  {error.includes('Kurumsal Giriş') && (
                    <button type="button" className="login-error-switch" onClick={() => handleTabChange('corporate')}>
                      <span className="material-symbols-outlined">arrow_forward</span>
                      Kurumsal Girişe Geç
                    </button>
                  )}
                  {error.includes('Bireysel Giriş') && (
                    <button type="button" className="login-error-switch" onClick={() => handleTabChange('individual')}>
                      <span className="material-symbols-outlined">arrow_forward</span>
                      Bireysel Girişe Geç
                    </button>
                  )}
                </div>
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

            {/* Enes Doğanay | 14 Nisan 2026: Google ile giriş butonu — şifresi olmayan Google kullanıcıları için */}
            <div className="login-divider">
              <span>veya</span>
            </div>
            <button
              type="button"
              className="login-google-btn"
              onClick={async () => {
                const { error: gErr } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: `${window.location.origin}/` }
                });
                if (gErr) setError('Google ile giriş başarısız: ' + gErr.message);
              }}
            >
              <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Google ile Giriş Yap
            </button>
            {/* Enes Doğanay | 15 Nisan 2026: LinkedIn ile giriş butonu */}
            <button
              type="button"
              className="login-linkedin-btn"
              onClick={async () => {
                const { error: lErr } = await supabase.auth.signInWithOAuth({
                  provider: 'linkedin_oidc',
                  options: { redirectTo: `${window.location.origin}/` }
                });
                if (lErr) setError('LinkedIn ile giriş başarısız: ' + lErr.message);
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              LinkedIn ile Giriş Yap
            </button>

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
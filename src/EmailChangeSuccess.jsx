{/* Enes Doğanay | 10 Nisan 2026: E-posta değişikliği onay linki tıklandığında gösterilen başarı sayfası */}
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import './SharedHeader.css';
import './EmailConfirmation.css';

const EmailChangeSuccess = () => {
  const [newEmail, setNewEmail] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Enes Doğanay | 10 Nisan 2026: Hash token'larını işle, profiles güncelle, session temizle, sonra sayfayı göster
    const processEmailChange = async () => {
      try {
        let processed = false;
        const handleSession = async (session) => {
          if (processed || !session?.user) return;
          processed = true;
          setNewEmail(session.user.email);
          // Profiles tablosundaki e-postayı güncelle
          const { data: currentProfile } = await supabase.from('profiles').select('email').eq('id', session.user.id).single();
          if (currentProfile && session.user.email !== currentProfile.email) {
            await supabase.from('profiles').update({ email: session.user.email }).eq('id', session.user.id);
          }
          // Enes Doğanay | 10 Nisan 2026: Session'ı temizle — SPA state'ini kirletmesin
          await supabase.auth.signOut();
          setReady(true);
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            subscription.unsubscribe();
            await handleSession(session);
          }
        });
        // Fallback: session zaten varsa
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          subscription.unsubscribe();
          await handleSession(session);
        }
        // Enes Doğanay | 10 Nisan 2026: 3sn içinde session gelmezse yine de sayfayı göster
        setTimeout(() => setReady(true), 3000);
      } catch {
        setReady(true);
      }
    };
    processEmailChange();
  }, []);

  // Enes Doğanay | 10 Nisan 2026: window.location.href ile tam sayfa yenileme — SPA state bozulmasını önler
  const goToLogin = () => { window.location.href = '/login'; };
  const goToHome = () => { window.location.href = '/'; };

  if (!ready) {
    return (
      <div className="ec-wrapper">
        <div className="ec-main">
          <div className="ec-card" style={{ textAlign: 'center', padding: '48px' }}>
            <div className="ec-illustration">
              <div className="ec-glow" style={{ backgroundColor: 'rgba(34, 197, 94, 0.12)' }}></div>
              <div className="ec-circle" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}>
                <span className="material-symbols-outlined">hourglass_top</span>
              </div>
            </div>
            <h1 className="ec-title">E-posta değişikliğiniz işleniyor...</h1>
            <p className="ec-description">Lütfen bekleyin.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ec-wrapper">
      {/* Enes Doğanay | 10 Nisan 2026: Sabit minimal header — a etiketi ile tam sayfa yenileme, SPA state bozulmaz */}
      <header className="shared-header">
        <div className="shared-header-inner">
          <a href="/" className="shared-logo-area" aria-label="Tedport ana sayfa">
            <img className="shared-logo-image" src="/tedport-logo.jpg" alt="Tedport Logo" />
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
              <button className="shared-register-btn" onClick={() => { window.location.href = '/register'; }} type="button">
                Kayıt Ol
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="ec-main">
        <div className="ec-card">
          {/* Enes Doğanay | 10 Nisan 2026: Başarı ikonu */}
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

          {/* Enes Doğanay | 10 Nisan 2026: Tam sayfa yenileme ile yönlendirme — bozuk SPA state'i tamamen sıfırlanır */}
          <button className="ec-btn-primary" onClick={goToLogin}>
            <span>Giriş Yap</span>
          </button>

          <div className="ec-secondary-section">
            <button className="ec-btn-text" onClick={goToHome}>
              Anasayfaya Dön
            </button>
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

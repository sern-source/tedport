{/* Enes Doğanay | 10 Nisan 2026: E-posta değişikliği onay linki tıklandığında gösterilen başarı sayfası */}
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import SharedHeader from './SharedHeader';
import './SharedHeader.css';
import './EmailConfirmation.css';

const EmailChangeSuccess = () => {
  const navigate = useNavigate();
  const [newEmail, setNewEmail] = useState(null);

  useEffect(() => {
    // Enes Doğanay | 10 Nisan 2026: Hash token'larını Supabase'e işlet, yeni e-postayı al ve profiles tablosunu güncelle
    const processEmailChange = async () => {
      try {
        // Supabase detectSessionInUrl:true olduğu için hash otomatik işlenir
        // onAuthStateChange ile session bilgisini yakala
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            setNewEmail(session.user.email);
            // Profiles tablosundaki e-postayı da güncelle
            const { data: currentProfile } = await supabase.from('profiles').select('email').eq('id', session.user.id).single();
            if (currentProfile && session.user.email !== currentProfile.email) {
              await supabase.from('profiles').update({ email: session.user.email }).eq('id', session.user.id);
            }
            subscription.unsubscribe();
          }
        });
        // Fallback: session zaten varsa (hash hızlıca işlendiyse)
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setNewEmail(session.user.email);
          const { data: currentProfile } = await supabase.from('profiles').select('email').eq('id', session.user.id).single();
          if (currentProfile && session.user.email !== currentProfile.email) {
            await supabase.from('profiles').update({ email: session.user.email }).eq('id', session.user.id);
          }
        }
      } catch { /* sessiz */ }
    };
    processEmailChange();
  }, []);

  return (
    <div className="ec-wrapper">
      <SharedHeader />

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

          <button
            className="ec-btn-primary"
            onClick={() => navigate('/profile')}
          >
            <span>Profilime Git</span>
          </button>

          <div className="ec-secondary-section">
            <button
              className="ec-btn-text"
              onClick={() => navigate('/')}
            >
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

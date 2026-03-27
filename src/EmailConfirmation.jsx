import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './EmailConfirmation.css';

const EmailConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Register sayfasından gelen e-posta ve şifreyi yakalıyoruz
  const userEmail = location.state?.email || null;
  const userPassword = location.state?.password || null;
  
  const [resendStatus, setResendStatus] = useState('');
  const pollingRef = useRef(null);

  useEffect(() => {
    // Eğer email veya şifre yoksa (kullanıcı sayfayı yenilediyse state kaybolur) döngüyü başlatma
    if (!userEmail || !userPassword) return;

    // 5 Saniyede bir arka planda "Gizlice" giriş yapmayı deniyoruz
    pollingRef.current = setInterval(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: userPassword,
      });

      if (error) {
        // Hata muhtemelen "Email not confirmed" (E-posta onaylanmadı) hatasıdır.
        // Bu durumda hiçbir şey yapmadan bir sonraki 5 saniyeyi bekliyoruz.
        console.log("Onay durumu kontrol ediliyor..."); 
      } else if (data.session) {
        // Hata yoksa ve oturum (session) oluştuysa onay verilmiş demektir!
        clearInterval(pollingRef.current);
        navigate('/profile'); // Oturumu açıp profile yönlendir
      }
    }, 5000);

    // Component ekrandan ayrıldığında (yönlendirme olunca) döngüyü temizle
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [userEmail, userPassword, navigate]);

  const handleResendEmail = async () => {
    if (!userEmail) {
      setResendStatus('E-posta adresi bulunamadı. Lütfen tekrar kayıt olmayı deneyin.');
      return;
    }

    try {
      setResendStatus('Gönderiliyor...');
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      });

      if (error) throw error;
      setResendStatus('Onay e-postası tekrar gönderildi!');
    } catch (error) {
      console.error("Tekrar gönderme hatası:", error.message);
      setResendStatus('Gönderim başarısız. Çok fazla istek atmış olabilirsiniz.');
    }
  };

  return (
    <div className="ec-wrapper">
      {/* Top Navigation Bar */}
      <header className="ec-header">
        {/* LOGO ALANI - Görsel olarak güncellendi */}
        <div 
          className="ec-header-left" 
          onClick={() => navigate('/')} 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
            <img 
                src="/tedport-logo.jpg" 
                alt="Tedport Logo" 
                style={{ height: '50px', objectFit: 'contain' }} 
            />
        </div>
      </header>

      {/* Main Content Section */}
      <main className="ec-main">
        <div className="ec-card">
          {/* Success Illustration/Icon */}
          <div className="ec-illustration">
            <div className="ec-glow"></div>
            <div className="ec-circle">
              <span className="material-symbols-outlined">mark_email_read</span>
            </div>
          </div>

          {/* Main Message */}
          <h1 className="ec-title">E-posta Onayınız Gönderildi!</h1>
          <p className="ec-description">
            Lütfen <b>{userEmail}</b> adresine gönderdiğimiz bağlantıya tıklayın. 
            Bu adım, güvenli bir B2B ticaret ortamı sağlamak için gereklidir. 
            Onayladıktan sonra sayfa sizi otomatik olarak yönlendirecektir.
          </p>

          {/* Action Buttons */}
          <button 
            className="ec-btn-primary" 
            onClick={() => navigate('/login')}
          >
            <span>Giriş Sayfasına Git</span>
          </button>

          {/* Secondary Options */}
          <div className="ec-secondary-section">
            <h2 className="ec-subtitle">E-postayı bulamadınız mı?</h2>
            <p className="ec-spam-note">Spam klasörünü kontrol etmeyi unutmayın.</p>
            <button 
              className="ec-btn-text"
              onClick={handleResendEmail}
            >
              Tekrar Gönder
            </button>
            
            {/* Tekrar Gönderim Durum Mesajı */}
            {resendStatus && (
              <p style={{ marginTop: '10px', fontSize: '13px', color: '#137fec', fontWeight: '500' }}>
                {resendStatus}
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Background Decorations */}
      <div className="ec-background-blobs">
        <div className="ec-blob-1"></div>
        <div className="ec-blob-2"></div>
      </div>

      {/* Simple Footer */}
      <footer className="ec-footer">
        <p>© 2026 Tedport. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
};

export default EmailConfirmation;
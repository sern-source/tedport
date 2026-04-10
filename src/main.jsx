import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import Router from './Router';
// Enes Doğanay | 8 Nisan 2026: AuthProvider ile auth state uygulama genelinde tek seferlik yüklenir
import { AuthProvider } from './AuthContext';
// Enes Doğanay | 8 Nisan 2026: Anlık toast bildirimleri — AuthProvider içinden alınıp render edilir
import ToastWrapper from './ToastWrapper';
import { supabase } from './supabaseClient';

// Enes Doğanay | 10 Nisan 2026: E-posta değişiklik onayı — SPA yüklenmeden önce hash'i yakala ve işle
// Bu sayede AuthContext, Realtime, vs. hiç kirlenmiyor
const hash = window.location.hash || '';
if (hash.includes('type=email_change')) {
  // Hash token'larını Supabase otomatik işlesin (detectSessionInUrl: true)
  // Session oluşunca profiles tablosunu güncelle, signOut yap, başarı sayfasına yönlendir
  const handleEmailChange = async () => {
    try {
      // Supabase hash'teki token'ları otomatik işliyor, session oluşmasını bekle
      let session = null;
      for (let i = 0; i < 20; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session) { session = data.session; break; }
        await new Promise(r => setTimeout(r, 300));
      }
      if (session?.user) {
        const freshEmail = session.user.email;
        // Profiles tablosundaki e-postayı güncelle
        const { data: currentProfile } = await supabase.from('profiles').select('email').eq('id', session.user.id).single();
        if (currentProfile && freshEmail !== currentProfile.email) {
          await supabase.from('profiles').update({ email: freshEmail }).eq('id', session.user.id);
        }
        // Session'ı temizle — SPA'yı kirletmesin
        await supabase.auth.signOut();
        // Storage'ı da temizle (kalıntı kalmasın)
        window.localStorage.removeItem(`sb-${new URL('https://gsdbutprqfnxjtppwwhn.supabase.co').host.split('.')[0]}-auth-token`);
        window.sessionStorage.removeItem(`sb-${new URL('https://gsdbutprqfnxjtppwwhn.supabase.co').host.split('.')[0]}-auth-token`);
        // Yeni e-postayı URL'e ekleyerek başarı sayfasına yönlendir
        window.location.replace(`/email-degisikligi-onay?email=${encodeURIComponent(freshEmail)}`);
      } else {
        // Session oluşamadıysa yine de başarı sayfasına yönlendir
        window.location.replace('/email-degisikligi-onay');
      }
    } catch {
      window.location.replace('/email-degisikligi-onay');
    }
  };
  // Sayfada loading göster, SPA'yı mount etme
  document.getElementById('root').innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:Inter,sans-serif;color:#64748b;font-size:1rem;">E-posta değişikliğiniz onaylanıyor...</div>';
  handleEmailChange();
} else {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <Router />
          <ToastWrapper />
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  );
}

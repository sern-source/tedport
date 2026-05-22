// Enes Doğanay | 6 Mayıs 2026: E-posta onay hook — polling + yeniden gönderim
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as authService from '../services/authService';

export const useEmailConfirmation = () => {
  const router = useRouter();
  // Enes Doğanay | 22 Mayıs 2026: react-router location.state yerine sessionStorage — lazy useState ile tek okuma
  const [credentials] = useState(() => {
    if (typeof window === 'undefined') return null;
    return JSON.parse(sessionStorage.getItem('ec_pending') || 'null');
  });
  useEffect(() => { sessionStorage.removeItem('ec_pending'); }, []);

  const userEmail = credentials?.email || null;
  const userPassword = credentials?.password || null;
  const displayEmail = userEmail || 'kayıt sırasında girdiğiniz e-posta adresi';

  const [resendStatus, setResendStatus] = useState('');
  const pollingRef = useRef(null);

  // Enes Doğanay | 6 Mayıs 2026: resend durum tipi türetilmiş — useState değil
  const resendStatusType = !resendStatus ? ''
    : resendStatus === 'Gönderiliyor...' ? 'pending'
    : resendStatus.includes('tekrar gönderildi') ? 'success'
    : 'error';

  // Enes Doğanay | 6 Mayıs 2026: 5sn'de bir arka planda oturum kontrolü — onay gelince yönlendir
  useEffect(() => {
    if (!userEmail || !userPassword) return;

    pollingRef.current = setInterval(async () => {
      try {
        const data = await authService.signIn(userEmail, userPassword, false);
        if (data.session) {
          clearInterval(pollingRef.current);
          router.push('/profile');
        }
      } catch { /* onay bekleniyor */ }
    }, 5000);

    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [userEmail, userPassword]);

  // Enes Doğanay | 6 Mayıs 2026: Onay e-postasını yeniden gönder
  const handleResend = async () => {
    if (!userEmail) {
      setResendStatus('E-posta adresi bulunamadı. Lütfen tekrar kayıt olmayı deneyin.');
      return;
    }
    setResendStatus('Gönderiliyor...');
    try {
      await authService.resendConfirmEmail(userEmail);
      setResendStatus('Onay e-postası tekrar gönderildi!');
    } catch {
      setResendStatus('Gönderim başarısız. Çok fazla istek atmış olabilirsiniz.');
    }
  };

  return { displayEmail, resendStatus, resendStatusType, handleResend };
};

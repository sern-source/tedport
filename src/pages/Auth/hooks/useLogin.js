// Enes Doğanay | 6 Mayıs 2026: Login hook — form state ve auth mantığı
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAuth } from '../../../AuthContext';
import * as authService from '../services/authService';

export const useLogin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { setValidatingLogin, reloadUserData } = useAuth();

  // Enes Doğanay | 6 Mayıs 2026: Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState(
    searchParams.get('type') === 'corporate' ? 'corporate' : 'individual'
  );
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' }); // type: 'error' | 'success'

  // Enes Doğanay | 6 Mayıs 2026: URL'den sekme senkronizasyonu
  useEffect(() => {
    setActiveTab(searchParams.get('type') === 'corporate' ? 'corporate' : 'individual');
  }, [searchParams]);

  // Enes Doğanay | 6 Mayıs 2026: Mevcut oturum varsa yönlendir
  useEffect(() => {
    let cancelled = false;
    authService.getSession().then(async (session) => {
      if (session && !cancelled) await handleRedirect(session.user.id);
    });
    return () => { cancelled = true; };
  }, []);

  // Enes Doğanay | 23 Mayıs 2026: Giriş sonrası yönlendirme — redirectTo öncelikli; yoksa ilk ziyarette firma profili
  const handleRedirect = async (userId) => {
    const redirectTo = searchParams.get('redirect');
    if (redirectTo) {
      router.push(redirectTo);
      return;
    }
    const firmaId = await authService.getOwnerFirma(userId);
    if (firmaId) {
      const key = `tedport_firma_visited_${firmaId}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, '1');
        router.push('/firma-profil?tab=panel');
        return;
      }
    }
    router.push('/');
  };

  // Enes Doğanay | 6 Mayıs 2026: Sekme değişimi — URL ile senkron
  const handleTabChange = (nextTab) => {
    setActiveTab(nextTab);
    router.replace(nextTab === 'corporate' ? pathname + '?type=corporate' : pathname, { scroll: false });
  };

  // Enes Doğanay | 6 Mayıs 2026: Giriş — sekme doğrulaması + bireysel/kurumsal ayrımı
  const handleLogin = async (e) => {
    e.preventDefault();
    setFeedback({ text: '', type: '' });
    setLoading(true);
    try {
      setValidatingLogin(true);
      const data = await authService.signIn(email, password, rememberMe);
      const firmaId = await authService.getOwnerFirma(data.user.id);
      const isCorporate = !!firmaId;

      if (activeTab === 'individual' && isCorporate) {
        setValidatingLogin(false);
        await authService.signOut();
        setFeedback({ text: 'Bu hesap bir kurumsal hesaptır. Lütfen "Kurumsal Giriş" sekmesinden giriş yapın.', type: 'error' });
        return;
      }
      if (activeTab === 'corporate' && !isCorporate) {
        setValidatingLogin(false);
        await authService.signOut();
        setFeedback({ text: 'Bu hesap bir bireysel hesaptır. Lütfen "Bireysel Giriş" sekmesinden giriş yapın.', type: 'error' });
        return;
      }

      setValidatingLogin(false);
      await reloadUserData();
      await handleRedirect(data.user.id);
    } catch (err) {
      setValidatingLogin(false);
      setFeedback({
        text: err.message?.includes('Email not confirmed')
          ? 'Lütfen önce e-posta adresinizi onaylayın.'
          : 'E-posta veya şifre hatalı!',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Enes Doğanay | 6 Mayıs 2026: Şifremi unuttum e-posta gönderimi
  const handleForgotPassword = async () => {
    setFeedback({ text: '', type: '' });
    if (!email.trim()) {
      setFeedback({ text: 'Şifre sıfırlama bağlantısı göndermek için önce e-posta adresinizi girin.', type: 'error' });
      return;
    }
    setForgotLoading(true);
    try {
      await authService.sendPasswordResetEmail(email.trim());
      setFeedback({ text: 'Şifre yenileme bağlantısı e-posta adresinize gönderildi. Gelen kutunuzu kontrol edin.', type: 'success' });
    } catch {
      setFeedback({ text: 'Şifre sıfırlama bağlantısı gönderilemedi. Lütfen tekrar deneyin.', type: 'error' });
    } finally {
      setForgotLoading(false);
    }
  };

  // Enes Doğanay | 6 Mayıs 2026: OAuth giriş işleyicileri
  const handleGoogleLogin = async () => {
    try {
      await authService.signInWithOAuth('google');
    } catch (err) {
      setFeedback({ text: 'Google ile giriş başarısız: ' + err.message, type: 'error' });
    }
  };

  const handleLinkedInLogin = async () => {
    try {
      await authService.signInWithOAuth('linkedin_oidc');
    } catch (err) {
      setFeedback({ text: 'LinkedIn ile giriş başarısız: ' + err.message, type: 'error' });
    }
  };

  // Enes Doğanay | 16 Mayıs 2026: Demo hesabı otomatik girişi — yatırımcı/sunum ortamı
  // Tab kontrolü bypass edilir; e-posta türünden doğru yönlendirme yapılır
  const [demoLoading, setDemoLoading] = useState(null); // null | email string
  const handleDemoLogin = async (demoEmail) => {
    setFeedback({ text: '', type: '' });
    setDemoLoading(demoEmail);
    try {
      setValidatingLogin(true);
      const data = await authService.signIn(demoEmail, 'Demo2026!', false);
      setValidatingLogin(false);
      await reloadUserData();
      const firmaId = await authService.getOwnerFirma(data.user.id);
      router.push(firmaId ? '/firma-profil?tab=panel' : '/ihaleler');
    } catch {
      setValidatingLogin(false);
      setFeedback({ text: 'Demo girişi başarısız. Seed SQL çalıştırıldığından emin olun.', type: 'error' });
    } finally {
      setDemoLoading(null);
    }
  };

  return {
    email, setEmail,
    password, setPassword,
    rememberMe, setRememberMe,
    showPassword, setShowPassword,
    activeTab,
    loading,
    forgotLoading,
    feedback,
    handleLogin,
    handleForgotPassword,
    handleTabChange,
    handleGoogleLogin,
    handleLinkedInLogin,
    demoLoading,
    handleDemoLogin,
  };
};

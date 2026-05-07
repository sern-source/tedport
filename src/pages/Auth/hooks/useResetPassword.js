// Enes Doğanay | 6 Mayıs 2026: Şifre sıfırlama hook
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';

export const useResetPassword = () => {
  const navigate = useNavigate();

  // Enes Doğanay | 6 Mayıs 2026: Form state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  // Enes Doğanay | 6 Mayıs 2026: Recovery session doğrulama
  useEffect(() => {
    let isMounted = true;

    authService.getSession().then((session) => {
      if (!isMounted) return;
      setHasSession(Boolean(session));
      setChecking(false);
    });

    const { data: { subscription } } = authService.subscribeAuthState((event, session) => {
      if (!isMounted) return;
      if (event === 'PASSWORD_RECOVERY' || session) setHasSession(true);
      setChecking(false);
    });

    return () => { isMounted = false; subscription.unsubscribe(); };
  }, []);

  // Enes Doğanay | 6 Mayıs 2026: Yeni şifre belirleme
  const handleReset = async (e) => {
    e.preventDefault();
    setFeedback({ text: '', type: '' });

    if (!password || !confirmPassword) {
      setFeedback({ text: 'Lütfen yeni şifrenizi iki alana da girin.', type: 'error' });
      return;
    }
    if (password.length < 6) {
      setFeedback({ text: 'Şifreniz en az 6 karakter olmalıdır.', type: 'error' });
      return;
    }
    if (password !== confirmPassword) {
      setFeedback({ text: 'Şifreler birbiriyle eşleşmiyor.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await authService.updatePassword(password);
      setFeedback({ text: 'Şifreniz güncellendi. Giriş ekranına yönlendiriliyorsunuz.', type: 'success' });
      await authService.signOut();
      window.setTimeout(() => navigate('/login'), 1600);
    } catch {
      setFeedback({ text: 'Şifre güncellenemedi. Lütfen bağlantıyı yeniden açıp tekrar deneyin.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return {
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPassword, setShowPassword,
    showConfirm, setShowConfirm,
    loading,
    checking,
    hasSession,
    feedback,
    handleReset,
  };
};

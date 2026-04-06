import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import SharedHeader from './SharedHeader';
import './SharedHeader.css';
import { supabase } from './supabaseClient';

const ResetPasswordPage = () => {
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);
    const [hasRecoverySession, setHasRecoverySession] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        let isMounted = true;

        // Enes Doğanay | 6 Nisan 2026: Recovery linkinden gelen session burada dogrulanir
        const checkRecoverySession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!isMounted) return;

            setHasRecoverySession(Boolean(session));
            setCheckingSession(false);
        };

        checkRecoverySession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!isMounted) return;

            if (event === 'PASSWORD_RECOVERY' || session) {
                setHasRecoverySession(true);
            }

            setCheckingSession(false);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Enes Doğanay | 6 Nisan 2026: Recovery session ile yeni sifre belirleme akisi eklendi
    const handleResetPassword = async (event) => {
        event.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!password || !confirmPassword) {
            setError('Lütfen yeni şifrenizi iki alana da girin.');
            return;
        }

        if (password.length < 6) {
            setError('Şifreniz en az 6 karakter olmalıdır.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Şifreler birbiriyle eşleşmiyor.');
            return;
        }

        setLoading(true);

        const { error: updateError } = await supabase.auth.updateUser({ password });

        setLoading(false);

        if (updateError) {
            setError('Şifre güncellenemedi. Lütfen bağlantıyı yeniden açıp tekrar deneyin.');
            return;
        }

        setSuccessMessage('Şifreniz güncellendi. Giriş ekranına yönlendiriliyorsunuz.');
        await supabase.auth.signOut();
        window.setTimeout(() => {
            navigate('/login');
        }, 1600);
    };

    return (
        <div className="app-container">
            <SharedHeader
                navItems={[
                    { label: 'Anasayfa', href: '/' },
                    { label: 'Firmalar', href: '/firmalar' },
                    { label: 'Hakkımızda', href: '/hakkimizda' },
                    { label: 'İletişim', href: '/iletisim' }
                ]}
            />

            <main className="main-content">
                <div className="login-card">
                    <div className="card-body">
                        <div className="card-header-text">
                            <h1>Yeni Şifre Belirle</h1>
                            <p>Hesabınız için yeni şifrenizi güvenli şekilde oluşturun.</p>
                        </div>

                        {checkingSession ? (
                            <p className="login-info">Bağlantı doğrulanıyor...</p>
                        ) : !hasRecoverySession ? (
                            <div className="reset-password-state">
                                <p className="login-error">Bu şifre yenileme bağlantısı geçersiz veya süresi dolmuş olabilir.</p>
                                <button type="button" className="login-btn login-btn-full login-btn-primary mt-4" onClick={() => navigate('/login')}>
                                    Girişe Dön
                                </button>
                            </div>
                        ) : (
                            <form className="login-form" onSubmit={handleResetPassword}>
                                <div className="form-group">
                                    <label>Yeni Şifre</label>
                                    <div className="input-wrapper">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Yeni şifrenizi girin"
                                            className="form-input"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button type="button" className="toggle-password" onClick={() => setShowPassword((prev) => !prev)}>
                                            <span className="material-symbols-outlined">
                                                {showPassword ? 'visibility' : 'visibility_off'}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Yeni Şifre Tekrar</label>
                                    <div className="input-wrapper">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Yeni şifrenizi tekrar girin"
                                            className="form-input"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                        <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword((prev) => !prev)}>
                                            <span className="material-symbols-outlined">
                                                {showConfirmPassword ? 'visibility' : 'visibility_off'}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {error && <p className="login-error">{error}</p>}
                                {successMessage && <p className="login-success">{successMessage}</p>}

                                <button type="submit" className="login-btn login-btn-full login-btn-primary mt-4" disabled={loading}>
                                    {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>

            <footer className="main-footer">
                <p>© 2026 Tedport. Tüm hakları saklıdır.</p>
            </footer>
        </div>
    );
};

export default ResetPasswordPage;
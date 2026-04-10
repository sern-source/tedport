import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const hash = window.location.hash || '';
        // Enes Doğanay | 6 Nisan 2026: Supabase recovery linki root'a düşerse reset-password ekranına yönlendir
        const isRecoveryFlow = hash.includes('type=recovery');
        if (isRecoveryFlow && location.pathname !== '/reset-password') {
            navigate(`/reset-password${hash}`, { replace: true });
            return;
        }
        // Enes Doğanay | 10 Nisan 2026: E-posta değişiklik onayı — hash'teki token ile giriş yap, profile yönlendir
        const isEmailChangeFlow = hash.includes('type=email_change');
        if (isEmailChangeFlow) {
            navigate(`/profile${hash}`, { replace: true });
            return;
        }
        // Enes Doğanay | 10 Nisan 2026: Supabase onay mesajı hash'inde — hash temizle, profile yönlendir
        if (hash.includes('message=') && location.pathname === '/') {
            window.history.replaceState(null, '', '/profile');
            navigate('/profile', { replace: true });
        }
    }, [location.pathname, navigate]);

    return (
        <div className="app-container">
            <Outlet />
        </div>
    );
}

import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Enes Doğanay | 6 Nisan 2026: Supabase recovery linki root'a düşerse reset-password ekranina yonlendir
        const hash = window.location.hash || '';
        const isRecoveryFlow = hash.includes('type=recovery');

        if (isRecoveryFlow && location.pathname !== '/reset-password') {
            navigate(`/reset-password${hash}`, { replace: true });
        }
    }, [location.pathname, navigate]);

    return (
        <div className="app-container">
            <Outlet />
        </div>
    );
}

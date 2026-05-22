// Enes Doğanay | 22 Mayıs 2026: Next.js client layout — scroll restore, hash redirect (Layout.jsx yerine geçer)
'use client';
import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function LayoutClient({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const isPopRef = useRef(false);

    useEffect(() => {
        const onPop = () => { isPopRef.current = true; };
        window.addEventListener('popstate', onPop);
        return () => window.removeEventListener('popstate', onPop);
    }, []);

    // Enes Doğanay | 22 Mayıs 2026: Geri tuşunda scroll'u koru, yeni navigasyonda smooth scroll top
    useEffect(() => {
        if (isPopRef.current) {
            isPopRef.current = false;
            return;
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [pathname]);

    // Enes Doğanay | 22 Mayıs 2026: Supabase hash yönlendirmeleri
    useEffect(() => {
        const hash = window.location.hash || '';
        if (hash.includes('type=recovery') && pathname !== '/reset-password') {
            router.replace('/reset-password' + hash);
            return;
        }
        if (hash.includes('type=email_change')) {
            window.location.replace('/email-degisikligi-onay');
            return;
        }
        if (hash.includes('message=') && pathname === '/') {
            router.replace('/profile');
        }
    }, [pathname, router]);

    return <>{children}</>;
}

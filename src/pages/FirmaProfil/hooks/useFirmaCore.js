// Enes Doğanay | 7 Mayıs 2026: Firma profil koordinatör — embedded, toast, tab + data
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFirmaCoreInit } from './useFirmaCoreInit';

export const useFirmaCore = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    // Enes Doğanay | 22 Mayıs 2026: react-router setSearchParams uyumlu yardımcı
    const setSearchParams = useCallback((paramsOrFn, _opts) => {
        let next;
        if (typeof paramsOrFn === 'function') {
            const current = new URLSearchParams(searchParams.toString());
            next = paramsOrFn(current);
        } else if (paramsOrFn instanceof URLSearchParams) {
            next = paramsOrFn;
        } else {
            next = new URLSearchParams(paramsOrFn);
        }
        router.replace('?' + next.toString(), { scroll: false });
    }, [searchParams, router]);
    const isEmbedded = searchParams.get('embedded') === '1';
    // Enes Doğanay | 8 Mayıs 2026: Şirketim sayfasından navigate ile gelindi mi?
    const fromSirketim = searchParams.get('from') === 'sirketim';
    const currentTab = searchParams.get('tab') || 'panel';

    const [fpToast, setFpToast] = useState(null);
    const fpToastTimerRef = useRef(null);

    const coreInit = useFirmaCoreInit({ navigate: (path) => router.push(path) });

    const showFpToast = useCallback((type, message) => {
        if (fpToastTimerRef.current) clearTimeout(fpToastTimerRef.current);
        setFpToast({ type, message });
        fpToastTimerRef.current = setTimeout(() => setFpToast(null), 3800);
    }, []);

    const setTab = useCallback((params) => {
        if (isEmbedded) setSearchParams({ ...params, embedded: '1' });
        // Enes Doğanay | 8 Mayıs 2026: from=sirketim parametresini koru
        else if (fromSirketim) setSearchParams({ ...params, from: 'sirketim' });
        else setSearchParams(params);
    }, [isEmbedded, fromSirketim, router, setSearchParams]);

    // Enes Doğanay | 7 Mayıs 2026: Embedded modda yatay scroll engelle
    useEffect(() => {
        if (isEmbedded) {
            document.documentElement.style.overflowX = 'hidden';
            document.body.style.overflowX = 'hidden';
        }
        return () => {
            document.documentElement.style.overflowX = '';
            document.body.style.overflowX = '';
        };
    }, [isEmbedded]);

    // Enes Doğanay | 7 Mayıs 2026: Embedded modda dark mode senkronizasyonu
    useEffect(() => {
        if (!isEmbedded) return;
        const applyTheme = () => {
            const theme = localStorage.getItem('tedport-theme') || 'light';
            document.documentElement.setAttribute('data-theme', theme);
        };
        const onMessage = (e) => {
            if (e.origin !== window.location.origin) return;
            if (e.data?.type === 'tedport-theme') document.documentElement.setAttribute('data-theme', e.data.theme);
        };
        applyTheme();
        window.addEventListener('storage', applyTheme);
        window.addEventListener('message', onMessage);
        return () => { window.removeEventListener('storage', applyTheme); window.removeEventListener('message', onMessage); };
    }, [isEmbedded]);

    return {
        ...coreInit,
        isEmbedded, fromSirketim, currentTab, setTab,
        searchParams, setSearchParams, navigate: (path) => router.push(path),
        fpToast, showFpToast,
    };
};

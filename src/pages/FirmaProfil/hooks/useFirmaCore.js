// Enes Doğanay | 7 Mayıs 2026: Firma profil koordinatör — embedded, toast, tab + data
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFirmaCoreInit } from './useFirmaCoreInit';

export const useFirmaCore = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const isEmbedded = searchParams.get('embedded') === '1';
    const currentTab = searchParams.get('tab') || 'panel';

    const [fpToast, setFpToast] = useState(null);
    const fpToastTimerRef = useRef(null);

    const coreInit = useFirmaCoreInit({ navigate });

    const showFpToast = useCallback((type, message) => {
        if (fpToastTimerRef.current) clearTimeout(fpToastTimerRef.current);
        setFpToast({ type, message });
        fpToastTimerRef.current = setTimeout(() => setFpToast(null), 3800);
    }, []);

    const setTab = useCallback((params) => {
        if (isEmbedded) setSearchParams({ ...params, embedded: '1' });
        else setSearchParams(params);
    }, [isEmbedded, setSearchParams]);

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
        isEmbedded, currentTab, setTab,
        searchParams, setSearchParams, navigate,
        fpToast, showFpToast,
    };
};

// Enes Doğanay | 2 Mayıs 2026: Faz 2 — dark mode tema hook'u
// Enes Doğanay | 3 Mayıs 2026: Custom event ile tüm useTheme örnekleri senkronize edilir
import { useState, useEffect } from 'react';

const THEME_EVENT = 'tedport-theme-change';

const getInitialTheme = () => {
    try {
        const saved = localStorage.getItem('tedport-theme');
        if (saved === 'dark' || saved === 'light') return saved;
        return 'light';
    } catch {
        return 'light';
    }
};

export function useTheme() {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        // Enes Doğanay | 3 Mayıs 2026: Diğer bileşenlerdeki toggle'ı dinle ve senkronize ol
        const onThemeChange = (e) => setTheme(e.detail);
        window.addEventListener(THEME_EVENT, onThemeChange);
        return () => window.removeEventListener(THEME_EVENT, onThemeChange);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem('tedport-theme', theme);
        } catch {}
    }, [theme]);

    // Enes Doğanay | 3 Mayıs 2026: Toggle — tüm örneklere event yayınla
    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: next }));
    };

    return { theme, toggleTheme };
}

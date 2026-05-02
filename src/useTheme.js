// Enes Doğanay | 2 Mayıs 2026: Faz 2 — dark mode tema hook'u
// localStorage'a kaydeder, sistem tercihini okur, <html> data-theme attribute'unu yönetir
import { useState, useEffect } from 'react';

export function useTheme() {
    const [theme, setTheme] = useState(() => {
        try {
            const saved = localStorage.getItem('tedport-theme');
            if (saved === 'dark' || saved === 'light') return saved;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } catch {
            return 'light';
        }
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem('tedport-theme', theme);
        } catch {}
    }, [theme]);

    // Enes Doğanay | 2 Mayıs 2026: Toggle — light↔dark geçişi
    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    return { theme, toggleTheme };
}

// Enes Doğanay | 28 Haziran 2026: HTML sanitizasyon yardımcısı — XSS önleme
// DOMPurify yalnızca tarayıcıda (window) çalışır.
// SSR sırasında ham HTML döner (admin-kaynaklı güvenilir içerik);
// hydration sonrasında istemci DOMPurify ile temizler.
import DOMPurify from 'dompurify';

/**
 * DB'den veya harici kaynaktan gelen HTML'i XSS'e karşı temizler.
 * @param {string} html - Temizlenecek ham HTML
 * @returns {string} Güvenli HTML
 */
export const sanitizeHtml = (html) => {
    if (!html) return '';
    if (typeof window === 'undefined') return html;
    return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
};

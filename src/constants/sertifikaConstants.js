// Enes Doğanay | 12 Mayıs 2026: Sertifika türleri — badge renk meta verisi
export const SERTIFIKA_TURLERI = [
    { value: 'ISO 9001',  label: 'ISO 9001',  desc: 'Kalite Yönetim Sistemi',        color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    { value: 'ISO 14001', label: 'ISO 14001', desc: 'Çevre Yönetim Sistemi',          color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    { value: 'ISO 45001', label: 'ISO 45001', desc: 'İş Sağlığı ve Güvenliği',        color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
    { value: 'TSE',       label: 'TSE',       desc: 'Türk Standartları Enstitüsü',    color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    { value: 'CE',        label: 'CE',        desc: 'Avrupa Uygunluk İşareti',        color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    { value: 'ISO 27001', label: 'ISO 27001', desc: 'Bilgi Güvenliği Yönetimi',       color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
    { value: 'Diger',     label: 'Diğer',     desc: 'Diğer sertifika',                color: '#475569', bg: '#f8fafc', border: '#e2e8f0' },
];

// Enes Doğanay | 12 Mayıs 2026: Hızlı erişim için lookup map
export const SERTIFIKA_META = Object.fromEntries(
    SERTIFIKA_TURLERI.map(t => [t.value, t])
);

// Enes Doğanay | 22 Mayıs 2026: 404 Not Found — FAZ 2'de gerçek NotFoundPage ile değiştirilecek
export default function NotFound() {
    return (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>404 — Sayfa Bulunamadı</h1>
            <a href="/" style={{ color: '#137fec' }}>Anasayfaya Dön</a>
        </div>
    );
}

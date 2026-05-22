// Enes Doğanay | 22 Mayıs 2026: İhaleler — Next.js App Router page
// Enes Doğanay | 23 Mayıs 2026: Server Component — metadata için 'use client' kaldırıldı
import IhalelerPage from '../../src/pages/Ihaleler/IhalelerPage';

// Enes Doğanay | 23 Mayıs 2026: Statik metadata — layout template '%s | Tedport' uygular
export const metadata = {
    title: 'İhaleler',
    description: 'Türkiye\'nin endüstriyel ihale portalı — açık ihaleleri incele, teklif ver, ihale uyarılarına abone ol.',
    openGraph: {
        title: 'İhaleler | Tedport',
        description: 'Türkiye\'nin endüstriyel ihale portalı — açık ihaleleri incele, teklif ver, ihale uyarılarına abone ol.',
        url: 'https://tedport.com/ihaleler',
    },
};

export default function IhalelerRoute() {
    return <IhalelerPage />;
}

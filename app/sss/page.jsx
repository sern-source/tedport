// Enes Doğanay | 22 Mayıs 2026: SSS — Next.js App Router page
// Enes Doğanay | 23 Mayıs 2026: Server Component — metadata SSR için 'use client' kaldırıldı
export const dynamic = 'force-dynamic';
import SSSPage from '../../src/pages/StaticPages/SSSPage';
import { Suspense } from 'react';

// Enes Doğanay | 23 Mayıs 2026: SSR metadata — Google botu sayfa başlık/açıklamasını HTML'de görür
export const metadata = {
    title: 'Sıkça Sorulan Sorular',
    description: 'Tedport hakkında merak ettiğiniz her şey burada — kayıt, ihale, teklif verme, firma rehberi, güvenlik ve daha fazlası.',
    openGraph: {
        title: 'Sıkça Sorulan Sorular | Tedport',
        url: 'https://tedport.com/sss',
    },
};

export default function SSSRoute() {
    return <Suspense fallback={null}><SSSPage /></Suspense>;
}

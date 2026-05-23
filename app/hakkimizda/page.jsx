// Enes Doğanay | 22 Mayıs 2026: Hakkımızda — Next.js App Router page
// Enes Doğanay | 23 Mayıs 2026: Server Component — metadata SSR için 'use client' kaldırıldı
export const dynamic = 'force-dynamic';
import HakkimizdaPage from '../../src/pages/StaticPages/HakkimizdaPage';
import { Suspense } from 'react';

// Enes Doğanay | 23 Mayıs 2026: SSR metadata — Google botu sayfa başlık/açıklamasını HTML'de görür
export const metadata = {
    title: 'Hakkımızda',
    description: "Türkiye'nin B2B çözüm ortaklığı platformu Tedport hakkında bilgi edinin. Misyonumuz, vizyonumuz ve platformun sunduğu avantajlar.",
    openGraph: {
        title: 'Hakkımızda | Tedport',
        url: 'https://tedport.com/hakkimizda',
    },
};

export default function HakkimizdaRoute() {
    return <Suspense fallback={null}><HakkimizdaPage /></Suspense>;
}

// Enes Doğanay | 22 Mayıs 2026: İletişim — Next.js App Router page
// Enes Doğanay | 23 Mayıs 2026: Server Component — metadata SSR için 'use client' kaldırıldı
export const dynamic = 'force-dynamic';
import IletisimPage from '../../src/pages/StaticPages/IletisimPage';
import { Suspense } from 'react';

// Enes Doğanay | 23 Mayıs 2026: SSR metadata — Google botu sayfa başlık/açıklamasını HTML'de görür
export const metadata = {
    title: 'İletişim',
    description: 'Tedport ile iletişime geçin. Sorularınız ve önerileriniz için bize ulaşın.',
    openGraph: {
        title: 'İletişim | Tedport',
        url: 'https://tedport.com/iletisim',
    },
};

export default function IletisimRoute() {
    return <Suspense fallback={null}><IletisimPage /></Suspense>;
}

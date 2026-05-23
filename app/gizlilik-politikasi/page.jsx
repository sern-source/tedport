// Enes Doğanay | 22 Mayıs 2026: Gizlilik Politikası — Next.js App Router page
// Enes Doğanay | 23 Mayıs 2026: Server Component — metadata SSR için 'use client' kaldırıldı
export const dynamic = 'force-dynamic';
import GizlilikPolitikasiPage from '../../src/pages/StaticPages/GizlilikPolitikasiPage';
import { Suspense } from 'react';

// Enes Doğanay | 23 Mayıs 2026: SSR metadata — Google botu sayfa başlık/açıklamasını HTML'de görür
export const metadata = {
    title: 'Gizlilik Politikası',
    description: 'Tedport gizlilik politikası — kişisel verileriniz nasıl korunur.',
};

export default function GizlilikPolitikasiRoute() {
    return <Suspense fallback={null}><GizlilikPolitikasiPage /></Suspense>;
}

// Enes Doğanay | 22 Mayıs 2026: Hizmet Şartları — Next.js App Router page
// Enes Doğanay | 23 Mayıs 2026: Server Component — metadata SSR için 'use client' kaldırıldı
export const dynamic = 'force-dynamic';
import HizmetSartlariPage from '../../src/pages/StaticPages/HizmetSartlariPage';
import { Suspense } from 'react';

// Enes Doğanay | 23 Mayıs 2026: SSR metadata — Google botu sayfa başlık/açıklamasını HTML'de görür
export const metadata = {
    title: 'Hizmet Şartları',
    description: 'Tedport platformu kullanım koşulları ve hizmet şartları.',
};

export default function HizmetSartlariRoute() {
    return <Suspense fallback={null}><HizmetSartlariPage /></Suspense>;
}

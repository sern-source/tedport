// Enes Doğanay | 22 Mayıs 2026: KVKK — Next.js App Router page
// Enes Doğanay | 23 Mayıs 2026: Server Component — metadata SSR için 'use client' kaldırıldı
export const dynamic = 'force-dynamic';
import KvkkPage from '../../src/pages/StaticPages/KvkkPage';
import { Suspense } from 'react';

// Enes Doğanay | 23 Mayıs 2026: SSR metadata — Google botu sayfa başlık/açıklamasını HTML'de görür
export const metadata = {
    title: 'KVKK Aydınlatma Metni',
    description: 'Tedport Kişisel Verilerin Korunması Kanunu Aydınlatma Metni.',
};

export default function KvkkRoute() {
    return <Suspense fallback={null}><KvkkPage /></Suspense>;
}

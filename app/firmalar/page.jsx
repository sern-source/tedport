// Enes Doğanay | 22 Mayıs 2026: Firmalar — Next.js App Router page
// Enes Doğanay | 23 Mayıs 2026: Server Component — metadata için 'use client' kaldırıldı
import FirmalarPage from '../../src/pages/Firmalar/FirmalarPage';

// Enes Doğanay | 23 Mayıs 2026: Statik metadata — layout template '%s | Tedport' uygular
export const metadata = {
    title: 'Firmalar',
    description: 'Türkiye\'nin kurumsal firma rehberi — tedarikçi ara, firma profillerini incele, teklif talebi gönder.',
    openGraph: {
        title: 'Firmalar | Tedport',
        description: 'Türkiye\'nin kurumsal firma rehberi — tedarikçi ara, firma profillerini incele, teklif talebi gönder.',
        url: 'https://tedport.com/firmalar',
    },
};

import { Suspense } from 'react';
export default function FirmalarRoute() {
    return <Suspense fallback={null}><FirmalarPage /></Suspense>;
}

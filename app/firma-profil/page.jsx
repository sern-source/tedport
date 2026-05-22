// Enes Doğanay | 22 Mayıs 2026: Firma Profil — Next.js App Router page
'use client';
// Enes Doganay | 23 Mayis 2026: force-dynamic — useSearchParams ve auth gerektiren sayfalarda static prerender devre disi
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import FirmaProfilPage from '../../src/pages/FirmaProfil/FirmaProfilPage';
export default function Page() {
    return <Suspense fallback={null}><FirmaProfilPage /></Suspense>;
}

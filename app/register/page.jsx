// Enes Doğanay | 22 Mayıs 2026: Register — Next.js App Router page
'use client';
// Enes Doganay | 23 Mayis 2026: force-dynamic — useSearchParams ve auth gerektiren sayfalarda static prerender devre disi
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import RegisterPage from '../../src/pages/Register/RegisterPage';
export default function Page() {
    return <Suspense fallback={null}><RegisterPage /></Suspense>;
}

// Enes Doğanay | 22 Mayıs 2026: Abonelik İptal — Next.js App Router page
'use client';
// Enes Doganay | 23 Mayis 2026: force-dynamic — useSearchParams ve auth gerektiren sayfalarda static prerender devre disi
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import UnsubscribePage from '../../src/pages/Abonelik/UnsubscribePage';
export default function Page() {
    return <Suspense fallback={null}><UnsubscribePage /></Suspense>;
}

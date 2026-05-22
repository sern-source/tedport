// Enes Doğanay | 23 Mayıs 2026: /firmadetay/:id → /firmalar/:slug 301 redirect (Server Component)
// Eski ID bazlı URL'ler SEO kaybı olmadan yeni slug URL'e yönlendirilir
// fetch() kullanılıyor — @supabase bağımlılığından kaynaklanan Turbopack vendor-chunk hatası önlendi
import { permanentRedirect, redirect } from 'next/navigation';

export default async function FirmaDetayRedirect({ params }) {
    const { id } = await params;

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/firmalar?firmaID=eq.${encodeURIComponent(id)}&select=slug`,
        {
            headers: {
                apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            cache: 'no-store',
        }
    );

    if (res.ok) {
        const rows = await res.json();
        if (rows?.[0]?.slug) {
            permanentRedirect(`/firmalar/${rows[0].slug}`);
        }
    }

    redirect('/firmalar');
}

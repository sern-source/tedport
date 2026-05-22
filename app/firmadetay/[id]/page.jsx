// Enes Doğanay | 23 Mayıs 2026: /firmadetay/:id → /firmalar/:slug 301 redirect (Server Component)
// Eski ID bazlı URL'ler SEO kaybı olmadan yeni slug URL'e yönlendirilir
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default async function FirmaDetayRedirect({ params }) {
    const { id } = await params;
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const { data } = await supabase
        .from('firmalar')
        .select('slug')
        .eq('firmaID', id)
        .single();

    if (data?.slug) {
        redirect(`/firmalar/${data.slug}`);
    }
    redirect('/firmalar');
}

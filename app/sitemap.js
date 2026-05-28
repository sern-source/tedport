// Enes Doğanay | 23 Mayıs 2026: Dinamik sitemap — statik route'lar + DB firma slug'ları + sektör sayfaları
// Next.js App Router sitemap.js → /sitemap.xml endpoint'ini üretir
import { SEKTORLER } from '../src/pages/Firmalar/utils/sektorData';
import { toSlug } from '../src/pages/SektorLanding/utils/sektorSlugUtils';

const BASE_URL = 'https://tedport.com';

// Enes Doğanay | 28 Mayıs 2026: Supabase PostgREST max_rows=1000 limiti aşmak için pagination
// limit=10000 göndersek bile sunucu en fazla 1000 satır döndürür — offset ile tüm kayıtlar çekilir
const SUPABASE_PAGE_SIZE = 1000;

async function fetchFirmaSlugs() {
    const allSlugs = [];
    let offset = 0;

    try {
        while (true) {
            const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/firmalar?slug=not.is.null&select=slug&limit=${SUPABASE_PAGE_SIZE}&offset=${offset}`;
            const res = await fetch(url, {
                headers: {
                    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                },
                next: { revalidate: 3600 },
            });
            if (!res.ok) break;
            const batch = await res.json();
            if (!Array.isArray(batch) || batch.length === 0) break;
            allSlugs.push(...batch);
            if (batch.length < SUPABASE_PAGE_SIZE) break;
            offset += SUPABASE_PAGE_SIZE;
        }
    } catch {
        return allSlugs;
    }

    return allSlugs;
}

// Enes Doğanay | 23 Mayıs 2026: Next.js sitemap() — tüm URL'leri birleştirir
export default async function sitemap() {
    const firmaSlugs = await fetchFirmaSlugs();

    // Enes Doğanay | 23 Mayıs 2026: Statik sayfalar
    const staticRoutes = [
        { url: `${BASE_URL}/`,                    lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
        { url: `${BASE_URL}/firmalar`,             lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
        { url: `${BASE_URL}/ihaleler`,             lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
        { url: `${BASE_URL}/hakkimizda`,           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
        { url: `${BASE_URL}/sss`,                  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
        { url: `${BASE_URL}/iletisim`,             lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
        { url: `${BASE_URL}/kvkk`,                 lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.4 },
        { url: `${BASE_URL}/hizmet-sartlari`,      lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.4 },
        { url: `${BASE_URL}/gizlilik-politikasi`,  lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.4 },
    ];

    // Enes Doğanay | 23 Mayıs 2026: Sektör landing sayfaları — SEKTORLER'den türetilir
    const sektorRoutes = SEKTORLER.map(sektor => ({
        url: `${BASE_URL}/ihaleler/sektor/${toSlug(sektor)}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.85,
    }));

    // Enes Doğanay | 23 Mayıs 2026: Firma detay sayfaları — DB'den çekilen slug'lar
    const firmaRoutes = firmaSlugs.map(({ slug }) => ({
        url: `${BASE_URL}/firmalar/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [...staticRoutes, ...sektorRoutes, ...firmaRoutes];
}

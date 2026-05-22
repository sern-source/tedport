// Enes Doğanay | 23 Mayıs 2026: Firma detay — Server Component, SSR + generateMetadata
// initialFirma sunucuda çekilip Client Component'e aktarılır — Google bot tam HTML görür
import FirmaDetayPage from '../../../src/pages/FirmaDetay/FirmaDetayPage';

// Enes Doğanay | 23 Mayıs 2026: FIRMA_SELECT — firmaDetayService.js ile birebir eşleşmeli
const FIRMA_SELECT = 'firmaID,slug,firma_adi,web_sitesi,category_name,description,firma_turu,telefon,eposta,adres,latitude,longitude,ana_sektor,urun_kategorileri,logo_url,il_ilce,best,onayli_hesap,show_ekip_public';

async function fetchFirmaSSR(slug) {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/firmalar?slug=eq.${encodeURIComponent(slug)}&select=${FIRMA_SELECT}`;
    const res = await fetch(url, {
        headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows?.[0] || null;
}

// Enes Doğanay | 23 Mayıs 2026: Next.js generateMetadata — server-side <title> ve og:* tagları
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const firma = await fetchFirmaSSR(slug);
    if (!firma) return { title: 'Firma Bulunamadı' };

    const description = `${firma.firma_adi}${firma.category_name ? ' — ' + firma.category_name : ''}${firma.il_ilce ? ', ' + firma.il_ilce : ''}. Tedport'ta firma profilini inceleyin, teklif talebi gönderin.`;
    const logoUrl = firma.logo_url?.includes('firma-logolari') ? firma.logo_url : null;

    return {
        title: firma.firma_adi,
        description,
        openGraph: {
            title: `${firma.firma_adi} | Tedport`,
            description,
            url: `https://tedport.com/firmalar/${slug}`,
            ...(logoUrl ? { images: [{ url: logoUrl }] } : {}),
        },
    };
}

// Enes Doğanay | 23 Mayıs 2026: Server Component — firma verisini SSR olarak çek, Client Component'e geç
export default async function FirmaDetayRoute({ params }) {
    const { slug } = await params;
    const initialFirma = await fetchFirmaSSR(slug);
    return <FirmaDetayPage initialFirma={initialFirma} />;
}

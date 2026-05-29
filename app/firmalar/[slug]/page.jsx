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

// Enes Doğanay | 29 Mayıs 2026: Hukuki ekleri (A.Ş., Ltd. Şti. vb.) title'dan siler — SEO için kısa isim
const LEGAL_SUFFIX_PATTERNS = [
    /\s+San\.\s+ve\s+Tic\.\s+A\.Ş\.\s*$/i,
    /\s+San\.\s+ve\s+Tic\.\s+Ltd\.\s+Şti\.\s*$/i,
    /\s+Tic\.\s+ve\s+San\.\s+A\.Ş\.\s*$/i,
    /\s+Sanayi\s+ve\s+Ticaret\s+A\.Ş\.\s*$/i,
    /\s+Sanayi\s+ve\s+Ticaret\s+Ltd\.\s+Şti\.\s*$/i,
    /\s+San\.\s+A\.Ş\.\s*$/i,
    /\s+Tic\.\s+A\.Ş\.\s*$/i,
    /\s+A\.Ş\.\s*$/i,
    /\s+Ltd\.\s+Şti\.\s*$/i,
    /\s+Şti\.\s*$/i,
];

function getShortName(firmaAdi) {
    if (!firmaAdi) return firmaAdi;
    let name = firmaAdi;
    for (const pattern of LEGAL_SUFFIX_PATTERNS) {
        name = name.replace(pattern, '');
    }
    return name.trim();
}

// Enes Doğanay | 23 Mayıs 2026: Next.js generateMetadata — server-side <title> ve og:* tagları
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const firma = await fetchFirmaSSR(slug);
    if (!firma) return { title: 'Firma Bulunamadı' };

    // Enes Doğanay | 29 Mayıs 2026: shortName — hukuki ek olmadan kısa marka adı
    const shortName = getShortName(firma.firma_adi);
    const description = `${firma.firma_adi}${firma.category_name ? ' — ' + firma.category_name : ''}${firma.il_ilce ? ', ' + firma.il_ilce : ''}. Tedport'ta firma profilini inceleyin, teklif talebi gönderin.`;
    const logoUrl = firma.logo_url?.includes('firma-logolari') ? firma.logo_url : null;

    return {
        title: shortName,
        description,
        openGraph: {
            title: `${shortName} | Tedport`,
            description,
            url: `https://tedport.com/firmalar/${slug}`,
            ...(logoUrl ? { images: [{ url: logoUrl }] } : {}),
        },
    };
}

// Enes Doğanay | 23 Mayıs 2026: Server Component — firma verisini SSR olarak çek, Client Component'e geç
// Enes Doğanay | 23 Mayıs 2026: JSON-LD Organization schema — Google Knowledge Panel + rich results
function buildOrganizationJsonLd(firma, slug) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: firma.firma_adi,
        // Enes Doğanay | 29 Mayıs 2026: alternativeName — Google kısa marka adını öğrenir
        ...(getShortName(firma.firma_adi) !== firma.firma_adi ? { alternativeName: getShortName(firma.firma_adi) } : {}),
        url: `https://tedport.com/firmalar/${slug}`,
        ...(firma.description ? { description: firma.description } : {}),
        ...(firma.web_sitesi ? { sameAs: [firma.web_sitesi] } : {}),
        ...(firma.logo_url?.includes('firma-logolari') ? { logo: firma.logo_url } : {}),
        ...(firma.il_ilce ? { address: { '@type': 'PostalAddress', addressLocality: firma.il_ilce, addressCountry: 'TR' } } : {}),
        ...(firma.ana_sektor ? { knowsAbout: firma.ana_sektor } : {}),
    };
    // Enes Doğanay | 23 Mayıs 2026: </script> injection'ı önle
    return JSON.stringify(jsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
}

// Enes Doğanay | 29 Mayıs 2026: Breadcrumb JSON-LD — Google arama sonuçlarında yol gösterir
function buildBreadcrumbJsonLd(firma, slug) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://tedport.com' },
            { '@type': 'ListItem', position: 2, name: 'Firmalar', item: 'https://tedport.com/firmalar' },
            { '@type': 'ListItem', position: 3, name: getShortName(firma.firma_adi), item: `https://tedport.com/firmalar/${slug}` },
        ],
    };
    return JSON.stringify(jsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
}

export default async function FirmaDetayRoute({ params }) {
    const { slug } = await params;
    const initialFirma = await fetchFirmaSSR(slug);
    return (
        <>
            {initialFirma && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: buildOrganizationJsonLd(initialFirma, slug) }}
                />
            )}
            {initialFirma && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: buildBreadcrumbJsonLd(initialFirma, slug) }}
                />
            )}
            <FirmaDetayPage initialFirma={initialFirma} />
        </>
    );
}

// Enes Doğanay | 22 Mayıs 2026: Sektör Landing — Next.js App Router page
// Enes Doğanay | 23 Mayıs 2026: Server Component — slug'dan sektör adını çözerek generateMetadata üretir
import SektorLandingPage from '../../../../src/pages/SektorLanding/SektorLandingPage';
import { slugToSektor, getSektorDescription } from '../../../../src/pages/SektorLanding/utils/sektorSlugUtils';

// Enes Doğanay | 23 Mayıs 2026: generateMetadata — sektör adı + description slug'dan türetilir
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const sektorAdi = slugToSektor(slug);
    if (!sektorAdi) return { title: 'Sektör Bulunamadı' };
    const description = getSektorDescription(sektorAdi);
    return {
        title: sektorAdi,
        description,
        openGraph: {
            title: `${sektorAdi} İhaleleri | Tedport`,
            description,
            url: `https://tedport.com/ihaleler/sektor/${slug}`,
        },
    };
}

export default function SektorLandingRoute() {
    return <SektorLandingPage />;
}

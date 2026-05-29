// Enes Doğanay | 22 Mayıs 2026: Home — Next.js App Router ana sayfa
// Enes Doganay | 23 Mayis 2026: force-dynamic — useSearchParams ve auth gerektiren sayfalarda static prerender devre disi
export const dynamic = 'force-dynamic';
import HomePage from '../src/pages/Home/HomePage';

// Enes Doğanay | 29 Mayıs 2026: WebSite JSON-LD — Google Sitelinks + SearchAction için kritik
const WEBSITE_JSONLD = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Tedport',
    url: 'https://tedport.com',
    potentialAction: {
        '@type': 'SearchAction',
        target: 'https://tedport.com/firmalar?search={search_term_string}',
        'query-input': 'required name=search_term_string',
    },
}).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

// Enes Doğanay | 29 Mayıs 2026: Organization JSON-LD — marka otoritesi için
const ORGANIZATION_JSONLD = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Tedport',
    url: 'https://tedport.com',
    logo: 'https://tedport.com/tedport-logo.png',
    description: 'Doğru firmaları keşfedin, satınalma süreçlerinizi hızlandırın ve uzun vadeli çözüm ortaklıkları kurun.',
    sameAs: ['https://tedport.com'],
}).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

export default function HomeRoute() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: WEBSITE_JSONLD }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ORGANIZATION_JSONLD }} />
            <HomePage />
        </>
    );
}

// Enes Doğanay | 23 Mayıs 2026: Dinamik robots.txt — Next.js App Router robots() fonksiyonu
export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/firma-profil/',
                    '/profile/',
                    '/login/',
                    '/register/',
                    '/reset-password/',
                    '/email-degisikligi-onay/',
                    '/emailconfirmation/',
                    '/abonelik-iptal/',
                ],
            },
        ],
        sitemap: 'https://tedport.com/sitemap.xml',
    };
}

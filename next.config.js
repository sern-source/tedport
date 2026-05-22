// Enes Doğanay | 22 Mayıs 2026: Next.js 15 yapılandırması — SSR, Image optimizasyonu, Supabase storage
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Enes Doğanay | 23 Mayıs 2026: ESLint build sırasında çalıştırılmıyor — 102 pre-existing uyarı var, ayrı adımda düzeltilecek
    eslint: { ignoreDuringBuilds: true },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'gsdbutprqfnxjtppwwhn.supabase.co',
            },
        ],
    },
};

export default nextConfig;

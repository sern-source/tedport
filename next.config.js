// Enes Doğanay | 22 Mayıs 2026: Next.js 15 yapılandırması — SSR, Image optimizasyonu, Supabase storage
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
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

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' // Enes Doğanay | 16 Nisan 2026: PWA desteği

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Enes Doğanay | 16 Nisan 2026: PWA — manifest, service worker, offline desteği
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['tedport-logo-sade.jpg', 'tedport-logo.png', 'hero-bg.jpg'],
      manifest: {
        name: 'Tedport — B2B Tedarik Portalı',
        short_name: 'Tedport',
        description: "Türkiye'nin B2B tedarik portalı.",
        theme_color: '#1a56db',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/tedport-logo.png', sizes: '192x192', type: 'image/png' },
          { src: '/tedport-logo.png', sizes: '512x512', type: 'image/png' },
          { src: '/tedport-logo.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})

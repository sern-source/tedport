import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Enes Doğanay | 8 Mayıs 2026: PWA kaldırıldı — B2B platformda install prompt gereksiz
export default defineConfig({
  plugins: [
    react(),
  ],
})

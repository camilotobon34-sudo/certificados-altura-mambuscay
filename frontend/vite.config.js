import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Valores de docs/01-identidad-visual (sección 1.8) y docs/06-prototipo-figma.
const THEME_COLOR = '#0A3A4A'
const BACKGROUND_COLOR = '#F3F6F8'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon-32x32.png', 'logo-altura-mambuscay.png', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'CERTIFICADOS ALTURA MAMBUSCAY',
        short_name: 'Altura Mambuscay',
        description:
          'Gestión y verificación pública de certificados de formación en trabajo en alturas (Res. 4272 de 2021).',
        lang: 'es-CO',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        theme_color: THEME_COLOR,
        background_color: BACKGROUND_COLOR,
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Dependencias opcionales de jsPDF (doc.html) que la constancia no usa.
        globIgnores: ['**/html2canvas-*.js', '**/purify.es-*.js'],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': process.env.VITE_DEV_API_TARGET ?? 'http://localhost:4000',
    },
  },
})

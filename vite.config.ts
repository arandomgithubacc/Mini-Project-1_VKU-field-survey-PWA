import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      manifest: {
        name: 'VKU Facility Field Survey',
        short_name: 'VKU Survey',
        description: 'Offline-first PWA for campus facility inspections at VKU',
        theme_color: '#0284c7',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{html,css,js}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              ['document', 'style', 'script'].includes(request.destination),
            handler: 'CacheFirst',
            options: {
              cacheName: 'vku-survey-app-shell',
            },
          },
        ],
      },
    }),
  ],
})

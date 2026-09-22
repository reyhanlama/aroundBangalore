import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  optimizeDeps: { exclude: ['maplibre-gl'] },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['nadi-mark.svg'],
      manifest: {
        name: 'Nadi — Bengaluru Lake Field Guide',
        short_name: 'Nadi',
        description: 'A living field guide to Bengaluru’s lakes.',
        theme_color: '#1832e8',
        background_color: '#f5f5ef',
        display: 'standalone',
        start_url: '/',
        icons: [{ src: '/nadi-mark.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,svg,woff2,webp}'],
        navigateFallback: '/index.html',
        runtimeCaching: [{
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst',
          options: { cacheName: 'nadi-images', expiration: { maxEntries: 40, maxAgeSeconds: 2592000 } }
        }]
      }
    })
  ],
  test: { environment: 'jsdom', setupFiles: './src/test/setup.ts' },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: { output: { manualChunks: { maplibre: ['maplibre-gl'], vendor: ['react', 'react-dom', 'react-router-dom'], validation: ['zod'] } } }
  }
});

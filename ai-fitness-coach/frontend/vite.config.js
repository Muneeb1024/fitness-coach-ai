import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icons/favicon.png', 'icons/apple-touch-icon.png', 'icons/og-image.png'],
      manifest: {
        name: 'FitVision AI',
        short_name: 'FitVision',
        description: 'Autonomous fitness intelligence — AI coach, plans & tracking',
        theme_color: '#0B0C0E',
        background_color: '#0B0C0E',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // App shell: precached by the plugin; SPA navigations fall back to
        // index.html so offline/deep-link loads render the app.
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/socket\.io\//],
        runtimeCaching: [
          {
            // GET API responses (personal data) are cached NETWORK-FIRST so the
            // cache is always refreshed when online but still usable offline.
            // Auth, admin and subscription endpoints are deliberately excluded
            // via the negative lookahead, and mutations (POST/PUT/DELETE) never
            // match this GET-only handler — token-bearing responses are never
            // written to Cache Storage.
            urlPattern: /^\/api\/(?!auth\/|admin\/|subscription\/)/,
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'fitvision-api-get',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [200] }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true
      }
    }
  }
});

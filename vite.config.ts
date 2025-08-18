import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    base: "/novel-finder-pro/",
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          "robots.txt",
          "favicon.png",
          "apple-touch-icon.webp",
          "pwa-192x192.webp",
          "pwa-512x512.webp"
        ],
        manifest: {
          name: 'Novel Finder Pro',
          short_name: 'Novel Finder Pro',
          description: 'An advanced web application for searching, filtering, and sorting a collection of novels.',
          start_url: '/novel-finder-pro/',
          scope: '/novel-finder-pro/',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#111827',
          theme_color: '#4f46e5',
          icons: [
            {
              src: "/novel-finder-pro/pwa-192x192.webp",
              sizes: "192x192",
              type: "image/webp",
            },
            {
              src: "/novel-finder-pro/pwa-512x512.webp",
              sizes: "512x512",
              type: "image/webp",
            },
            {
              src: "/novel-finder-pro/pwa-512x512.webp",
              sizes: "512x512",
              type: "image/webp",
              purpose: "any maskable",
            },
          ]
        },
        workbox: {
          runtimeCaching: [
            {
              urlPattern: /\/novel-finder-pro\/data\/novels\.json$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'novels-cache',
                expiration: {
                  maxEntries: 1,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            }
          ]
        }
      })
    ]
  };
});

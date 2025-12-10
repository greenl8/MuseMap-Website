import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['resources/mindspacelogo.png'],
      manifest: {
        name: 'mind.space - Discography',
        short_name: 'mind.space',
        description: 'Explore the musical journey of mind.space',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/MuseMap-Website/',
        start_url: '/MuseMap-Website/',
        icons: [
          {
            src: 'resources/mindspacelogo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'resources/mindspacelogo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'resources/mindspacelogo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        categories: ['music', 'entertainment'],
      },
      workbox: {
        // Only cache essential files, not large images
        globPatterns: ['**/*.{js,css,html,ico,svg,woff,woff2}'],
        // Ignore large resource images for precaching
        globIgnores: ['resources/**/*.jpg', 'resources/**/*.jpeg', 'resources/**/*.png'],
        // Runtime caching for images - load on demand
        runtimeCaching: [
          {
            urlPattern: /\/resources\/.*\.(jpg|jpeg|png|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'album-images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/i\.ytimg\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'youtube-thumbnails',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  base: '/MuseMap-Website/',
  server: {
    port: 3000,
    strictPort: true,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  }
})

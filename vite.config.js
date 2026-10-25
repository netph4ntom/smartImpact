import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import latestHandler from './api/telemetry/latest.js'
import historyHandler from './api/telemetry/history.js'

/**
 * Vite Dev Plugin: Emulates Vercel Serverless Functions locally during `npm run dev`
 */
function localVercelApiDevPlugin() {
  return {
    name: 'local-vercel-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const createAdapterRes = () => ({
          setHeader: (k, v) => res.setHeader(k, v),
          status: (code) => {
            res.statusCode = code
            return {
              json: (data) => {
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(data))
              },
              end: () => res.end(),
            }
          },
        })

        if (req.url?.startsWith('/api/telemetry/latest')) {
          try {
            await latestHandler(req, createAdapterRes())
          } catch (e) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: e.message }))
          }
          return
        }

        if (req.url?.startsWith('/api/telemetry/history')) {
          try {
            await historyHandler(req, createAdapterRes())
          } catch (e) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: e.message }))
          }
          return
        }

        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load server-side environment variables (.env, .env.local)
  const env = loadEnv(mode, process.cwd(), '')
  if (env.BLYNK_AUTH_TOKEN) process.env.BLYNK_AUTH_TOKEN = env.BLYNK_AUTH_TOKEN
  if (env.BLYNK_SERVER) process.env.BLYNK_SERVER = env.BLYNK_SERVER
  if (env.DEVICE_NAME) process.env.DEVICE_NAME = env.DEVICE_NAME
  if (env.DEVICE_ID) process.env.DEVICE_ID = env.DEVICE_ID
  if (env.DEVICE_LOCATION) process.env.DEVICE_LOCATION = env.DEVICE_LOCATION

  return {
    plugins: [
      react(),
      localVercelApiDevPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: [
          'favicon.svg',
          'apple-touch-icon.png',
          'maskable-icon-512x512.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
        ],
        manifest: {
          name: 'smartImpact — IoT Water Quality Monitoring',
          short_name: 'smartImpact',
          description: 'Antarmuka pemantauan kualitas air real-time berbasis ESP32 dan Blynk Cloud.',
          lang: 'id',
          theme_color: '#123B45',
          background_color: '#F5F8FA',
          display: 'standalone',
          orientation: 'portrait-primary',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
          // AGENT.md: Jangan cache response sensitif atau data telemetri pribadi secara sembarangan
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'google-fonts-stylesheets',
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
  }
})

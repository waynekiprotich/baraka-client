import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const API_TARGET = 'http://localhost:8000'

/**
 * Injects a `<link rel="preconnect">` for the API origin when VITE_API_URL points at a
 * different origin than the site itself. The origin is only known at build time (it is an
 * env var), so it cannot live as a literal in index.html.
 */
function preconnectApiOrigin(env) {
  return {
    name: 'baraka-preconnect-api-origin',
    transformIndexHtml(html) {
      const raw = env.VITE_API_URL
      if (!raw || !/^https?:\/\//i.test(raw)) return html
      const origin = new URL(raw).origin
      return {
        html,
        tags: [
          {
            tag: 'link',
            attrs: { rel: 'preconnect', href: origin, crossorigin: '' },
            injectTo: 'head-prepend',
          },
        ],
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss(), preconnectApiOrigin(env)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': { target: API_TARGET, changeOrigin: true },
        '/uploads': { target: API_TARGET, changeOrigin: true },
      },
    },
    build: {
      target: 'es2022',
      sourcemap: false,
      chunkSizeWarningLimit: 700,
    },
  }
})

import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

function siteUrlHtmlPlugin(siteUrl: string): Plugin {
  return {
    name: 'classcade-site-url',
    transformIndexHtml(html) {
      return html.replaceAll('__SITE_URL__', siteUrl)
    },
  }
}

function normalizeBasePath(basePath: string): string {
  const trimmed = basePath.trim()

  if (!trimmed || trimmed === '/') {
    return '/'
  }

  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const siteUrl = (process.env.VITE_SITE_URL ?? env.VITE_SITE_URL ?? 'http://localhost:5173').replace(/\/+$/, '')
  const base = normalizeBasePath(process.env.VITE_BASE_PATH ?? env.VITE_BASE_PATH ?? '/')

  return {
    base,
    plugins: [react(), siteUrlHtmlPlugin(siteUrl)],
    server: {
      watch: {
        // Windows briefly locks freshly-saved/downloaded PNGs; native fs.watch() throws EBUSY on them
        // and crashes the whole dev server. Polling avoids touching the file while it's still being written.
        usePolling: true,
        interval: 300,
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/testSetup.ts'],
    },
  }
})

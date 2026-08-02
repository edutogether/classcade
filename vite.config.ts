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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const siteUrl = (process.env.VITE_SITE_URL ?? env.VITE_SITE_URL ?? 'http://localhost:5173').replace(/\/+$/, '')

  return {
    base: '/',
    plugins: [react(), siteUrlHtmlPlugin(siteUrl)],
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    allowedHosts: ['act-diagnosis-incidents-chem.trycloudflare.com'],
    proxy: {
      // Forward /api/* unchanged — the backend serves routes under /api/* so
      // local dev matches production (Vercel Services routes /api/* to the
      // backend without rewriting the path).
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
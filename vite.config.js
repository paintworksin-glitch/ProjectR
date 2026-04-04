import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Binds on all interfaces so Cursor Simple Browser / Ports can reach the dev server.
  // Vite 5+ rejects unknown Host headers (403). Port-forward / preview tabs often send a
  // non-localhost Host; allowedHosts: true restores access in dev only.
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    open: true,
    allowedHosts: true,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: false,
    allowedHosts: true,
  },
})

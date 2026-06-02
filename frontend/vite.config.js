import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:8080'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    host: true,
    allowedHosts: [
      'static4j.app',
      'www.static4j.app'
    ],
    watch: {
      usePolling: true,
      interval: 1000,
    },
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false
      }
    }
  }
})

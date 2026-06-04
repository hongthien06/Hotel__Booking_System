import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:8080'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
      'es-toolkit/compat/get': path.resolve(__dirname, './src/shims/es-toolkit/compat/get.js'),
      'es-toolkit/compat/uniqBy': path.resolve(__dirname, './src/shims/es-toolkit/compat/uniqBy.js'),
      'es-toolkit/compat/sortBy': path.resolve(__dirname, './src/shims/es-toolkit/compat/sortBy.js'),
      'es-toolkit/compat/isPlainObject': path.resolve(__dirname, './src/shims/es-toolkit/compat/isPlainObject.js'),
      'es-toolkit/compat/range': path.resolve(__dirname, './src/shims/es-toolkit/compat/range.js'),
      'es-toolkit/compat/last': path.resolve(__dirname, './src/shims/es-toolkit/compat/last.js'),
      'es-toolkit/compat/maxBy': path.resolve(__dirname, './src/shims/es-toolkit/compat/maxBy.js'),
      'es-toolkit/compat/minBy': path.resolve(__dirname, './src/shims/es-toolkit/compat/minBy.js'),
      'es-toolkit/compat/omit': path.resolve(__dirname, './src/shims/es-toolkit/compat/omit.js'),
      'es-toolkit/compat/sumBy': path.resolve(__dirname, './src/shims/es-toolkit/compat/sumBy.js'),
      'es-toolkit/compat/throttle': path.resolve(__dirname, './src/shims/es-toolkit/compat/throttle.js'),
      'es-toolkit/compat/isUnsafeProperty': path.resolve(__dirname, './src/shims/es-toolkit/compat/isUnsafeProperty.js')
    }
  },
  optimizeDeps: {
    include: ['recharts']
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

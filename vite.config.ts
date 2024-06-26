import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/app',
  build: {
    outDir: 'dist'
  },
  server: {
    host: true, 
    port: 5173
  },
  plugins: [preact()],
  esbuild: {
    supported: {
      'top-level-await': true
    },
  },
})

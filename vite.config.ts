import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist'
  },
  server: {
    port: 8080
  },
  plugins: [preact()],
  esbuild: {
    supported: {
      'top-level-await': true
    },
  },
})

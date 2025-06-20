import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { readFileSync } from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/app',
  build: {
    outDir: 'dist'
  },
  server: {
    https: {
      //key: readFileSync('./selfsigned.key'),
      //cert: readFileSync('./selfsigned.crt')
      key: readFileSync('./SSA_certificate/server.key'),
      cert: readFileSync('./SSA_certificate/server.crt')
    },
    host: true, 
    port: 5137,
    //proxy: {}
  },
  plugins: [preact()],
  esbuild: {
    supported: {
      'top-level-await': true
    },
  },
})

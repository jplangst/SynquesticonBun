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
    //https: {
      //key: readFileSync('./selfsigned.key'),
      //cert: readFileSync('./selfsigned.crt')
      //key: readFileSync('./privkey.pem'),
      //cert: readFileSync('./cert.pem')
    //},
    host: true, 
    port: 5138,
    //proxy: {}
  },
  plugins: [preact()],
  esbuild: {
    supported: {
      'top-level-await': true
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/rest': 'http://localhost:8080',
      '/uploads': 'http://localhost:8080'
    }
  },
  build: {
    outDir: '../backend/src/main/resources/static',
    emptyOutDir: false
  }
})

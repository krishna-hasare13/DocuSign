import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.js.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Ensures the output directory matches your Vercel settings
    outDir: 'dist',
    // Generates source maps for easier debugging in production if needed
    sourcemap: true,
    // Helps with large dependency chunks
    chunkSizeWarningLimit: 1000,
  },
  server: {
    // Useful for local development to match your backend port expectations
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
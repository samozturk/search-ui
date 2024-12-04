import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // Needed for docker/container environments
    strictPort: true,
    port: 5173, // Your desired port
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Your API server
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'ws://localhost:8000', // Your WebSocket server
        ws: true,
      }
    },
  },
  preview: {
    port: 5173,
    host: true,
    strictPort: true,
  }
})

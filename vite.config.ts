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
    hmr: {
      overlay: false // Disables the error overlay
    },
    proxy: {
      '/api': {
        target: 'http://samozturk.online:8000',  // Update this to your actual API endpoint
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
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

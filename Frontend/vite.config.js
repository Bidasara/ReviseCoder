import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  darkMode: 'class',
  plugins: [react(),tailwindcss()],
  server: {
    proxy: {
      '/api/v1': 'http://localhost:8080', // Proxy API requests to backend
    },
  },
})


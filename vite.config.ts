import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "https://parking-backend-t2sv.onrender.com", // Proxy API requests to Django backend
    },
  },
})

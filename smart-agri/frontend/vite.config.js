import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Proxy /api calls to backend during development
    // Note: only used if VITE_BACKEND_URL is not set (relative /api calls)
    proxy: {
      '/api': {
        target:       'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});

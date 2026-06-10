import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' makes the production build portable — the dist folder can be
// dropped onto any static host (or a sub-path) without extra configuration.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    chunkSizeWarningLimit: 1200, // three.js is large; this silences a harmless warning
  },
});

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Dev-only fix: static hosts resolve a directory URL like /mw2/ to its
 * index.html, but Vite's dev server serves public/ files by exact path and
 * otherwise falls back to the SPA's index. This middleware mirrors the
 * static-host behaviour so standalone pages in public/ work in `npm run dev`.
 * @returns {import('vite').Plugin}
 */
function publicDirIndexes() {
  return {
    name: 'public-dir-indexes',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const path = (req.url ?? '').split('?')[0];
        if (
          path.endsWith('/') &&
          path !== '/' &&
          existsSync(join(server.config.publicDir, path, 'index.html'))
        ) {
          req.url = `${path}index.html`;
        }
        next();
      });
    },
  };
}

// base: './' makes the production build portable — the dist folder can be
// dropped onto any static host (or a sub-path) without extra configuration.
export default defineConfig({
  plugins: [react(), publicDirIndexes()],
  base: './',
  build: {
    chunkSizeWarningLimit: 1200, // three.js is large; this silences a harmless warning
  },
});

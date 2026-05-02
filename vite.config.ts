import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Vite plugin: copy built index.html to 200.html for Surge.sh SPA fallback
const surgeSpaFallback = (): Plugin => ({
  name: 'surge-spa-fallback',
  apply: 'build',
  closeBundle() {
    const distDir = path.resolve(__dirname, 'dist');
    const indexPath = path.join(distDir, 'index.html');
    const fallbackPath = path.join(distDir, '200.html');
    if (fs.existsSync(indexPath)) {
      fs.copyFileSync(indexPath, fallbackPath);
      console.log('Copied dist/index.html -> dist/200.html (Surge.sh SPA fallback)');
    }
  }
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), surgeSpaFallback()],
    define: {

    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});

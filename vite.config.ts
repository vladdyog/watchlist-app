import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

import packageJson from './package.json';

export default defineConfig(({ mode }) => {
  // Load all env vars (empty string prefix = no filtering, so TMDB_TOKEN is included)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: process.env.VERCEL ? '/' : '/cuemovie/',
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageJson.version),
    },
    server: {
      proxy: {
        '/api/tmdbFunction': {
          target: 'https://api.themoviedb.org/3',
          changeOrigin: true,
          rewrite: (path) => {
            const url = new URL(path, 'http://localhost');
            const tmdbPath = url.searchParams.get('path') ?? '';
            url.searchParams.delete('path');
            return `${tmdbPath}?${url.searchParams}`;
          },
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `Bearer ${env.TMDB_TOKEN}`);
            });
          },
        },
        '/api/feedbackFunction': {
          target: env.FEEDBACK_ENDPOINT,
          changeOrigin: true,
          rewrite: () => '',
        },
      },
    },
  };
});

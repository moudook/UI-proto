import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Defines the Vite configuration for the application
 * Sets up the build environment, server settings, and plugin configuration
 * This configuration is specifically tailored for Electron compatibility
 */
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: './', // Use relative paths for Electron compatibility
      server: {
        port: 3001,
        strictPort: true, // Don't try other ports if 3000 is in use
        host: '0.0.0.0',
        open: false,
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        emptyOutDir: true,
      }
    };
});

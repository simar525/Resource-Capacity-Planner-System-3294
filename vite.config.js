import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons: ['react-icons'],
          charts: ['echarts', 'echarts-for-react'],
          microsoft: ['@azure/msal-browser', '@azure/msal-react', 'microsoft-graph-client']
        }
      }
    }
  },
  define: {
    global: 'globalThis'
  },
  optimizeDeps: {
    include: [
      '@azure/msal-browser',
      '@azure/msal-react', 
      'microsoft-graph-client',
      'isomorphic-fetch'
    ]
  }
});
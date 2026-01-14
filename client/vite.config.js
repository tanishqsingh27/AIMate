import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Optimize build for faster loading
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false, // Disable sourcemaps in production for smaller bundle
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large dependencies into separate chunks for parallel loading
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['react-hot-toast'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
    target: 'esnext', // Use modern JS for smaller bundles
  },
  optimizeDeps: {
    // Pre-bundle these dependencies for faster cold starts
    include: ['react', 'react-dom', 'react-router-dom', 'axios', 'react-hot-toast', 'chart.js'],
  },
});


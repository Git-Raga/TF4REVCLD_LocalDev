import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    'process.env': {}
  },
  server: {
    hmr: {
      overlay: false
    },
    // Remove cache: false - this was causing issues
  },
  
  // CSS-specific configurations to fix loading issues
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      css: {
        charset: false
      }
    }
  },
  
  // Updated build configuration
  build: {
    cssCodeSplit: false, // Load all CSS together
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: undefined, // Prevent CSS splitting
      }
    }
  },
  
  // Updated optimizeDeps configuration
  optimizeDeps: {
    force: true,
    include: ['react', 'react-dom', 'react-router-dom'], // Pre-bundle critical deps
    exclude: ['@tailwindcss/vite'] // Don't pre-bundle Tailwind plugin
  },
  
  // Add esbuild configuration for faster processing
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})
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
    cache: false
  },
  // Add these new configurations
  optimizeDeps: {
    force: true  // Force dependency pre-bundling
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
})
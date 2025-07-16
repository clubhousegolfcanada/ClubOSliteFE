import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  root: '.',
  base: './',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor chunk
          vendor: ['./scripts/app.js', './scripts/config.js'],
          
          // UI components chunk
          ui: ['./components/UICcomponents.js'],
          
          // Forms chunk (lazy loaded)
          forms: ['./features/FormHandlers.js'],
          
          // LLM chunk
          llm: [
            './llm/llmDispatcher.js',
            './llm/responseParser.js',
            './llm/templateLoader.js'
          ]
        }
      }
    },
    
    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    // Enable source maps for debugging
    sourcemap: true,
    
    // Set chunk size warnings
    chunkSizeWarningLimit: 500,
    
    // CSS code splitting
    cssCodeSplit: true
  },
  
  // Optimization settings
  optimizeDeps: {
    include: [],
    exclude: []
  },
  
  plugins: [
    // Legacy browser support
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    }),
    
    // Bundle analyzer (only in analyze mode)
    process.env.NODE_ENV === 'analyze' && visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true
    })
  ].filter(Boolean),
  
  // Dev server configuration
  server: {
    port: 8000,
    open: true,
    cors: true
  },
  
  // Preview server configuration
  preview: {
    port: 8080,
    open: true
  }
});

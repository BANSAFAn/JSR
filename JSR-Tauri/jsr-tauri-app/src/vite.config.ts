import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;
const isProduction = process.env.NODE_ENV === 'production';

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  // Resolve paths and aliases
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@styles': resolve(__dirname, './src/styles'),
      '@assets': resolve(__dirname, './src/assets')
    }
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'i18next', 'react-i18next'],
    exclude: [],
    esbuildOptions: {
      target: 'es2020',
      supported: { bigint: true }
    }
  },
  
  // Enable esbuild transformation for all files
  esbuild: {
    target: 'es2020',
    legalComments: 'none',
    // Optimize build performance
    treeShaking: true,
    minifyIdentifiers: isProduction,
    minifySyntax: isProduction,
    minifyWhitespace: isProduction
  },
  plugins: [
    // Optimize React plugin with fast refresh
    react({
      fastRefresh: true,
      // Use production optimizations when building for production
      jsxRuntime: 'automatic',
      // Only include React imports where actually used
      jsxImportSource: 'react',
      // Optimize build performance
      babel: {
        // Only use compact mode in production
        compact: isProduction
      }
    }),
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
          // Improve HMR performance
          overlay: true,
          timeout: 30000
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**", "**/node_modules/**"],
      usePolling: false
    },
    // Optimize server performance
    fs: {
      strict: true,
      allow: ["../public"]
    },
    // Improve startup time
    warmup: {
      clientFiles: ["./src/main.tsx"]
    }
  },
  // Optimization settings for production build
  build: {
    // Target modern browsers for smaller bundle size
    target: 'es2020',
    // Minify output with advanced options
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console logs in production
        drop_console: true,
        // Remove debugger statements in production
        drop_debugger: true,
        // Additional optimizations
        passes: 2,
        pure_getters: true,
        unsafe: true,
        unsafe_arrows: true,
        unsafe_comps: true,
        unsafe_methods: true
      },
      mangle: {
        properties: false
      },
      format: {
        comments: false
      }
    },
    // Reduce chunk size with optimized chunking strategy
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          i18n: ['i18next', 'react-i18next'],
          vendor: ['serde', '@tauri-apps/api']
        },
        // Optimize chunk naming and caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      },
      // Optimize dependencies
      external: [],
      // Reduce bundle size by removing unnecessary code
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false
      }
    },
    // Enable source maps only in development
    sourcemap: process.env.NODE_ENV !== 'production',
    // Reduce asset inlining size limit
    assetsInlineLimit: 4096,
    // Improve CSS handling
    cssCodeSplit: true,
    cssMinify: true,
    // Improve build reporting
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000
  },
}));

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production Vite configuration with security headers
export default defineConfig({
  plugins: [react()],
  build: {
    // Enable modern browser features
    target: 'es2020',
    
    // Generate source maps for production debugging (consider removing for final)
    sourcemap: false,
    
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          animations: ['framer-motion'],
          icons: ['lucide-react']
        }
      }
    },
    
    // Minify output
    minify: 'terser',
    
    // Set chunk size warning limit
    chunkSizeWarningLimit: 1000
  },
  
  // Security headers configuration
  preview: {
    headers: {
      // Content Security Policy
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self' https:; connect-src 'self' https: wss:; font-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none';",
      
      // HSTS
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      
      // XSS Protection
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      
      // Additional security
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      
      // Cache control
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  }
})

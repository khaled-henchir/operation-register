/**
 * Vite Configuration
 *
 * This file configures the Vite build tool for the application.
 * It includes plugins and other build settings.
 */
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Enable more detailed build information
  build: {
    sourcemap: true,
    // Improve chunk size reporting
    reportCompressedSize: true,
  },
  // Configure server options
  server: {
    host: "127.0.0.1",
    port: 5173,
    open: true,
    // Add CORS headers for development
    cors: true,
  },
})


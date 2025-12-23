import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    define: {
        global: 'globalThis'
    },
    server: {
        port: 5173,
        host: true,
        // ✅ Remove proxy completely for now - we're using direct URLs
        // proxy: {}
    },
    build: {
        outDir: 'dist',
        sourcemap: true
    }
})

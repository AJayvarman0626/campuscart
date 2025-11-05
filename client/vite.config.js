import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Correct base for Render (or any subpath host)
export default defineConfig({
  plugins: [react()],
  base: '', // or '/' both work fine on Render
  build: {
    outDir: 'dist',
  },
})
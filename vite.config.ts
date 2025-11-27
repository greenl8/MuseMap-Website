import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/MuseMap-Website/', // Replace with your repo name
  server: {
    port: 3000,
    strictPort: true, // Fail if port is in use, to avoid jumping to unwanted ports
    host: true, // Expose to network
  }
})


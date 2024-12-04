import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/lonestar.anduril.com': {
        target: "https://lonestar.anduril.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lonestar.anduril.com/, ''),
      }
    }
  }
})

import { defineConfig, loadEnv, ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const proxy : Record<string, string | ProxyOptions> = {};
  proxy[`/${env.VITE_BASE_URL}`] = {
    target: `https://${env.VITE_BASE_URL}`,
    changeOrigin: true,
    rewrite: (path) => path.replace(`${env.VITE_BASE_URL}`, ''),
  }

  return {
    server: {
      proxy
    },
    plugins: [react()]
  }
})

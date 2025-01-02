import { defineConfig, loadEnv, ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const baseUrl = env.VITE_BASE_URL;

  const proxy : Record<string, string | ProxyOptions> = {};
  proxy[`/${baseUrl}`] = {
    target: `https://${baseUrl}`,
    changeOrigin: true,
    rewrite: (path) => path.replace(`${baseUrl}`, ''),
  }

  return {
    server: {
      proxy
    },
    plugins: [react()]
  }
})

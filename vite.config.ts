import { defineConfig, loadEnv, ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const baseUrl = env.LATTICE_URL;

  const proxy : Record<string, string | ProxyOptions> = {};
  proxy[`/${baseUrl}`] = {
    target: `https://${baseUrl}`,
    changeOrigin: true,
    rewrite: (path) => path.replace(`${baseUrl}`, ''),
  }

  return {
    // This app reads unprefixed LATTICE_* env vars (see src/config.ts). Vite
    // only exposes vars matching envPrefix to import.meta.env, and the default
    // is "VITE_", so we must widen it to include "LATTICE_".
    envPrefix: ['VITE_', 'LATTICE_'],
    server: {
      proxy
    },
    plugins: [react()]
  }
})

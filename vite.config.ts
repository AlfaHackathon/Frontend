import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    css: { postcss: {} },
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      proxy: {
        '/agent-service': {
          target: 'https://api.cheremha.ru',
          changeOrigin: true,
        },
        ...(env.VITE_GATEWAY_URL
          ? {
              '/api': {
                target: env.VITE_GATEWAY_URL,
                changeOrigin: true,
                rewrite: (path: string) => path.replace(/^\/api/, ''),
              },
            }
          : {}),
      },
    },
  }
})

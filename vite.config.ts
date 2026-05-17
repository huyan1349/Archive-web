import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/weread-api': {
        target: 'https://i.weread.qq.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/weread-api/, ''),
        headers: {
          Origin: 'https://weread.qq.com',
          Referer: 'https://weread.qq.com/',
        },
      },
    },
  },
})

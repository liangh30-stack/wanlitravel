import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// 安全说明：不要用 define 把任何 API key 注入前端代码 ——
// define 的值会原样打包进发给访客的 JS。所有密钥只放在服务端（server/）。
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    // 开发时把 /api 代理到本地 server（npm run server:dev）
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});

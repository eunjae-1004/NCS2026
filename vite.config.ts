import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 프로덕션 빌드 최적화
    minify: 'esbuild', // terser 대신 esbuild 사용 (더 빠르고 의존성 불필요)
    // 청크 크기 경고 임계값 설정
    chunkSizeWarningLimit: 1000,
  },
  // 개발 서버 설정
  server: {
    port: 5173,
    proxy: {
      // 개발 환경에서 API 요청 프록시
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})


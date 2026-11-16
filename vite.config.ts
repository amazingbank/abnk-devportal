import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// ABNK 端口规范（abnk-system/docs/port-allocation.md，与 abnk-website 6201 同段复刻）：
// ABNK 本地调试端口统一收敛到 6200-6299 段，避开 asdm 其他工作区。
// strictPort：端口被占直接报错，不自动漂移——冲突要暴露而不是静默换端口。
// ABNK port convention (mirrors abnk-website 6201, same 6200-6299 range):
// conflicts must fail loudly via strictPort, never silently drift to another port.
const devPort = Number(process.env.ABNK_DEVPORTAL_PORT) || 6203;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: devPort,
    strictPort: true,
  },
  preview: {
    port: devPort + 1,
    strictPort: true,
  },
});

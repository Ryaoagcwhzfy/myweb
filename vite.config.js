import { fileURLToPath } from 'node:url';
import { defineConfig, normalizePath } from 'vite';

const deliveryDirectory = normalizePath(fileURLToPath(new URL('./交付文件', import.meta.url)));

export default defineConfig({
  server: {
    watch: {
      // Polling avoids Windows EBUSY errors when image files are temporarily locked.
      usePolling: true,
      interval: 500,
      ignored: ['**/.tools/**', '**/.snapshots/**', `${deliveryDirectory}/**`],
    },
  },
});

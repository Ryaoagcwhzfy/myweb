import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    watch: {
      // Polling avoids Windows EBUSY errors when image files are temporarily locked.
      usePolling: true,
      interval: 500,
      ignored: ['**/.tools/**', '**/.snapshots/**', '**/交付文件/**'],
    },
  },
});

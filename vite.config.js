import { defineConfig } from 'vite'

export default defineConfig({
  // This must match your GitHub repository name exactly
  base: '/ReliefMesh/', 
  build: {
    outDir: 'docs',
  },
  server: {
    open: true,
  }
});


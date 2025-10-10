import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Fix dev console error: net::ERR_CONNECTION_REFUSED http://localhost:24678/
// Force Vite HMR client to use the same port as the web server (8090) so firewall/blocked default port 24678 is avoided.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8090,
    strictPort: true,
    hmr: {
      clientPort: 8090,
      port: 8090,
      protocol: 'ws',
      host: 'localhost',
    },
  },
});
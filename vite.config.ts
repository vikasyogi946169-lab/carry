import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          booking: path.resolve(__dirname, 'booking.html'),
          services: path.resolve(__dirname, 'services.html'),
          vehicles: path.resolve(__dirname, 'vehicles.html'),
          outstation: path.resolve(__dirname, 'outstation.html'),
          logistics: path.resolve(__dirname, 'logistics.html'),
          driver: path.resolve(__dirname, 'driver.html'),
          tracking: path.resolve(__dirname, 'tracking.html'),
          location: path.resolve(__dirname, 'location.html'),
          about: path.resolve(__dirname, 'about.html'),
          contact: path.resolve(__dirname, 'contact.html'),
          login: path.resolve(__dirname, 'login.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});


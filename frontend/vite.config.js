import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) return 'charts';
            if (id.includes('leaflet')) return 'maps';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('react') || id.includes('zustand') || id.includes('axios')) return 'vendor';
          }
        },
      },
    },
  },
});

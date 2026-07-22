import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "./",   // ← ВОТ ЭТА СТРОКА. Относительные пути вместо абсолютных.
  plugins: [
    react(),
    tailwindcss(),
  ],

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("firebase") || id.includes("@firebase")) {
              return "firebase";
            }
            if (
                id.includes("react") ||
                id.includes("react-dom") ||
                id.includes("react-router") ||
                id.includes("scheduler")
            ) {
              return "react-vendor";
            }
            return "vendor";
          }
        },
      },
    },
  },
});
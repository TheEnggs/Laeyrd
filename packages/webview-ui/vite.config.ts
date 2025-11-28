import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // root points to webview-ui itself
  root: path.resolve(__dirname),

  build: {
    outDir: path.resolve(__dirname, "../../dist/webview-ui"),
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"),
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../shared/src"),
    },
  },

  server: {
    port: 5173,
    strictPort: true,
    cors: {
      origin: "*", // or more strict if you want
      methods: ["GET", "HEAD", "OPTIONS"],
    },
  },

  plugins: [react(), tailwindcss()],
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Root points to webview-ui itself

  build: {
    emptyOutDir: true,
    outDir: path.resolve(__dirname, "../../dist/webview-ui"),
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"),
    },
    sourcemap: false,
  },

  plugins: [react({}), tailwindcss()],

  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../shared/src"),
      "@webview": path.resolve(__dirname, "src"),
    },
  },

  root: path.resolve(__dirname),

  server: {
    cors: {
      methods: ["GET", "HEAD", "OPTIONS"],
      origin: "*",
    },
    port: 5173,
    strictPort: true,
  },
});

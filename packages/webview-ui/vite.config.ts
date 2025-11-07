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
    sourcemap: true,
    rollupOptions: {
      input: path.resolve(__dirname, "src", "index.html"),
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
  },

  plugins: [react(), tailwindcss()],
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: "src/webview-ui",
  build: {
    outDir: path.resolve(__dirname, "dist/webview-ui"),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, "src/webview-ui/index.html"),
    },
  },
  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "src"),
      "@webview": path.resolve(__dirname, "src/webview-ui"),
      "@lib": path.resolve(__dirname, "src/lib"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  plugins: [react()],
});

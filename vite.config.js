import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [preact()],
  build: {
    assetsDir: ".",
    rollupOptions: {
      output: {
        dir: "dist",
      },
    },
  },
  server: {
    historyApiFallback: true,
  },
});

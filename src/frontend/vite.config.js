import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import environment from "vite-plugin-environment";

const ii_url =
  process.env.DFX_NETWORK === "local"
    ? `http://uqzsh-gqaaa-aaaaq-qaada-cai.localhost:8081/authorize`
    : `https://id.ai/authorize`;

process.env.II_URL = process.env.II_URL || ii_url;

export default defineConfig({
  logLevel: "error",
  define: {
    global: "globalThis",
  },
  build: {
    emptyOutDir: true,
    sourcemap: false,
    minify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const match = /\/i18n\/split\/[^/]+\/([^/]+)\.tsx?$/.exec(id);
          return match ? `i18n-${match[1]}` : undefined;
        },
      },
    },
  },
  css: {
    // The CSS minifier drops declarations it cannot parse (for example the
    // invalid `var(--spacing(8))` emitted for a shadcn utility) instead of
    // failing the build. Browsers ignore those declarations as well.
    lightningcss: { errorRecovery: true },
  },
  optimizeDeps: {
    rolldownOptions: {
      transform: { define: { global: "globalThis" } },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
    environment({
      II_URL: process.env.II_URL,
      II_CANISTER_ID: process.env.II_CANISTER_ID || (new URL(process.env.II_URL || "https://id.ai").hostname === "beta.id.ai" ? "fgte5-ciaaa-aaaad-aaatq-cai" : "rdmx6-jaaaa-aaaaa-aaadq-cai"),
    }),
    react(),
  ],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(new URL("../declarations", import.meta.url)),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
    dedupe: ["@icp-sdk/core"]
  },
});

import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

let devProxyServer = "http://localhost:8081";
if (process.env.DEV_PROXY_SERVER && process.env.DEV_PROXY_SERVER.length > 0) {
  console.log("Use devProxyServer from environment: ", process.env.DEV_PROXY_SERVER);
  devProxyServer = process.env.DEV_PROXY_SERVER;
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: "generateSW",
      registerType: "autoUpdate",
      injectRegister: null,
      manifest: {
        name: "Memos",
        short_name: "Memos",
        description: "A lightweight, self-hosted note-taking service.",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,woff,woff2,png,webp,svg,ico}"],
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api\//, /^\/memos\.api\.v1\//, /^\/file\//, /^\/healthz/],
        runtimeCaching: [
          { urlPattern: /^\/api\//, handler: "NetworkOnly" },
          { urlPattern: /^\/memos\.api\.v1\//, handler: "NetworkOnly" },
          { urlPattern: /^\/file\//, handler: "NetworkOnly" },
          {
            urlPattern: /\/assets\/.+\.(js|css|woff2?)$/,
            handler: "CacheFirst",
            options: { cacheName: "static-assets", expiration: { maxAgeSeconds: 30 * 24 * 3600 } },
          },
          {
            urlPattern: /\.(png|webp|svg|ico|jpg|jpeg|gif)$/,
            handler: "CacheFirst",
            options: { cacheName: "image-cache", expiration: { maxEntries: 60, maxAgeSeconds: 7 * 24 * 3600 } },
          },
        ],
      },
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 3001,
    proxy: {
      "^/api": {
        target: devProxyServer,
        xfwd: true,
      },
      "^/memos.api.v1": {
        target: devProxyServer,
        xfwd: true,
      },
      "^/file": {
        target: devProxyServer,
        xfwd: true,
      },
    },
  },
  resolve: {
    alias: {
      "@/": `${resolve(__dirname, "src")}/`,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "utils-vendor": ["dayjs", "lodash-es"],
          "mermaid-vendor": ["mermaid"],
          "leaflet-vendor": ["leaflet", "react-leaflet"],
        },
      },
    },
  },
});

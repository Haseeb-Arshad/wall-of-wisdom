import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico"],
      manifest: {
        name: "WisdomWall",
        short_name: "WisdomWall",
        description: "Sticky-wall flashcards with AI and SRS",
        theme_color: "#ffffff",
        background_color: "#faf7f2",
        display: "standalone",
        icons: [
          { src: "/favicon.ico", sizes: "32x32 48x48 64x64", type: "image/x-icon" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"]
      },
    }),
  ],
});

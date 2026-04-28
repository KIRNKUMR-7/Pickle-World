import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

// Pure client-side Vite build — no SSR, no TanStack Start, no Cloudflare Worker.
// This is what Vercel needs: a static SPA in dist/ that is served via rewrites.
export default defineConfig({
  plugins: [
    // 1. TanStack Router file-based routing (code-splitting only, no SSR)
    TanStackRouterVite({ autoCodeSplitting: true }),
    // 2. React fast-refresh
    react(),
    // 3. Tailwind v4 via Vite plugin
    tailwindcss(),
    // 4. tsconfig path aliases (@ -> src/)
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Single flat output — no client/server split.
    // Vercel's outputDirectory in vercel.json points here.
    outDir: "dist",
    emptyOutDir: true,
  },
});

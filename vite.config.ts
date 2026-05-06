import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import Razorpay from "razorpay";

function vercelApiMock() {
  return {
    name: 'vercel-api-mock',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === '/api/create-order' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk.toString(); });
          req.on('end', async () => {
            try {
              // Load env vars explicitly for the mock plugin
              const env = loadEnv(server.config.mode, process.cwd(), '');
              
              const { amount, currency = "INR", receipt } = JSON.parse(body);
              const razorpay = new Razorpay({
                key_id: env.RAZORPAY_KEY_ID,
                key_secret: env.RAZORPAY_KEY_SECRET,
              });
              const options = { amount: amount * 100, currency, receipt };
              const order = await razorpay.orders.create(options);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify(order));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        } else {
          next();
        }
      });
    }
  }
}

// Pure client-side Vite build — no SSR, no TanStack Start, no Cloudflare Worker.
// This is what Vercel needs: a static SPA in dist/ that is served via rewrites.
export default defineConfig({
  plugins: [
    vercelApiMock(),
    // 1. TanStack Router file-based routing (code-splitting only, no SSR)
    TanStackRouterVite({ autoCodeSplitting: false }),
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

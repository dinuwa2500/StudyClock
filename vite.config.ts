import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Maximum allowed payload size for local API dev proxy (100 KB)
const MAX_PAYLOAD_BYTES = 100 * 1024;

// Dev middleware to route /api/* directly to MongoDB serverless handlers during local dev
function apiDevPlugin(): Plugin {
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        // Parse JSON body with strict size limit to prevent memory exhaustion (DoS)
        let body: any = {};
        if (req.method === 'POST' || req.method === 'PUT') {
          const buffers = [];
          let totalBytes = 0;

          try {
            for await (const chunk of req) {
              totalBytes += chunk.length;
              if (totalBytes > MAX_PAYLOAD_BYTES) {
                res.statusCode = 413;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Payload Too Large: Exceeded 100KB limit.' }));
                return;
              }
              buffers.push(chunk);
            }
          } catch (streamErr) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Stream read failure.' }));
            return;
          }

          const raw = Buffer.concat(buffers).toString('utf-8');
          if (raw) {
            try {
              body = JSON.parse(raw);
            } catch {
              body = raw;
            }
          }
        }
        (req as any).body = body;

        // Parse query params safely
        const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        (req as any).query = Object.fromEntries(urlObj.searchParams.entries());

        // Simple res.status and res.json helpers
        (res as any).status = (code: number) => {
          res.statusCode = code;
          return res;
        };
        (res as any).json = (data: any) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return res;
        };

        try {
          if (urlObj.pathname.startsWith('/api/auth')) {
            const { default: handler } = await import('./api/auth.ts');
            return handler(req, res);
          }
          if (urlObj.pathname.startsWith('/api/sessions')) {
            const { default: handler } = await import('./api/sessions.ts');
            return handler(req, res);
          }
          if (urlObj.pathname.startsWith('/api/subjects')) {
            const { default: handler } = await import('./api/subjects.ts');
            return handler(req, res);
          }
          if (urlObj.pathname.startsWith('/api/goals')) {
            const { default: handler } = await import('./api/goals.ts');
            return handler(req, res);
          }
        } catch (err: any) {
          console.error('API Dev Middleware Error:', err);
          (res as any).status(500).json({ error: 'Internal server error in dev proxy.' });
          return;
        }

        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiDevPlugin()],
  server: {
    port: 3000,
    open: false,
    host: 'localhost' // Restrict to localhost to prevent local network exposure
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          icons: ['lucide-react']
        }
      }
    }
  }
})

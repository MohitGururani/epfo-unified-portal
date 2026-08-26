import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { gatewayRouter } from './server/gateway.js';
import { startClaimWorker } from './server/workers/claimWorker.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Permissive CORS Middleware for Vercel / External Callers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
  
  // JSON & URL-encoded body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Mount Unified API Gateway FIRST at /api
  app.use('/api', gatewayRouter);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'EPFO-2.0-Unified-Gateway', timestamp: new Date().toISOString() });
  });

  // Start background asynchronous Claim Worker (RabbitMQ consumer)
  startClaimWorker();

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EPFO 2.0] Unified API Gateway & Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

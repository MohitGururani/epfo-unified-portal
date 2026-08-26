import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { gatewayRouter } from './server/gateway.js';
import { startClaimWorker } from './server/workers/claimWorker.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

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

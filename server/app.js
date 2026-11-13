import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { apiRouter } from './routes/api.js';
import { SearchEngine } from './engines/daa/SearchEngine.js';

export function createApp(searchEngine = new SearchEngine()) {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.clientOrigin }));
  app.use(express.json({ limit: '1mb' }));
  app.use(rateLimit({ windowMs: 60_000, limit: 120 }));
  app.get('/api/health', (req, res) => res.json({ success: true, data: { service: 'ucisp', status: 'ok' } }));
  app.use('/api', apiRouter(searchEngine));
  app.use((error, req, res, next) => {
    console.error(error);
    if (res.headersSent) return next(error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  });
  return app;
}

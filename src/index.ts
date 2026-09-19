import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { config } from './config';
import { initDatabase } from './database';
import eventRoutes from './routes/eventRoutes';
import feedbackRoutes from './routes/feedbackRoutes';

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (_req, res) => {
  res.json({
    service: 'Moje Podworko Events API',
    version: '1.0.0',
    status: 'ok',
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Trasy API
app.use('/api/event', eventRoutes);
app.use('/api/feedback', feedbackRoutes);

async function bootstrap(): Promise<void> {
  await initDatabase();

  app.listen(config.port, () => {
    console.log('[Server] Moje Podworko Events API dziala na http://localhost:' + config.port);
    console.log('[Server] Tryb: ' + (config.debug ? 'DEVELOPMENT' : 'PRODUCTION'));
  });
}

bootstrap().catch((err) => {
  console.error('[Bootstrap] Blad krytyczny:', err);
  process.exit(1);
});


import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import { initFirebase } from './firebase.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import gymsRouter from './routes/gyms.js';
import reviewsRouter from './routes/reviews.js';

initFirebase();

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: config.clientOrigin,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.use(healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/gyms', gymsRouter);
  app.use('/api/reviews', reviewsRouter);

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

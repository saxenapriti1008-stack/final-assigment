import { Router } from 'express';
import { query } from '../db/pool.js';

const router = Router();

router.get('/health', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'degraded', database: 'disconnected' });
  }
});

export default router;

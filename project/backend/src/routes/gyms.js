import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT g.*,
        COALESCE(AVG(r.rating), 0)::numeric(3,2) AS avg_rating,
        COUNT(r.id)::int AS review_count
       FROM gyms g
       LEFT JOIN reviews r ON r.gym_id = g.id
       GROUP BY g.id
       ORDER BY g.created_at DESC`,
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM gyms WHERE id = $1', [
      req.params.id,
    ]);
    if (!rows[0]) return res.status(404).json({ error: 'Gym not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  const { name, address } = req.body;
  if (!name?.trim() || !address?.trim()) {
    return res.status(400).json({ error: 'name and address are required' });
  }
  try {
    const { rows } = await query(
      `INSERT INTO gyms (name, address, created_by)
       VALUES ($1, $2, $3) RETURNING *`,
      [name.trim(), address.trim(), req.user.uid],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query(
      'DELETE FROM gyms WHERE id = $1 AND created_by = $2 RETURNING id',
      [req.params.id, req.user.uid],
    );
    if (!rows[0]) {
      return res.status(404).json({ error: 'Gym not found or not authorized' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;

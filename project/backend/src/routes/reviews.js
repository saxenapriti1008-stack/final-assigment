import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/gym/:gymId', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT * FROM reviews WHERE gym_id = $1 ORDER BY created_at DESC`,
      [req.params.gymId],
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/gym/:gymId', requireAuth, async (req, res, next) => {
  const rating = Number(req.body.rating);
  const comment = req.body.comment?.trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'rating must be 1–5' });
  }
  if (!comment) {
    return res.status(400).json({ error: 'comment is required' });
  }
  try {
    const gym = await query('SELECT id FROM gyms WHERE id = $1', [
      req.params.gymId,
    ]);
    if (!gym.rows[0]) return res.status(404).json({ error: 'Gym not found' });

    const { rows } = await query(
      `INSERT INTO reviews (gym_id, user_id, user_email, rating, comment)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        req.params.gymId,
        req.user.uid,
        req.user.email || null,
        rating,
        comment,
      ],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query(
      'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.uid],
    );
    if (!rows[0]) {
      return res
        .status(404)
        .json({ error: 'Review not found or not authorized' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;

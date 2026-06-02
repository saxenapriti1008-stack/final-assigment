import { Router } from 'express';
import { config } from '../config.js';
import { getAuth } from '../firebase.js';
import { cookieOptions, requireAuth } from '../middleware/auth.js';

const router = Router();
const SESSION_EXPIRES_MS = 5 * 24 * 60 * 60 * 1000;

router.post('/session', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: 'idToken is required' });
  }

  if (config.testMode) {
    res.cookie(config.cookieName, 'test-session', cookieOptions());
    return res.json({ ok: true, email: 'test@example.com' });
  }

  const auth = getAuth();
  if (!auth) {
    return res.status(503).json({ error: 'Auth service unavailable' });
  }

  try {
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_MS,
    });
    res.cookie(config.cookieName, sessionCookie, cookieOptions());
    const decoded = await auth.verifyIdToken(idToken);
    res.json({ ok: true, email: decoded.email });
  } catch (err) {
    console.error('Session creation failed:', err.message);
    res.status(401).json({ error: 'Invalid token' });
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie(config.cookieName, cookieOptions());
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ uid: req.user.uid, email: req.user.email });
});

export default router;

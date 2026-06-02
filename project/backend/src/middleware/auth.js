import { config } from '../config.js';
import { getAuth } from '../firebase.js';

const TEST_USER = { uid: 'test-user-uid', email: 'test@example.com' };

export async function requireAuth(req, res, next) {
  if (config.testMode) {
    req.user = TEST_USER;
    return next();
  }

  const sessionCookie = req.cookies?.[config.cookieName];
  if (!sessionCookie) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const auth = getAuth();
  if (!auth) {
    return res.status(503).json({ error: 'Auth service unavailable' });
  }

  try {
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    req.user = { uid: decoded.uid, email: decoded.email };
    next();
  } catch {
    res.clearCookie(config.cookieName, cookieOptions());
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: config.cookieSecure ? 'none' : 'lax',
    maxAge: 5 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

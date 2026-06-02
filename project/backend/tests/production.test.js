import { describe, it, expect } from 'vitest';
import request from 'supertest';
import './setup.js';
import { createApp } from '../src/app.js';
import { config } from '../src/config.js';

const app = createApp();

describe('Production-like behavior', () => {
  it('sets Access-Control-Allow-Origin to configured frontend URL (not wildcard)', async () => {
    const res = await request(app)
      .options('/api/gyms')
      .set('Origin', config.clientOrigin)
      .set('Access-Control-Request-Method', 'GET');

    expect(res.headers['access-control-allow-origin']).toBe(config.clientOrigin);
    expect(res.headers['access-control-allow-origin']).not.toBe('*');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('session endpoint sets httpOnly cookie (production auth pattern)', async () => {
    const res = await request(app)
      .post('/api/auth/session')
      .send({ idToken: 'test-token' });

    expect(res.status).toBe(200);
    const setCookie = res.headers['set-cookie']?.join(' ') || '';
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).not.toMatch(/localStorage/i);
  });
});

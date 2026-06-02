import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import './setup.js';
import { createApp } from '../src/app.js';
import { pool } from '../src/db/pool.js';
import { query } from '../src/db/pool.js';

const app = createApp();
let sessionCookie = '';

beforeAll(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS gyms (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address VARCHAR(500) NOT NULL,
      created_by VARCHAR(128) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      gym_id INTEGER NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
      user_id VARCHAR(128) NOT NULL,
      user_email VARCHAR(255),
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await query('DELETE FROM reviews');
  await query('DELETE FROM gyms');

  const login = await request(app)
    .post('/api/auth/session')
    .send({ idToken: 'fake-for-test' });
  sessionCookie = login.headers['set-cookie']?.[0]?.split(';')[0] || '';
});

afterAll(async () => {
  await pool.end();
});

describe('Gym Review API', () => {
  it('GET /health returns ok when database is connected', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('rejects unauthenticated gym creation', async () => {
    const res = await request(app)
      .post('/api/gyms')
      .send({ name: 'Test Gym', address: '123 St' });
    expect(res.status).toBe(401);
  });

  it('creates a gym when authenticated', async () => {
    const res = await request(app)
      .post('/api/gyms')
      .set('Cookie', sessionCookie)
      .send({ name: 'Iron Paradise', address: '42 Muscle Lane' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Iron Paradise');
  });

  it('lists gyms publicly', async () => {
    const res = await request(app).get('/api/gyms');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/auth/me returns user when session cookie is set', async () => {
    const res = await request(app).get('/api/auth/me').set('Cookie', sessionCookie);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@example.com');
  });
});

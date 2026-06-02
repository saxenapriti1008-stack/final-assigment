import { pool } from './pool.js';

const sql = `
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

CREATE INDEX IF NOT EXISTS idx_reviews_gym_id ON reviews(gym_id);
`;

async function migrate() {
  await pool.query(sql);
  console.log('Database migration completed.');
  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

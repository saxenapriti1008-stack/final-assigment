import { createApp } from './app.js';
import { config } from './config.js';
import { pool } from './db/pool.js';

const app = createApp();

async function start() {
  try {
    await pool.query('SELECT 1');
    app.listen(config.port, () => {
      console.log(`API listening on port ${config.port}`);
    });
  } catch (err) {
    console.error('Failed to start — is PostgreSQL running?', err.message);
    process.exit(1);
  }
}

start();

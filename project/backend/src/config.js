import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://gymuser:gympass@localhost:5432/gymreviews',
  cookieName: process.env.SESSION_COOKIE_NAME || '__session',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  testMode: process.env.TEST_MODE === 'true',
  firebaseServiceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '',
};

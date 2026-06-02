import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import { config } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let initialized = false;

function resolveCredentialPath() {
  const p = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!p || path.isAbsolute(p)) return;
  process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(
    __dirname,
    '..',
    p,
  );
}

function hasCredentials() {
  return !!(
    config.firebaseServiceAccountJson ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  );
}

export function initFirebase() {
  if (initialized || config.testMode) {
    if (config.testMode) initialized = true;
    return config.testMode ? null : admin;
  }
  if (!hasCredentials()) {
    console.warn(
      'Firebase Admin not configured — set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON.',
    );
    return null;
  }

  resolveCredentialPath();

  if (config.firebaseServiceAccountJson) {
    const serviceAccount = JSON.parse(config.firebaseServiceAccountJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
  initialized = true;
  return admin;
}

export function getAuth() {
  initFirebase();
  return initialized && !config.testMode ? admin.auth() : null;
}

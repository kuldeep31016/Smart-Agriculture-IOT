/**
 * firebase.js — Firebase Admin SDK Initialization
 *
 * Cloud layer of the IoT → Cloud → AI pipeline.
 * Connects to Firebase Firestore for persistent sensor data storage.
 *
 * // Replace with your Firebase service account config
 *
 * Setup steps:
 *   1. Go to Firebase Console → Project Settings → Service Accounts
 *   2. Click "Generate new private key" → download serviceAccountKey.json
 *   3. Place serviceAccountKey.json in this backend/ folder, OR
 *      set FIREBASE_CONFIG env var with the JSON content
 */

const admin = require('firebase-admin');

let db = null;

try {
  let credential;

  if (process.env.FIREBASE_CONFIG) {
    // Option 1: Load credentials from environment variable (recommended for production)
    const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
    credential = admin.credential.cert(serviceAccount);
    console.log('🔑 Firebase: loading credentials from FIREBASE_CONFIG env var');
  } else {
    // Option 2: Load from local serviceAccountKey.json file
    const serviceAccount = require('./serviceAccountKey.json');
    credential = admin.credential.cert(serviceAccount);
    console.log('🔑 Firebase: loading credentials from serviceAccountKey.json');
  }

  if (!admin.apps.length) {
    admin.initializeApp({ credential });
  }

  db = admin.firestore();

  // Firestore settings
  db.settings({ ignoreUndefinedProperties: true });

  console.log('✅ Firebase Firestore connected — collection: sensor_readings');
} catch (err) {
  console.warn('\n⚠️  Firebase not configured — running in DEMO MODE (in-memory storage)');
  console.warn('   Sensor data will not persist between restarts.');
  console.warn('   To enable Firebase: add serviceAccountKey.json or set FIREBASE_CONFIG\n');
}

module.exports = { admin, db };

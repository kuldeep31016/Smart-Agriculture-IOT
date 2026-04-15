/**
 * Firebase Admin SDK initialization for the backend.
 */

const admin = require('firebase-admin');

let db = null;

try {
  let credential;

  if (process.env.FIREBASE_CONFIG) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
    credential = admin.credential.cert(serviceAccount);
    console.log('🔑 Firebase: loading credentials from FIREBASE_CONFIG env var');
  } else {
    const serviceAccount = require('../../serviceAccountKey.json');
    credential = admin.credential.cert(serviceAccount);
    console.log('🔑 Firebase: loading credentials from serviceAccountKey.json');
  }

  if (!admin.apps.length) {
    admin.initializeApp({ credential });
  }

  db = admin.firestore();
  db.settings({ ignoreUndefinedProperties: true });

  console.log('✅ Firebase Firestore connected — collection: sensor_readings');
} catch (err) {
  console.warn('\n⚠️  Firebase not configured — running in DEMO MODE (in-memory storage)');
  console.warn('   Sensor data will not persist between restarts.');
  console.warn('   To enable Firebase: add serviceAccountKey.json or set FIREBASE_CONFIG\n');
}

module.exports = { admin, db };

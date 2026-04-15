// Cloud Layer: Firebase Admin SDK initialization
// Problem Statement 7: Cloud Storage component
// Supports two credential methods:
//   Option A (recommended): Set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL in .env
//   Option B (legacy):      Place serviceAccountKey.json in this folder, or set FIREBASE_CONFIG env var

const admin = require('firebase-admin');

let db = null;

try {
  let credential;

  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    // Option A: individual env vars (recommended for .env setup)
    credential = admin.credential.cert({
      type:         'service_account',
      project_id:   process.env.FIREBASE_PROJECT_ID,
      private_key:  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    });
    console.log('🔑 Firebase: credentials loaded from env vars');

  } else if (process.env.FIREBASE_CONFIG) {
    // Option B-1: full JSON in env var
    credential = admin.credential.cert(JSON.parse(process.env.FIREBASE_CONFIG));
    console.log('🔑 Firebase: credentials loaded from FIREBASE_CONFIG');

  } else {
    // Option B-2: local serviceAccountKey.json file
    const serviceAccount = require('./serviceAccountKey.json');
    credential = admin.credential.cert(serviceAccount);
    console.log('🔑 Firebase: credentials loaded from serviceAccountKey.json');
  }

  if (!admin.apps.length) {
    admin.initializeApp({ credential });
  }

  db = admin.firestore();
  db.settings({ ignoreUndefinedProperties: true });
  console.log('✅  Firebase Firestore connected — collection: sensor_readings');

} catch (err) {
  console.warn('\n⚠️  Firebase not configured — running in DEMO MODE (in-memory storage)');
  console.warn('   Sensor data will NOT persist between restarts.');
  console.warn('   To enable Firebase, set in .env:');
  console.warn('     FIREBASE_PROJECT_ID=your-project-id');
  console.warn('     FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com');
  console.warn('     FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"\n');
}

module.exports = { admin, db };

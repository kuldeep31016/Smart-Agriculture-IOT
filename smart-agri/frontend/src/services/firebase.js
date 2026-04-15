// Cloud Layer: Firebase SDK for direct Firestore access
// Problem Statement 7: Cloud Storage component
// Used for real-time reads when bypassing the backend is preferred

import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore, collection, getDocs,
  query, orderBy, limit as firestoreLimit,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey:    import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

let db = null;

try {
  if (firebaseConfig.projectId && firebaseConfig.projectId !== 'your_project_id') {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
} catch (e) {
  console.warn('Firebase SDK not initialised:', e.message);
}

// Get latest single reading
export const getLatestReading = async () => {
  if (!db) return null;
  const q = query(
    collection(db, 'sensor_readings'),
    orderBy('timestamp', 'desc'),
    firestoreLimit(1),
  );
  const snapshot = await getDocs(q);
  const doc = snapshot.docs[0];
  if (!doc) return null;
  return {
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate?.()?.toISOString(),
  };
};

// Get last N readings (newest first)
export const getReadings = async (count = 20) => {
  if (!db) return [];
  const q = query(
    collection(db, 'sensor_readings'),
    orderBy('timestamp', 'desc'),
    firestoreLimit(count),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate?.()?.toISOString(),
  }));
};

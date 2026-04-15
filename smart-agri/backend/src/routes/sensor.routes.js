const express = require('express');
const router = express.Router();

let db = null;
let admin = null;
try {
  const firebase = require('../config/firebase');
  db = firebase.db;
  admin = firebase.admin;
} catch (e) {
  console.warn('Firebase module error:', e.message);
}

const inMemoryStore = [];
const MAX_STORE = 100;
let hasLiveData = false;

function coerceNumber(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function normalizeSensorReading(body = {}) {
  const temperature = coerceNumber(body.temperature ?? body.temp ?? body.t);
  const humidity = coerceNumber(body.humidity ?? body.hum ?? body.rh ?? body.h);
  const moisture = coerceNumber(
    body.moisture ?? body.soil ?? body.soil_moisture ?? body.soilMoisture ?? body.sm ?? body.moist
  );

  return { temperature, humidity, moisture };
}

function getLatestInMemoryReading() {
  if (inMemoryStore.length === 0) return null;
  return hasLiveData ? inMemoryStore[0] : inMemoryStore[inMemoryStore.length - 1];
}

function seedDemoData() {
  const now = Date.now();
  for (let i = 19; i >= 0; i--) {
    inMemoryStore.push({
      id: `demo_${i}`,
      temperature: parseFloat((24 + Math.sin(i * 0.5) * 6).toFixed(1)),
      humidity: parseFloat((55 + Math.cos(i * 0.4) * 15).toFixed(1)),
      moisture: parseFloat((45 + Math.sin(i * 0.3 + 1) * 20).toFixed(1)),
      timestamp: new Date(now - i * 12000).toISOString(),
    });
  }
}
seedDemoData();

router.post('/sensor-data', async (req, res) => {
  try {
    const { temperature, humidity, moisture } = normalizeSensorReading(req.body);

    if (temperature === undefined || humidity === undefined || moisture === undefined) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['temperature', 'humidity', 'moisture'],
        received: req.body,
      });
    }

    const reading = {
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
      moisture: parseFloat(moisture),
      timestamp: new Date().toISOString(),
    };

    if (db) {
      const docRef = await db.collection('sensor_readings').add({
        ...reading,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      return res.status(201).json({
        id: docRef.id,
        ...reading,
        storage: 'firebase',
      });
    }

    if (!hasLiveData) {
      // Remove seeded demo values as soon as first real sensor reading arrives.
      inMemoryStore.length = 0;
      hasLiveData = true;
    }

    reading.id = `local_${Date.now()}`;
    inMemoryStore.unshift(reading);
    if (inMemoryStore.length > MAX_STORE) inMemoryStore.pop();
    return res.status(201).json({
      ...reading,
      storage: 'memory (demo mode)',
    });
  } catch (error) {
    console.error('Error saving sensor data:', error);
    res.status(500).json({ error: 'Failed to save sensor data', details: error.message });
  }
});

router.get('/sensor-data', async (_req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    if (db) {
      const snapshot = await db
        .collection('sensor_readings')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      const doc = snapshot.docs[0];
      const reading = doc
        ? {
            id: doc.id,
            temperature: doc.data().temperature,
            humidity: doc.data().humidity,
            moisture: doc.data().moisture ?? doc.data().soil ?? doc.data().soil_moisture ?? doc.data().soilMoisture ?? doc.data().sm,
            timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
          }
        : null;

      return res.json(reading);
    }

    return res.json(getLatestInMemoryReading());
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).json({ error: 'Failed to fetch sensor data', details: error.message });
  }
});

module.exports = router;

// IoT Layer: Sensor data endpoints
// Problem Statement 7: IoT component
// Receives data from ESP32 via Python serial reader and stores in Firebase Cloud
//
// POST /api/sensor-data  — IoT device pushes readings here
// GET  /api/sensor-data?limit=N — Dashboard fetches history here

const express = require('express');
const router  = express.Router();
const { db, admin } = require('../firebase');
const SENSOR_COLLECTION = 'sensor_readings';

// ── In-memory fallback (runs when Firebase is not configured) ─────────────────
const inMemoryStore = [];
let hasLiveData = false;

function seedDemoData() {
  const now = Date.now();
  for (let i = 19; i >= 0; i--) {
    inMemoryStore.push({
      id:          `demo_${i}`,
      temperature: parseFloat((24 + Math.sin(i * 0.5) * 6).toFixed(1)),
      humidity:    parseFloat((55 + Math.cos(i * 0.4) * 15).toFixed(1)),
      moisture:    parseFloat((45 + Math.sin(i * 0.3 + 1) * 20).toFixed(1)),
      timestamp:   new Date(now - i * 12000).toISOString(),
    });
  }
}
seedDemoData();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/sensor-data
// Body: { temperature, humidity, moisture }  (also accepts: temp, hum, soil, etc.)
// Called by: Python main.py (reads from ESP32 DHT11 + soil moisture sensor)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/sensor-data', async (req, res) => {
  try {
    // Normalize field name aliases from Python sender
    const temperature = parseFloat(req.body.temperature ?? req.body.temp ?? req.body.t);
    const humidity    = parseFloat(req.body.humidity    ?? req.body.hum  ?? req.body.rh ?? req.body.h);
    const moisture    = parseFloat(
      req.body.moisture ?? req.body.soil ?? req.body.soil_moisture ??
      req.body.soilMoisture ?? req.body.sm ?? req.body.moist
    );

    if ([temperature, humidity, moisture].some(v => isNaN(v))) {
      return res.status(400).json({
        error:    'Missing or invalid fields',
        required: ['temperature', 'humidity', 'moisture'],
        received: req.body,
      });
    }

    const sensorTimestamp = req.body.timestamp
      ? new Date(req.body.timestamp)
      : new Date();

    const reading = {
      temperature: parseFloat(temperature.toFixed(1)),
      humidity:    parseFloat(humidity.toFixed(1)),
      moisture:    parseFloat(moisture.toFixed(1)),
      timestamp:   (isNaN(sensorTimestamp.getTime()) ? new Date() : sensorTimestamp).toISOString(),
    };

    // Cloud Storage: save to Firebase Firestore
    if (db) {
      const docRef = await db.collection(SENSOR_COLLECTION).add({
        temperature: reading.temperature,
        humidity: reading.humidity,
        moisture: reading.moisture,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        sensorTimestamp: reading.timestamp,
      });
      return res.status(201).json({ success: true, id: docRef.id, ...reading, storage: 'firebase' });
    }

    // Demo mode: in-memory store
    if (!hasLiveData) {
      inMemoryStore.length = 0; // clear seeded demo data on first real reading
      hasLiveData = true;
    }
    reading.id = `local_${Date.now()}`;
    inMemoryStore.unshift(reading);
    if (inMemoryStore.length > 100) inMemoryStore.pop();
    return res.status(201).json({ success: true, ...reading, storage: 'memory (demo)' });

  } catch (error) {
    console.error('POST /sensor-data error:', error);
    res.status(500).json({ error: 'Failed to save sensor data', details: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/sensor-data?limit=20
// Returns array of readings ordered newest → oldest
// Called by: React Dashboard (auto-refreshes every 10s) and Alerts page
// ─────────────────────────────────────────────────────────────────────────────
router.get('/sensor-data', async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    if (db) {
      const snapshot = await db
        .collection(SENSOR_COLLECTION)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();

      const readings = snapshot.docs.map(doc => ({
        id:          doc.id,
        temperature: doc.data().temperature,
        humidity:    doc.data().humidity,
        moisture:    doc.data().moisture ?? doc.data().soil,
        timestamp:   doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().sensorTimestamp || new Date().toISOString(),
      }));
      return res.json(readings);
    }

    // Demo mode
    const data = hasLiveData
      ? inMemoryStore.slice(0, limit)
      : [...inMemoryStore].slice(0, limit);
    return res.json(data);

  } catch (error) {
    console.error('GET /sensor-data error:', error);
    res.status(500).json({ error: 'Failed to fetch sensor data', details: error.message });
  }
});

module.exports = router;

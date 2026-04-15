/**
 * routes/sensor.js — IoT Sensor Data Endpoints
 *
 * Receives data from the Python IoT script (ESP32 + DHT11 + Moisture sensor)
 * and stores it in Firebase Firestore (Cloud layer).
 *
 * Routes:
 *   POST /api/sensor-data  — receive & store a new sensor reading
 *   GET  /api/sensor-data  — retrieve last 20 readings
 */

const express = require('express');
const router  = express.Router();

// ── Firebase (Cloud storage) ──────────────────────────────────────────────────
let db   = null;
let admin = null;
try {
  const firebase = require('../firebase');
  db    = firebase.db;
  admin = firebase.admin;
} catch (e) {
  console.warn('Firebase module error:', e.message);
}

// ── In-memory fallback (demo mode when Firebase is not configured) ─────────────
const inMemoryStore = [];
const MAX_STORE     = 100;

// Seed demo data so the dashboard looks populated immediately
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
// Body: { temperature, humidity, moisture }
// Called by: Python iot_sender.py (which reads from ESP32 via serial)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/sensor-data', async (req, res) => {
  try {
    const { temperature, humidity, moisture } = req.body;

    // Validate input
    if (temperature === undefined || humidity === undefined || moisture === undefined) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['temperature', 'humidity', 'moisture'],
      });
    }

    const reading = {
      temperature: parseFloat(temperature),
      humidity:    parseFloat(humidity),
      moisture:    parseFloat(moisture),
      timestamp:   new Date().toISOString(),
    };

    if (db) {
      // ── Save to Firebase Firestore (Cloud layer) ──────────────────────────
      const docRef = await db.collection('sensor_readings').add({
        ...reading,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      return res.status(201).json({
        id:      docRef.id,
        ...reading,
        storage: 'firebase',
      });
    } else {
      // ── Fallback: in-memory store ─────────────────────────────────────────
      reading.id = `local_${Date.now()}`;
      inMemoryStore.unshift(reading);
      if (inMemoryStore.length > MAX_STORE) inMemoryStore.pop();
      return res.status(201).json({
        ...reading,
        storage: 'memory (demo mode)',
      });
    }
  } catch (error) {
    console.error('Error saving sensor data:', error);
    res.status(500).json({ error: 'Failed to save sensor data', details: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/sensor-data
// Returns last 20 readings ordered by timestamp descending
// Called by: React Dashboard (auto-refreshes every 10s)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/sensor-data', async (req, res) => {
  try {
    if (db) {
      // ── Fetch from Firebase Firestore ─────────────────────────────────────
      const snapshot = await db
        .collection('sensor_readings')
        .orderBy('timestamp', 'desc')
        .limit(20)
        .get();

      const readings = snapshot.docs.map((doc) => ({
        id:          doc.id,
        temperature: doc.data().temperature,
        humidity:    doc.data().humidity,
        moisture:    doc.data().moisture,
        timestamp:   doc.data().timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
      }));

      return res.json(readings);
    } else {
      // ── Return from in-memory store ───────────────────────────────────────
      return res.json(inMemoryStore.slice(0, 20));
    }
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).json({ error: 'Failed to fetch sensor data', details: error.message });
  }
});

module.exports = router;

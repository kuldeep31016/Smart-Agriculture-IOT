// AgriSense Backend v2.0
// Problem Statement 7: IoT + Cloud + Deep Learning based Smart Agriculture
// ─────────────────────────────────────────────────────────────────────────────
// IoT Layer    → receives sensor data from ESP32 via Python (main.py)
// Cloud Layer  → stores readings in Firebase Firestore (or in-memory demo)
// AI Layer     → proxies prompts to Google Gemini 2.0 Flash
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const sensorRoutes = require('./routes/sensor'); // IoT sensor data endpoints
const geminiRoutes = require('./routes/gemini'); // Gemini AI proxy endpoints

const app = express();

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

app.use('/api', sensorRoutes);
app.use('/api', geminiRoutes);

app.get('/', (_req, res) => {
  res.json({
    app: '🌾 AgriSense Backend',
    version: '2.0.0',
    status: 'running',
    endpoints: {
      post_sensor: 'POST /api/sensor-data',
      get_sensor:  'GET  /api/sensor-data?limit=20',
      gemini_ai:   'POST /api/gemini',
    },
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log('\n─────────────────────────────────────────');
  console.log('  🌾  AgriSense Backend v2.0');
  console.log(`  📡  http://localhost:${PORT}`);
  console.log('  🤖  Gemini AI proxy: /api/gemini');
  console.log('─────────────────────────────────────────\n');
});

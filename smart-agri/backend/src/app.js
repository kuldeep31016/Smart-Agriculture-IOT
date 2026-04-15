const express = require('express');
const cors = require('cors');
const sensorRoutes = require('./routes/sensor.routes');
const predictRoutes = require('./routes/predict.routes');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use((req, _res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
    next();
  });

  app.use('/api', sensorRoutes);
  app.use('/api', predictRoutes);

  app.get('/', (_req, res) => {
    res.json({
      app: '🌾 AgriSense Backend',
      status: 'running',
      version: '1.0.0',
      endpoints: {
        post_sensor: 'POST /api/sensor-data',
        get_sensor: 'GET /api/sensor-data',
        predict: 'POST /api/predict',
      },
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}

module.exports = { createApp };
